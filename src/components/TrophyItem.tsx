import { useContext } from "react";
import { DatabaseContext } from "../context/DatabaseContext";
import { StyleSheet, View, Text, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import { TROPHIES, Trophy } from "../data/Trophies";
import { focusTrophyContext } from "../views/TrophyView";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";


export type TrophyItemProps = {
    trophy: Trophy,
    style: StyleProp<ViewStyle>
}

export default function TrophyItem(props: TrophyItemProps) {
    const Database = useContext(DatabaseContext);
    const onPress = useContext(focusTrophyContext)!
    const { trophy } = props

    const radius = 25;
    const circum = radius * 2 * Math.PI;

    const progress = Database?.getTrophyProgress(props.trophy.id)

    const userProgress = progress?.value ?? 0;
    const targetTrophy = TROPHIES.filter(x => x.id == props.trophy.id)[0]
    const requirement = targetTrophy.requirement_value

    const progressPercent = userProgress / requirement

    let width, height;
    width = height = 70;


    return (
        <TouchableOpacity style={[styles.container, props.style]} onPress={() => onPress({ article: props.article, isClose: false })}>
            {/* Code that builds our progress circle*/}
            {/* Thanks to https://aungmt.medium.com/react-native-circular-progress-component-using-svg-60bc831e3802 */}
            <View style={styles.svg}>
                <Svg style={styles.svg}>
                    { /* Background black circle */}
                    <Circle
                        cx={width / 2}
                        cy={height / 2}
                        r={radius}
                        stroke={'black'}
                        strokeWidth={4}
                        fillOpacity={0}
                        transform={`rotate(-90, ${width / 2}, ${height / 2})`}
                    />

                    { /* Foregrond Progress Circle */}
                    <Circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke={'gold'}
                        strokeWidth={4}
                        fillOpacity={0}
                        strokeDasharray={`${circum} ${circum}`}
                        strokeDashoffset={circum * (1 - progressPercent)}
                        transform={`rotate(-90, ${width / 2}, ${height / 2})`}
                    />
                </Svg>
                <View style={styles.textContainer}>
                    <MaterialCommunityIcons name={targetTrophy.icon_name ?? "trophy"} size={24} color={userProgress >= requirement ? 'gold' : 'black'}></MaterialCommunityIcons>
                </View>
            </View>
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
    svg: {
        height: 70,
        width: 70,
        justifyContent: 'center',
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
    },
    textContainer: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    }
})
