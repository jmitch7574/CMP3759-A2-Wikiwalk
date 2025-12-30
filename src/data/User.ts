import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from './Location';


/**
 * 
 * Stores data relative to the user's progress
 * 
 */
export class User {
    /**
     * Locations that have appeared on the user's map at least once.
     */
    halfCollectedArticles: ArticleCollection = new ArticleCollection();
    /**
     * Locations that have been viewed by the user while in range.
     */
    collectedArticles: ArticleCollection = new ArticleCollection();

    /**
     * Adds an article to the user's half collected articles if it is not already added
     * @param article The article to add
     */
    public AddHalfArticle(article: Article) {
        this.halfCollectedArticles.AddArticle(article)
    }

    /**
     * Adds an article to the user's collected articles if it is not already added
     * @param article The article to add
     */
    public AddArticle(article: Article) {
        this.collectedArticles.AddArticle(article)
    }

    /**
     * Check if the user has already fully collected a given article
     * @param article The article to check
     * @returns true if the user has the article collected, false otherwise
     */
    public IsArticleDiscovered(article: Article) {
        return this.collectedArticles.IsIdPresent(article.id);
    }

    public async Save(): Promise<boolean> {
        try {
            await AsyncStorage.setItem('my-key', JSON.stringify(this));
        } catch (e) {
            return false;
        }

        return true;
    }

    public async Load(): Promise<boolean> {
        try {
            const jsonValue = await AsyncStorage.getItem('my-key');

            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
        }
    };
}

/**
 * Data structure representing a collection of articles
 */
class ArticleCollection {
    collection: Article[] = []

    /**
     * Get all IDs in this collection
     * @returns String array of all IDs
     */
    public GetIDs(): string[] {
        return this.collection.map(x => x.id);
    }

    /**
     * Check if an article with a given ID is present
     * @param id ID of the article to check
     * @returns true if article exists, false otherwise
     */
    public IsIdPresent(id: string): boolean {
        return this.GetIDs().includes(id);
    }

    /**
     * Adds an article to collection if it doesn't already exist
     * @param article The article to add
     * @returns true if article was added successfully, false if article already exists in collection
     */
    public AddArticle(article: Article): boolean {
        if (this.IsIdPresent(article.id)) {
            return false
        }

        this.collection.push(article);
        return true
    }
}

const storeUser = async (value) => {
};