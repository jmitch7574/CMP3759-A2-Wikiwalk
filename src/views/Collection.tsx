import { StyleSheet, View } from "react-native";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { Area, Article } from "../data/Location";
import { FlatList } from "react-native-gesture-handler";
import ArticlePopup, { ArticlePopupContext } from "../components/ArticlePopup";
import CollectionAreaCarousel from "../components/CollectionAreaCarousel";

export const focusArticleContext = createContext<((context: ArticlePopupContext) => void) | undefined>(undefined); 44


export default function CollectionView() {
    const [areas, setAreas] = useState<Area[] | null>(null);
    const Database = useContext(DatabaseContext);

    const [focusedArticle, setFocusedArticle] = useState<ArticlePopupContext | null>(null);

    useEffect(() => {
        if (!Database) return;

        const LoadCollection = async () => {
            setAreas(await Database.getAreas());
        }

        LoadCollection();
    }, [])

    return (
        <focusArticleContext.Provider value={(context: ArticlePopupContext) => setFocusedArticle(context)}>
            <View style={styles.container}>
                {areas && (
                    <FlatList
                        data={areas}
                        renderItem={(area) => <CollectionAreaCarousel area={area.item} />}
                        keyExtractor={(item) => item.id}>
                    </FlatList>)}


                {focusedArticle && <ArticlePopup article={focusedArticle.article} isClose={focusedArticle.article.collectedAt != null} onClose={() => setFocusedArticle(null)} fallbackText="This location has not been discovered yet"></ArticlePopup>}

            </View>
        </focusArticleContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 5,
        paddingLeft: 5
    }
})
