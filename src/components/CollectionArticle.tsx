import { useState, useContext, useEffect, useMemo } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { Area, Article } from "../data/Location";
import { StyleSheet, View, Text, Falsy, RecursiveArray, RegisteredStyle, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import WikipediaImage from "./WikipediaImage";
import { focusArticleContext } from "../views/Collection";
import { truncate } from "../utils/StringUtils";


export type CollectionArticleProps = {
    article: Article,
    style: StyleProp<ViewStyle>
}

export default function CollectionArticle(props: CollectionArticleProps) {
    const Database = useContext(DatabaseContext);
    const onPress = useContext(focusArticleContext)!
    const { article } = props

    const isCollected = useMemo(
        () => Database?.isArticleCollected(article.id) ?? false,
        [Database?.collectedIds, article.id]
    );


    return (
        <TouchableOpacity style={[styles.container, props.style]} onPress={() => onPress({ article: props.article, isClose: false })}>
            {
                article.thumbnailUrl && (
                    <WikipediaImage url={article.thumbnailUrl} width={100} height={100} isCollected={isCollected} />
                )
            }

            {
                !article.thumbnailUrl && (
                    <View style={styles.fallbackCirle}>
                        <Text style={styles.fallbackText}>{truncate(article.name, 32)}</Text>
                    </View>
                )
            }
        </TouchableOpacity >
    );
}



const styles = StyleSheet.create({
    container: {
        height: 100,
        width: 100,
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    fallbackCirle: {
        borderWidth: 4,
        borderColor: 'black',
        width: 100,
        height: 100,
        borderRadius: 5000,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    fallbackText: {
        fontWeight: 'bold',
        fontSize: 12,
        flexWrap: 'wrap',
        textAlign: 'center',
        width: 75
    }
})
