import * as SQLite from 'expo-sqlite';
import { Area, Article, ArticleRecordRaw } from '../data/Location';


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
        `)


    }
    catch (error) {
        console.error(error);
    }
}

export const dbService = {
    getAreas: async (db: SQLite.SQLiteDatabase): Promise<Area[]> => {
        return await db.getAllAsync<Area>(`
            SELECT t.id, t.name, t.article_url as articleUrl, t.thumbnail_url as thumbnailUrl, t.country, t.discovered_at as discoveredAt, COUNT(a.id) as collectedCount
            FROM areas t
            LEFT JOIN articles a ON t.id = a.area_id
            GROUP BY t.id
        `);
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
            SELECT id, name, article_url as articleUrl, area_id as parentId, latitude, longitude, collected_at as collectedAt
            FROM articles
            WHERE area_id = ?
        `, [areaId]);

        return mapRawRecordsToRegular(rows);
    },

    tryDiscoverArea: async (db: SQLite.SQLiteDatabase, area: Area) => {
        const result = await db.runAsync('INSERT OR IGNORE INTO areas (id, name, article_url, thumbnail_url, country) VALUES(?, ?, ?, ?, ?)',
            [area.id, area.name, area.articleUrl ?? '-1', area.thumbnailUrl ?? '-1', area.country]
        )
        console.log(result.lastInsertRowId, result.changes);
    },

    tryDiscoverArticle: async (db: SQLite.SQLiteDatabase, article: Article) => {
        const result = await db.runAsync('INSERT OR IGNORE INTO articles (id, name, article_url, thumbnail_url, area_id, latitude, longitude) VALUES(?, ?, ?, ?, ?, ?, ?)',
            [article.id, article.name, article.articleUrl, article.thumbnailUrl, article.parentId, article.coords.latitude, article.coords.longitude]
        )
        console.log(result.lastInsertRowId, result.changes);
    },

    tryCollectArticle: async (db: SQLite.SQLiteDatabase, article: Article) => {
        await dbService.tryDiscoverArticle(db, article);

        await db.runAsync('UPDATE articles SET collected_at = CURRENT_TIMESTAMP WHERE id = ? AND collected_at IS NULL',
            [article.id]
        )
    },
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