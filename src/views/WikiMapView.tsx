import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import MapView, { LatLng, Marker, UserLocationChangeEvent } from 'react-native-maps';
import React, { ReactNode, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ArticlePoint, GetArticles, GetUserTerritory } from "../wikidata/WikidataApi";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import CustomMarker from "../components/CustomMarker";
import ArticlePopup, { ArticlePopupContext } from "../components/ArticlePopup";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Haversine } from "../utils/MapHelper";

export default function WikiMapView() {

    const [location, setLocation] = useState<LatLng | null>(null);
    const [focusedArticle, setFocusedArticle] = useState<ArticlePopupContext | null>(null);

    const [currentPoints, setCurrentPoints] = useState<Array<ArticlePoint> | null>(null);

    const firstLocationPull = useRef(true);

    const map = useRef<MapView | null>(null);

    const mapStyle = [
        {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
        },
        {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
        },
    ];

    function GetMarkers() {
        if (!location) return;

        let markers: Array<ReactNode> = [];

        currentPoints?.map((element, index) => { // Access the index as a fallback key
            markers.push(
                <CustomMarker onPress={(isClose: boolean) => setFocusedArticle({ articleInfo: element, isClose: isClose })} key={element.articleId} location={location} articleInfo={element}></CustomMarker>
            );
        });

        return markers;
    }


    async function UpdateLocation(event: UserLocationChangeEvent) {
        if (
            !event?.nativeEvent?.coordinate?.latitude ||
            !event?.nativeEvent?.coordinate?.longitude
        ) return;

        let newLocation: LatLng = {
            latitude: event.nativeEvent.coordinate.latitude,
            longitude: event.nativeEvent.coordinate.longitude
        };

        if (firstLocationPull.current === true) {
            map.current && CenterMap(map.current)
        }

        // If this is the first time location has been pulled or sufficient distance has been made
        if (!location || Haversine(newLocation, location) > 0.01) {
            await UpdateArticles(newLocation);
        }

        setLocation(newLocation);
    }

    async function UpdateArticles(newLocation: LatLng) {
        // Get Articles
        const territory = await GetUserTerritory(newLocation);

        if (territory == null)
            return;

        setCurrentPoints(await GetArticles(territory));
    }

    function CenterMap(map: MapView) {
        if (location == null) return;

        map.animateToRegion(
            { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
            800
        )
        firstLocationPull.current = false;
    }

    return (
        <View
            style={{
                flex: 1
            }}
        >
            {/* The map */}
            <MapView customMapStyle={mapStyle} showsPointsOfInterest={false} showsUserLocation showsMyLocationButton={false} onUserLocationChange={UpdateLocation} ref={map} style={styles.map} cameraZoomRange={{ minCenterCoordinateDistance: 15, maxCenterCoordinateDistance: 20 }}>

                {currentPoints && GetMarkers()}
            </MapView>

            {/* The button to center on the user's location */}
            <View style={styles.centerButton}>
                <TouchableOpacity style={styles.centerButton} onPress={() => { map.current && CenterMap(map.current) }}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={32} color='black' style={styles.centerButtonIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
            </View>

            {focusedArticle && <ArticlePopup articleInfo={focusedArticle.articleInfo} isClose={focusedArticle.isClose} onClose={() => setFocusedArticle(null)}></ArticlePopup>}

        </View >
    );
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        flex: 1
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
    centerButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: '#EEEEEE',
        borderRadius: 45
    },
    centerButtonIcon: {
        padding: 8,
    },
    markerContainer: {
        // Add padding to ensure shadows or edges aren't clipped
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerImage: {
        width: 50,  // Exceeding your 40px limit
        height: 70,
        resizeMode: 'contain',
    },

    container: {
        flex: 1,
        backgroundColor: 'grey',
    },
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
    },
})
