import { useContext } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { StyleSheet, Text, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import { Trophy } from "../data/Trophies";
import { focusTrophyContext } from "../views/TrophyView";


export type TrophyItemProps = {
    trophy: Trophy,
    style: StyleProp<ViewStyle>
}

export default function TrophyItem(props: TrophyItemProps) {
    const Database = useContext(DatabaseContext);
    const onPress = useContext(focusTrophyContext)!
    const { trophy } = props


    return (
        <TouchableOpacity style={[styles.container, props.style, { borderColor: Database?.getTrophyProgress(trophy.id)?.completedAt ? 'gold' : 'black' }]} onPress={() => onPress({ article: props.article, isClose: false })}>
            <Text style={styles.text}>{trophy.title}</Text>
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
        alignItems: 'center',
        borderRadius: 5000,
        borderWidth: 4
    },
    text: {
        fontWeight: 'bold',
        fontSize: 12,
        flexWrap: 'wrap',
        textAlign: 'center',
    }
})
