import { LatLng, Marker } from "react-native-maps";
import { ArticlePoint } from "../wikidata/WikidataApi";

export type MarkerProps = {
    articleInfo: ArticlePoint,
    location: LatLng,
    onPress: () => void;
}


export default function CustomMarker(props: MarkerProps) {
    const { articleInfo, location } = props

    return (
        <Marker
            coordinate={articleInfo.coords}
            anchor={{ x: 0.5, y: 1 }}
            icon={require('../../assets/map-icons/poi_available.png')}>
        </Marker>
    )
}