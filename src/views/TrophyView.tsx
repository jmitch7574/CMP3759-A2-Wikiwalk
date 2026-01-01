import { StyleSheet, View } from "react-native";
import React, { createContext, useState } from "react";
import CollectionAreaCarousel from "../components/TrophyCategory";
import { FlatList } from "react-native-gesture-handler";
import ArticlePopup, { ArticlePopupContext } from "../components/ArticlePopup";
import { TROPHIES, Trophy } from "../data/Trophies";
import TrophyCategoryCarousel from "../components/TrophyCategory";

export const focusTrophyContext = createContext<((context: Trophy) => void) | undefined>(undefined); 44

export type TrophyCategory = {
    categoryName: string,
    trophies: Trophy[]
}

export default function TrophyView() {
    const [focusedTrophy, setFocusedTrophy] = useState<Trophy | null>(null);

    // Sort Trohies by their categories
    const categories: TrophyCategory[] = [];

    for (const trophy of TROPHIES) {
        const filter = categories.filter(e => e.categoryName == trophy.category)
        if (filter.length > 0) {
            filter[0].trophies.push(trophy);
        }
        else {
            categories.push({ categoryName: trophy.category, trophies: [trophy] });
        }
    }

    return (
        <focusTrophyContext.Provider value={(context: Trophy) => setFocusedTrophy(context)}>
            <View style={styles.container}>
                <FlatList
                    data={categories}
                    renderItem={(trophies) => <TrophyCategoryCarousel trophyCategory={trophies.item} />}
                    keyExtractor={(item) => item.categoryName}>
                </FlatList>
            </View>
        </focusTrophyContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 5,
        paddingLeft: 5
    }
})
