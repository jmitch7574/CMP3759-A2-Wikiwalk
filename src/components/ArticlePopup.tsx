import React, { useContext, useEffect, useMemo, useState } from "react";
import { GetArticleText } from "../services/WikidataApi"
import { StyleSheet, Text, useWindowDimensions, Image } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import RenderHTML from 'react-native-render-html';
import { Article } from "../data/Location";
import { DatabaseContext } from "../context/DatabaseContext";
import WikipediaImage from "./WikipediaImage";

export type ArticlePopupContext = {
    article: Article,
    isClose: boolean
}

type ArticlePopupProps = {
    article: Article,
    isClose: boolean,
    onClose?: () => void,
    fallbackText: string
}


export default function ArticlePopup(props: ArticlePopupProps) {
    const [articleText, setArticleText] = useState("Loading...");

    let wiky = require('wiky.js');

    const Database = useContext(DatabaseContext);
    const { width } = useWindowDimensions();

    useEffect(() => {
        async function GetArticle() {
            setArticleText(wiky.process(await GetArticleText(props.article)));
        }

        async function SetArticleAsCollected() {
            await Database?.claimArticle(props.article);
        }

        GetArticle();
        if (props.isClose) SetArticleAsCollected()
    }, [])

    const popupHeightChanged = (index: number) => {
        if (index < 0) {
            props.onClose?.();
        }
    }

    const snapPoints = useMemo(() => ['75%'], [])
    return (
        <BottomSheet enablePanDownToClose={true} detached={false} enableDynamicSizing={false} index={0} snapPoints={snapPoints} onChange={(index) => popupHeightChanged(index)}>
            <BottomSheetScrollView style={styles.articleContainer} contentContainerStyle={styles.articleContentContainer}>
                <Text style={styles.title}>{props.article.name}</Text>

                {props.article.thumbnailUrl && <WikipediaImage style={{ marginBottom: 20 }} url={props.article.thumbnailUrl} width={150} height={150} isCollected={props.isClose}></WikipediaImage>}

                {props.isClose && (<RenderHTML
                    contentWidth={width}
                    source={{ html: articleText }}
                    tagsStyles={tagsStyles}
                />)}

                {!props.isClose && (<Text>{props.fallbackText}</Text>)}
            </BottomSheetScrollView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    articleContainer: {
        padding: 24
    },
    articleContentContainer: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 38,
        paddingBottom: 24,
        textAlign: 'center'
    }
})

const tagsStyles = {
    h1: {
        fontSize: 38,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    h2: {
        fontSize: 34,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
    },
    h3: {
        fontSize: 30, // Make this clearly larger than base text
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: '#333',
    },
    p: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 10,
    }
} as const;