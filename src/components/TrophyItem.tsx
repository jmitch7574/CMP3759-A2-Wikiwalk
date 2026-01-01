import { useContext } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { StyleSheet, Text, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import { TROPHIES, Trophy } from "../data/Trophies";
import { focusTrophyContext } from "../views/TrophyView";
import Svg, { Circle } from "react-native-svg";


export type TrophyItemProps = {
    trophy: Trophy,
    style: StyleProp<ViewStyle>
}

export default function TrophyItem(props: TrophyItemProps) {
    const Database = useContext(DatabaseContext);
    const onPress = useContext(focusTrophyContext)!
    const { trophy } = props

    const radius = 45;
    const circum = radius * 2 * Math.PI;

    const progress = Database?.getTrophyProgress(props.trophy.id)

    const userProgress = progress?.value ?? 0;
    const requirement = TROPHIES.filter(x => x.id == props.trophy.id)[0].requirement_value

    const progressPercent = userProgress / requirement


    return (
        <TouchableOpacity style={[styles.container, props.style]} onPress={() => onPress({ article: props.article, isClose: false })}>
            {/* Code that builds our progress circle*/}
            {/* Thanks to https://aungmt.medium.com/react-native-circular-progress-component-using-svg-60bc831e3802 */}
            <Svg>
                { /* Background black circle */}
                <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke={'black'}
                    strokeWidth={4}
                    fillOpacity={0}
                />

                { /* Foregrond Progress Circle */}
                <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke={'gold'}
                    strokeWidth={4}
                    fillOpacity={0}
                    strokeDasharray={`${circum} ${circum}`}
                    strokeDashoffset={circum * (1 - progressPercent)}
                    transform={`rotate(-90, ${100 / 2}, ${100 / 2})`}
                />
            </Svg>
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
    },
    text: {
        position: 'absolute',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        width: 75,
    }
})
