import { useState, useContext, useEffect } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { Area, Article } from "../data/Location";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { GetArticleText } from "../services/WikidataApi";
import CollectionArticle from "./CollectionArticle";


export type CollectionAreaCarouselProps = {
    area: Area
}

export default function CollectionAreaCarousel(props: CollectionAreaCarouselProps) {

    const [articles, setArticles] = useState<Article[] | null>(null);
    const Database = useContext(DatabaseContext);

    useEffect(() => {
        if (!Database) return;

        const LoadArticles = async () => {
            setArticles(await Database.getArticlesForArea(props.area.id));
        }

        LoadArticles();
    }, [])

    return (
        <View>
            {articles && articles.length > 0 && (<Text style={styles.title}>{props.area.name}</Text>)}

            {articles && articles.length > 0 && (
                <FlatList
                    data={articles}
                    renderItem={(article) => <CollectionArticle style={{ marginHorizontal: 10 }} article={article.item} />}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    style={styles.articleList}>
                </FlatList>)}

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
