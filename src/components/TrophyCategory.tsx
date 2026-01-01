import { useState, useContext, useEffect } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { Area, Article } from "../data/Location";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { GetArticleText } from "../services/WikidataApi";
import CollectionArticle from "./CollectionArticle";
import { TrophyCategory } from "../views/TrophyView";
import TrophyItem from "./TrophyItem";


export type TrophyCategoryCarouselProps = {
    trophyCategory: TrophyCategory
}

export default function TrophyCategoryCarousel(props: TrophyCategoryCarouselProps) {
    return (
        <View>
            <Text style={styles.title}>{props.trophyCategory.categoryName}</Text>


            <FlatList
                data={props.trophyCategory.trophies}
                renderItem={(trophy) => <TrophyItem style={{ marginHorizontal: 10 }} trophy={trophy.item} />}
                keyExtractor={(item) => item.id}
                horizontal={true}
                style={styles.articleList}>
            </FlatList>

        </View>
    );
}



const styles = StyleSheet.create({
    title: {
        fontWeight: 'bold',
        fontSize: 24
    },
    articleList: {
        marginVertical: 10
    }
})
