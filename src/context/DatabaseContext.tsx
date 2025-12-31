import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { dbService, initDatabase } from '../services/Database';
import { Area, Article } from '../data/Location';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

interface DatabaseContextType {
    discoverArea: (area: Area) => Promise<void>;
    discoverArticle: (article: Article) => Promise<void>;
    claimArticle: (article: Article) => Promise<void>;
    isArticleCollected: (id: string) => boolean;
    getArticlesForArea: (areaId: string) => Promise<Article[]>;
    getFullAreaInfo: (areaId: string) => Promise<Area | null>;
    collectedIds: Set<string>
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }) {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
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
            const database = await SQLite.openDatabaseAsync('test2.db');
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
    }, [db]);

    const discoverArea = async (area: Area) => {
        try {
            if (!db) return;
            await dbService.tryDiscoverArea(db, area);
        }
        catch (error) {
            console.error(error);
        }
    }

    const getFullAreaInfo = async (areaId: string) => {
        if (!db) return null;
        return await dbService.getArea(db, areaId);
    }

    const discoverArticle = async (article: Article) => {
        try {
            if (!db) return;
            await dbService.tryDiscoverArticle(db, article);
            await refreshCollectedIds();
        }
        catch (error) {
            console.error(error);
        }
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
    };

    const isArticleCollected = (id: string) => {
        console.log(collectedIds, collectedIds.has(id));
        return collectedIds.has(id);
    }

    const getArticlesForArea = async (areaId: string) => {
        if (!db) return [];
        return await dbService.getArticlesByArea(db, areaId);
    };

    return (
        <DatabaseContext.Provider value={{
            discoverArea,
            discoverArticle,
            claimArticle,
            isArticleCollected,
            getArticlesForArea,
            getFullAreaInfo,
            collectedIds
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