import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import MapView, { LatLng, Marker, UserLocationChangeEvent } from 'react-native-maps';
import React, { ReactNode, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ArticlePoint, GetArticles, GetUserTerritory } from "../wikidata/WikidataApi";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import CustomMarker from "../components/CustomMarker";

export default function WikiMapView() {

    const [location, setLocation] = useState<LatLng | null>(null);
    const [following, setFollowing] = useState<Boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
                <CustomMarker onPress={() => setFocusedArticle(element)} key={element.articleId} location={location} articleInfo={element}></CustomMarker>
            );
        });

        return markers;
    }

    function haversine(point1: LatLng, point2: LatLng) {
        const R = 6371;

        function deg2rad(deg: Float) {
            return deg * (Math.PI / 180);
        }

        const dLat = deg2rad(point2.latitude - point1.latitude);
        const dLon = deg2rad(point2.longitude - point1.longitude);

        const radLat1 = deg2rad(point1.latitude);
        const radLat2 = deg2rad(point2.latitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c;

        return distance; // Distance in kilometers
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
        if (!location || haversine(newLocation, location) > 0.1) {
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

    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
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

            {focusedArticle ? (
                <ArticlePopup articleInfo={focusedArticle} isClose={true}></ArticlePopup>
            ) : null}

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
})
