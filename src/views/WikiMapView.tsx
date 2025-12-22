import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import MapView, { LatLng, Marker, UserLocationChangeEvent } from 'react-native-maps';
import React, { ReactNode, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
export default function WikiMapView() {

    const [location, setLocation] = useState<LatLng | null>(null);
    const [following, setFollowing] = useState<Boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
        setLocation(newLocation);
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
})
