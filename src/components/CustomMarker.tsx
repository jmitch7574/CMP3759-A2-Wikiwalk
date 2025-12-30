import { LatLng, Marker } from "react-native-maps";
import { useContext } from "react";
import { Haversine } from "../utils/MapHelper";
import { DebugContext } from "../context/DebugContext";
import { Article } from "../data/Location";
import { CollectionContext } from "../context/CollectionContext";

const ICONS = {
    available: require('../../assets/map-icons/poi_available.png'),
    unavailable: require('../../assets/map-icons/poi_unavailable.png'),
    collected: require('../../assets/map-icons/poi_collected.png'),
};

export type MarkerProps = {
    articleInfo: Article,
    location: LatLng,
    onPress: (isPopupClose: boolean) => void,
}

export default function CustomMarker({ articleInfo, location, onPress }: MarkerProps) {
    const debugMode = useContext(DebugContext);
    const Collection = useContext(CollectionContext);

    const ArticleRange = 0.1; // 100 meters

    const isCollected = Collection?.isArticleCollected(articleInfo.id);
    const isClose = Haversine(articleInfo.coords, location) <= ArticleRange || debugMode;

    let currentIcon = ICONS.unavailable;
    if (isCollected) {
        currentIcon = ICONS.collected;
    } else if (isClose) {
        currentIcon = ICONS.available;
    }

    return (
        <Marker
            onPress={() => onPress(isClose || (isCollected ?? false))}
            coordinate={articleInfo.coords}
            anchor={{ x: 0.5, y: 1 }}
            icon={currentIcon}
        />
    );
}