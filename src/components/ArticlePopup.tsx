import React, { useContext, useEffect, useMemo, useState } from "react";
import { GetArticleText } from "../services/WikidataApi"
import { StyleSheet, Text, useWindowDimensions, Image } from "react-native";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import RenderHTML from 'react-native-render-html';
import { Article } from "../data/Location";
import { CollectionContext } from "../context/CollectionContext";
import { Buffer } from 'buffer';
import axios from "axios";

export type ArticlePopupContext = {
    article: Article,
    isClose: boolean,
}

type ArticlePopupProps = {
    article: Article,
    isClose: boolean,
    onClose?: () => void;
}


export default function ArticlePopup(props: ArticlePopupProps) {
    const [articleText, setArticleText] = useState("None");
    const [base64Image, setBase64Image] = useState<string | null>(null);

    let wiky = require('wiky.js');

    const Collection = useContext(CollectionContext);
    const { width } = useWindowDimensions();

    useEffect(() => {
        async function GetArticle() {
            setArticleText(wiky.process(await GetArticleText(props.article)));
        }

        async function SetArticleAsCollected() {
            await Collection?.claimArticle(props.article);
        }

        /**
         * Takes an image hosted on wikipedia and fetches it using axios into an array buffer. 
         * Wikipedia is really stupidly strict with requests, and I kept getting 403 forbidden responses when
         * I used the <Image source = {{uri: xxx}} /> component to render images.
         * 
         * Credit to these guys for solving this issue already: https://stackoverflow.com/questions/41846669/download-an-image-using-axios-and-convert-it-to-base64
         * @param url wikipedia URL
         */
        const fetchImage = async (url: string) => {
            try {
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'WikiWalk/1.0 (27774557@students.lincoln.ac.uk)',
                    },
                });

                // Convert the binary data to a Base64 string
                const base64 = Buffer.from(response.data, 'binary').toString('base64');
                const imageSource = `data:image/jpeg;base64,${base64}`;

                setBase64Image(imageSource);
            } catch (error) {
                console.error("Axios Error:", error);
            }
        };

        if (props.article.thumbnailUrl) fetchImage(props.article.thumbnailUrl);

        GetArticle();
        SetArticleAsCollected()
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
                {base64Image ? (
                    <Image source={{ uri: base64Image }} style={styles.image} />
                ) : null}

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
    articleContentContainer: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 38,
        paddingBottom: 24
    },
    image: {
        width: 200,
        height: 200,
        aspectRatio: 1,
        padding: 30,
        borderRadius: 1000
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