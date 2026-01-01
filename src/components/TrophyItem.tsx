import { useContext } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { StyleSheet, View, Text, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import { TROPHIES, Trophy } from "../data/Trophies";
import { focusTrophyContext } from "../views/TrophyView";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TrophyProgressBar from "./TrophyProgressbar";


export type TrophyItemProps = {
    trophy: Trophy,
    style: StyleProp<ViewStyle>
}

export default function TrophyItem(props: TrophyItemProps) {
    const Database = useContext(DatabaseContext);
    const onPress = useContext(focusTrophyContext)!
    const { trophy } = props

    const progress = Database?.getTrophyProgress(props.trophy.id)

    return (
        <TouchableOpacity style={[styles.container, props.style]} onPress={() => onPress(props.trophy)}>
            {/* Code that builds our progress circle*/}
            {/* Thanks to https://aungmt.medium.com/react-native-circular-progress-component-using-svg-60bc831e3802 */}
            <TrophyProgressBar trophy={props.trophy} trophyProgress={progress!} size={70} radius={25} />
            <Text style={styles.text}>{trophy.title}</Text>
        </TouchableOpacity >
    );
}



const styles = StyleSheet.create({
    container: {
        height: 100,
        width: 100,
        flex: 1,
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        width: 75,
        height: 30,
        textAlignVertical: 'center'
    }
})
