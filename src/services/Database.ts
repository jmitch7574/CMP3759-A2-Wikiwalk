import * as SQLite from 'expo-sqlite';
import { Area, Article, ArticleRecordRaw } from '../data/Location';
import { TROPHIES, Trophy, TrophyTracker } from '../data/Trophies';


export const initDatabase = async (db: SQLite.SQLiteDatabase) => {

    // NOTE: areas table exists as a record of discovered areas, since there is no case where an area will be undiscovered
    //       articles is not the same

    try {

        await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS areas (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            article_url TEXT NOT NULL,
            thumbnail_url TEXT,
            country TEXT NOT NULL,
            type TEXT NOT NULL,
            discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            article_url TEXT NOT NULL,
            thumbnail_url TEXT,
            area_id TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            collected_at DATETIME,

            FOREIGN KEY (area_id) REFERENCES areas (id)
        );

        CREATE TABLE IF NOT EXISTS user_trophies (
            id TEXT PRIMARY KEY NOT NULL,
            value INTEGER NOT NULL,
            completed_at DATETIME
        );
        `)


    }
    catch (error) {
        console.error(error);
    }
}

export const dbService = {
    getAreas: async (db: SQLite.SQLiteDatabase): Promise<Area[]> => {
        return await db.getAllAsync<Area>(`
            SELECT t.id, t.name, t.article_url as articleUrl, t.thumbnail_url as thumbnailUrl, t.type, t.country, t.discovered_at as discoveredAt, COUNT(a.id) as totalCount, COUNT(a.collected_at) as collectedCount
            FROM areas t
            LEFT JOIN articles a ON t.id = a.area_id
            GROUP BY t.id
        `);
    },

    getArea: async (db: SQLite.SQLiteDatabase, areaID: string): Promise<Area | null> => {
        return await db.getFirstAsync<Area>(`
            SELECT t.id, t.name, t.article_url as articleUrl, t.thumbnail_url as thumbnailUrl, t.type, t.country, t.discovered_at as discoveredAt, COUNT(a.id) as totalCount, COUNT(a.collected_at) as collectedCount
            FROM areas t
            LEFT JOIN articles a ON t.id = a.area_id
            WHERE t.id = ?
            GROUP BY t.id
        `, [areaID]);
    },

    getArticles: async (db: SQLite.SQLiteDatabase): Promise<Article[]> => {
        const rows = await db.getAllAsync<ArticleRecordRaw>(`
            SELECT id, name, article_url as articleUrl, thumbnail_url as thumbnailUrl, area_id as parentId, latitude, longitude, collected_at as collectedAt
            FROM articles
        `);

        return mapRawRecordsToRegular(rows);
    },

    getArticlesCollected: async (db: SQLite.SQLiteDatabase): Promise<Article[]> => {
        const rows = await db.getAllAsync<ArticleRecordRaw>(`
            SELECT id, name, article_url as articleUrl, thumbnail_url as thumbnailUrl, area_id as parentId, latitude, longitude, collected_at as collectedAt
            FROM articles
            WHERE collected_at IS NOT NULL
        `);

        return mapRawRecordsToRegular(rows);
    },

    getArticlesByArea: async (db: SQLite.SQLiteDatabase, areaId: string): Promise<Article[]> => {
        const rows = await db.getAllAsync<ArticleRecordRaw>(`
            SELECT id, name, article_url as articleUrl, thumbnail_url as thumbnailUrl, area_id as parentId, latitude, longitude, collected_at as collectedAt
            FROM articles
            WHERE area_id = ?
        `, [areaId]);

        return mapRawRecordsToRegular(rows);
    },

    tryDiscoverArea: async (db: SQLite.SQLiteDatabase, area: Area) => {
        const result = await db.runAsync('INSERT OR IGNORE INTO areas (id, name, article_url, thumbnail_url, type, country) VALUES(?, ?, ?, ?, ?, ?)',
            [area.id, area.name, area.articleUrl ?? '-1', area.thumbnailUrl ?? '-1', area.type, area.country]
        )
        console.log(result.lastInsertRowId, result.changes);
    },

    tryDiscoverArticles: async (db: SQLite.SQLiteDatabase, articles: Article[]) => {

        await db.withTransactionAsync(async () => {
            for (const article of articles) {
                await db.runAsync('INSERT OR IGNORE INTO articles (id, name, article_url, thumbnail_url, area_id, latitude, longitude) VALUES(?, ?, ?, ?, ?, ?, ?)',
                    [article.id, article.name, article.articleUrl, article.thumbnailUrl, article.parentId, article.coords.latitude, article.coords.longitude]
                )
            }
        });
    },

    tryCollectArticle: async (db: SQLite.SQLiteDatabase, article: Article) => {
        await dbService.tryDiscoverArticles(db, [article]);

        await db.runAsync('UPDATE articles SET collected_at = CURRENT_TIMESTAMP WHERE id = ? AND collected_at IS NULL',
            [article.id]
        )
    },


    // Trophy Functions

    updateTrophyCategoryCollectArticles: async (db: SQLite.SQLiteDatabase) => {
        const countQuery = 'SELECT COUNT(collected_at) FROM articles';
        const matchingTrophies = TROPHIES.filter(t => t.requirement_type === 'collect_articles');

        await db.withTransactionAsync(async () => {
            for (const trophy of matchingTrophies) {
                await db.runAsync(`
                    INSERT INTO user_trophies (id, value) 
                    VALUES (?, (${countQuery})) 
                    ON CONFLICT(id) DO UPDATE SET value = (${countQuery})`,
                    [trophy.id]
                );
            }
        });
    },

    updateTrophyCategoryDiscoverAreas: async (db: SQLite.SQLiteDatabase) => {
        const countQuery = 'SELECT COUNT(*) FROM areas';
        const matchingTrophies = TROPHIES.filter(t => t.requirement_type === 'discover_areas');

        await db.withTransactionAsync(async () => {
            for (const trophy of matchingTrophies) {
                await db.runAsync(`
                    INSERT INTO user_trophies (id, value) 
                    VALUES (?, (${countQuery})) 
                    ON CONFLICT(id) DO UPDATE SET value = (${countQuery})`,
                    [trophy.id]
                );
            }
        });
    },

    updateTrophyCategoryCompleteAreas: async (db: SQLite.SQLiteDatabase) => {
        const countQuery = `
            SELECT COUNT(*) 
            FROM areas a
            WHERE (SELECT COUNT(*) FROM articles WHERE area_id = a.id) > 0
            AND NOT EXISTS (SELECT 1 FROM articles art WHERE art.area_id = a.id AND art.collected_at IS NULL)`;

        const matchingTrophies = TROPHIES.filter(t => t.requirement_type === 'complete_areas');

        await db.withTransactionAsync(async () => {
            for (const trophy of matchingTrophies) {
                await db.runAsync(`
                    INSERT INTO user_trophies (id, value) 
                    VALUES (?, (${countQuery})) 
                    ON CONFLICT(id) DO UPDATE SET value = (${countQuery})`,
                    [trophy.id]
                );
            }
        });
    },

    updateTrophyCategorySpecial: async (db: SQLite.SQLiteDatabase) => {
        const types = ['village', 'city', 'town'];

        await db.withTransactionAsync(async () => {
            for (const type of types) {
                const countQuery = `
                    SELECT COUNT(*) 
                    FROM areas a 
                    WHERE a.type = "${type}"
                    AND (SELECT COUNT(*) FROM articles WHERE area_id = a.id) > 0
                    AND NOT EXISTS (
                        SELECT 1 FROM articles art 
                        WHERE art.area_id = a.id AND art.collected_at IS NULL
                    )`;

                const matchingTrophies = TROPHIES.filter(t => t.requirement_type === `complete_${type}`);

                for (const trophy of matchingTrophies) {
                    await db.runAsync(`
                        INSERT INTO user_trophies (id, value) 
                        VALUES (?, (${countQuery})) 
                        ON CONFLICT(id) DO UPDATE SET value = (${countQuery})`,
                        [trophy.id]
                    );
                }
            }
        });
    },

    checkTrophyCompletion: async (db: SQLite.SQLiteDatabase): Promise<Trophy[]> => {
        let justUnlockedTrophies: Trophy[] = [];

        await db.withTransactionAsync(async () => {
            for (const trophy of TROPHIES) {
                const trophyToUnlock = await db.getFirstAsync<TrophyTracker[]>(`SELECT * FROM user_trophies WHERE id = ? AND value >= ? AND completed_at IS NULL`, [trophy.id, trophy.requirement_value]);

                if (trophyToUnlock) {
                    justUnlockedTrophies.push(trophy);
                    await db.runAsync(`UPDATE user_trophies SET completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [trophy.id])
                }
            }
        });

        return justUnlockedTrophies;
    },

    getTrophyProgress: async (db: SQLite.SQLiteDatabase): Promise<TrophyTracker[]> => {
        return await db.getAllAsync<TrophyTracker>(`SELECT id, value, completed_at as completedAt FROM user_trophies`);
    }

}

function mapRawRecordsToRegular(rawRecords: ArticleRecordRaw[]): Article[] {
    return rawRecords.map(row => ({
        id: row.id,
        name: row.name,
        articleUrl: row.articleUrl,
        thumbnailUrl: row.thumbnailUrl,
        parentId: row.parentId,
        coords: {
            latitude: row.latitude,
            longitude: row.longitude
        },
        collectedAt: row.collectedAt ? new Date(row.collectedAt) : null
    }))
}