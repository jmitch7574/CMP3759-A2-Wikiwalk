import { LatLng, Marker } from "react-native-maps";
import { ArticlePoint } from "../wikidata/WikidataApi";
import { useEffect, useState } from "react";
import { Haversine } from "../utils/MapHelper";

export type MarkerProps = {
    articleInfo: ArticlePoint,
    location: LatLng,
    onPress: (isPopupClose: boolean) => void,
}


export default function CustomMarker(props: MarkerProps) {
    const { articleInfo, location } = props
    const [isClose, setIsClose] = useState(false);

    const ArticleRange = 0.1; // 100 meters

    // Icons
    const available = require('../../assets/map-icons/poi_available.png');
    const unavailable = require('../../assets/map-icons/poi_unavailable.png');
    const collected = require('../../assets/map-icons/poi_collected.png');

    // Update marker state when user location changes
    useEffect(() => {
        setIsClose(Haversine(articleInfo.coords, location) <= 0.1);
    }, [location]);

    function GetIcon() {
        // TODO: Logic for already in collection, do once collection is written

        if (isClose) {
            return available
        }

        return unavailable;
    }

    return (
        <Marker
            onPress={() => props.onPress(isClose)}
            coordinate={articleInfo.coords}
            anchor={{ x: 0.5, y: 1 }}
            icon={GetIcon()}>
        </Marker>
    )
}