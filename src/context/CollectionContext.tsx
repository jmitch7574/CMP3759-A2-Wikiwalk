import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { dbService, initDatabase } from '../services/Database';
import { Area, Article } from '../data/Location';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

interface CollectionContextType {
    discoverArea: (area: Area) => Promise<void>;
    discoverArticle: (article: Article) => Promise<void>;
    claimArticle: (article: Article) => Promise<void>;
    isArticleCollected: (id: string) => boolean;
    getArticlesForArea: (areaId: string) => Promise<Article[]>;
    collectedIds: Set<string>
}

export const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }) {
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
            await refreshCollectedIds();
        };
        setup();
    }, []);

    const discoverArea = async (area: Area) => {
        try {
            if (!db) return;
            await dbService.tryDiscoverArea(db, area);
        }
        catch (error) {
            console.error(error);
        }
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

    const isArticleCollected = (id: string) => collectedIds.has(id);

    const getArticlesForArea = async (areaId: string) => {
        if (!db) return [];
        return await dbService.getArticlesByArea(db, areaId);
    };

    return (
        <CollectionContext.Provider value={{
            discoverArea,
            discoverArticle,
            claimArticle,
            isArticleCollected,
            getArticlesForArea,
            collectedIds
        }}>
            {children}
        </CollectionContext.Provider>
    );
};

export const useCollection = () => {
    const context = useContext(CollectionContext);
    if (!context) throw new Error('useCollection must be used within a CollectionProvider');
    return context;
};