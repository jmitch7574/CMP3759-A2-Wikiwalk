import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { dbService, initDatabase } from '../services/Database';
import { Area, Article } from '../data/Location';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { TrophyTracker } from '../data/Trophies';
import Toast from 'react-native-toast-message';

interface DatabaseContextType {
    discoverArea: (area: Area) => Promise<void>;
    discoverArticles: (articles: Article[]) => Promise<void>;
    claimArticle: (article: Article) => Promise<void>;
    isArticleCollected: (id: string) => boolean;
    getArticlesForArea: (areaId: string) => Promise<Article[]>;
    getAreas: () => Promise<Area[]>;
    getFullAreaInfo: (areaId: string) => Promise<Area | null>;
    updateTrophies: () => Promise<void>;
    getTrophyProgress: (trophyId: string) => TrophyTracker | null;
    collectedIds: Set<string>;
    trophyProgress: Map<string, TrophyTracker>;
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }) {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
    const [trophyProgress, setTrophyProgress] = useState<Map<string, TrophyTracker>>(new Map());

    useDrizzleStudio(db);

    const refreshCollectedIds = async () => {
        if (!db) return;
        const result = await dbService.getArticlesCollected(db);
        setCollectedIds(new Set(result.map(a => a.id)));
    };

    // Initialize DB
    useEffect(() => {
        const setup = async () => {
            console.log('Setting up DB');
            const database = await SQLite.openDatabaseAsync('test8.db');
            console.log("DB Opened")
            await initDatabase(database);
            console.log("DB Initialized")
            setDb(database);
        };
        setup();
    }, []);

    useEffect(() => {
        if (!db) return;
        refreshCollectedIds();
        updateTrophies();
    }, [db]);

    const discoverArea = async (area: Area) => {
        try {
            if (!db) return;
            await dbService.tryDiscoverArea(db, area);
        }
        catch (error) {
            console.error(error);
        }
        await updateTrophies();
    }

    const getFullAreaInfo = async (areaId: string) => {
        if (!db) return null;
        return await dbService.getArea(db, areaId);
    }

    const discoverArticles = async (articles: Article[]) => {
        try {
            if (!db) return;
            await dbService.tryDiscoverArticles(db, articles);
            await refreshCollectedIds();
        }
        catch (error) {
            console.error(error);
        }
        await updateTrophies();
    };

    const claimArticle = async (article: Article) => {
        try {
            if (!db) return;
            await dbService.tryCollectArticle(db, article);
            await refreshCollectedIds();
        }
        catch (error) {
            console.error(error);
        }
        await updateTrophies();
    };

    const isArticleCollected = (id: string) => {
        return collectedIds.has(id);
    }

    const getArticlesForArea = async (areaId: string) => {
        if (!db) return [];
        return await dbService.getArticlesByArea(db, areaId);
    };

    const getAreas = async () => {
        if (!db) return [];
        return await dbService.getAreas(db);
    }

    const updateTrophies = async () => {
        if (!db) return;
        await dbService.updateTrophyCategoryCollectArticles(db);
        await dbService.updateTrophyCategoryCompleteAreas(db);
        await dbService.updateTrophyCategoryDiscoverAreas(db);
        await dbService.updateTrophyCategorySpecial(db);

        const justUnlockedTrophies = await dbService.checkTrophyCompletion(db);

        if (justUnlockedTrophies.length > 0) {
            const showExtendedTooltip = justUnlockedTrophies.length > 1;

            Toast.show({
                type: 'info',
                text1: `Trophy Unlocked`,
                text2: `${justUnlockedTrophies[0].title} ${showExtendedTooltip ? `and ${justUnlockedTrophies.length - 1} others...` : ''}`,
                position: 'bottom',
                visibilityTime: 8000
            })


        }

        if (justUnlockedTrophies.length == 1) {
        }

        if (justUnlockedTrophies.length > 1) {
            Toast.show({
                type: 'info',
                text1: 'New Trophies unlocked',
                text2: `${justUnlockedTrophies[0].title} and ${justUnlockedTrophies.length - 1} others...`,
                position: 'bottom',
                visibilityTime: 8000
            })
        }

        // Convert trophy progress array to hashmap for quick lookups later
        const trophyProgressArray = await dbService.getTrophyProgress(db);
        setTrophyProgress(new Map(trophyProgressArray.map(i => [i.id, i])));
    }

    const getTrophyProgress = (trophyId: string) => trophyProgress.get(trophyId) ?? null;



    return (
        <DatabaseContext.Provider value={{
            discoverArea,
            discoverArticles,
            claimArticle,
            isArticleCollected,
            getArticlesForArea,
            getFullAreaInfo,
            getAreas,
            updateTrophies,
            getTrophyProgress,
            collectedIds,
            trophyProgress
        }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) throw new Error('useDatabase must be used within a DatabaseProvider');
    return context;
};