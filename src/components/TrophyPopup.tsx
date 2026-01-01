import React, { useContext, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { DatabaseContext } from "../context/DatabaseContext";
import { Trophy } from "../data/Trophies";
import TrophyProgressBar from "./TrophyProgressbar";

type TrophyPopupProps = {
    trophy: Trophy
    onClose?: () => void,
}


export default function TrophyPopup(props: TrophyPopupProps) {
    const Database = useContext(DatabaseContext);

    const trophyProgress = Database?.getTrophyProgress(props.trophy.id);

    const snapPoints = useMemo(() => ['75%'], [])


    const popupHeightChanged = (index: number) => {
        if (index < 0) {
            props.onClose?.();
        }
    }

    return (
        <BottomSheet enablePanDownToClose={true} detached={false} enableDynamicSizing={false} index={0} snapPoints={snapPoints} onChange={(index) => popupHeightChanged(index)}>
            <BottomSheetScrollView style={styles.progressContainer} contentContainerStyle={styles.progressContentContainer}>
                <Text style={styles.title}>{props.trophy.title}</Text>
                <Text style={styles.description}>{props.trophy.description}</Text>
                <TrophyProgressBar trophy={props.trophy} trophyProgress={trophyProgress!} size={200} radius={50} />
                <Text style={styles.countText}>{trophyProgress?.value} / {props.trophy.requirement_value} Collected</Text>
                {trophyProgress?.completedAt && (<Text style={styles.dateCollected}>Completed on {trophyProgress.completedAt.toLocaleDateString()}</Text>)}
            </BottomSheetScrollView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    progressContainer: {
        padding: 24,
        flex: 1,
    },
    progressContentContainer: {
        alignItems: 'center',
    },
    dateCollected: {
        color: 'gold',
        fontStyle: 'italic',
        fontWeight: 'bold',
        margin: 10
    },
    countText: {
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 38,
        paddingBottom: 24,
        textAlign: 'center'
    },
    description: {
        fontSize: 24,
        textAlign: 'center'
    }
})