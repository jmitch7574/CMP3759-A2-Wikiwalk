import { LatLng } from "react-native-maps";

export function Haversine(point1: LatLng, point2: LatLng) {
    const R = 6371;

    function deg2rad(deg: number) {
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