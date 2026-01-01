import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { TrophyItemProps } from "./TrophyItem";
import { Trophy, TrophyTracker } from "../data/Trophies";

type TrophyProgressBarProps = {
    trophy: Trophy,
    trophyProgress: TrophyTracker,
    size: number
    radius: number

}

export default function TrophyProgressBar(props: TrophyProgressBarProps) {
    const { trophy, trophyProgress, size, radius } = props;
    const circum = radius * 2 * Math.PI;

    const userProgress = trophyProgress.value ?? 0;
    const requirement = trophy.requirement_value

    const progressPercent = Math.min(userProgress / requirement, 1)

    return (
        <View style={[styles.trackerContainer, { width: size, height: size }]}>
            <Svg style={styles.svg}>
                { /* Background black circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={'black'}
                    strokeWidth={4}
                    fillOpacity={0}
                    transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                />

                { /* Foregrond Progress Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={'gold'}
                    strokeWidth={4}
                    fillOpacity={0}
                    strokeDasharray={`${circum} ${circum}`}
                    strokeDashoffset={circum * (1 - progressPercent)}
                    transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                />
            </Svg>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={trophy.icon_name ?? "trophy"} size={24} color={userProgress >= requirement ? 'gold' : 'black'}></MaterialCommunityIcons>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    trackerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    svg: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    }
})
