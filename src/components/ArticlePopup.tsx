import React, { useEffect, useMemo, useState } from "react";
import { GetArticleText } from "../wikidata/WikidataApi"
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import RenderHTML from 'react-native-render-html';
import { ArticlePoint } from "../data/Location";

export type ArticlePopupContext = {
    articlePoint: ArticlePoint,
    isClose: boolean,
}

type ArticlePopupProps = {
    articlePoint: ArticlePoint,
    isClose: boolean,
    onClose?: () => void;
}


export default function ArticlePopup(props: ArticlePopupProps) {
    const [articleText, setArticleText] = useState("None");

    let wiky = require('wiky.js');

    useEffect(() => {
        async function GetArticle() {
            setArticleText(wiky.process(await GetArticleText(props.articlePoint.article)));
        }

        GetArticle();
    }, [])

    const popupHeightChanged = (index: number) => {
        if (index < 0) {
            props.onClose?.();
        }
    }

    const snapPoints = useMemo(() => ['75%'], [])
    const { width } = useWindowDimensions();
    return (
        <BottomSheet enablePanDownToClose={true} detached={false} enableDynamicSizing={false} index={0} snapPoints={snapPoints} onChange={(index) => popupHeightChanged(index)}>
            <BottomSheetScrollView style={styles.articleContainer}>
                <Text style={styles.title}>{props.articlePoint.article.name}</Text>
                {props.isClose && (<RenderHTML
                    contentWidth={width}
                    source={{ html: articleText }}
                    tagsStyles={tagsStyles}
                />)}

                {!props.isClose && (<Text> Please get closer to discover</Text>)}
            </BottomSheetScrollView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    articleContainer: {
        padding: 24
    },
    title: {
        fontWeight: 'bold',
        fontSize: 38,
        paddingBottom: 24
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