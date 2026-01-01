import { LatLng } from "react-native-maps"

export type Area = {
    id: string
    name: string
    articleUrl: string | null
    thumbnailUrl: string | null
    country: string,
    type: string,
    discoveredAt: Date | null
    collectedCount: number | null
    totalCount: number | null
}

export type Article = {
    id: string
    name: string
    articleUrl: string
    thumbnailUrl: string | null
    parentId: string
    coords: LatLng
    collectedAt: Date | null,
    owner: string | null
}


export type ArticleRecordRaw = {
    id: string
    name: string
    articleUrl: string
    thumbnailUrl: string | null
    parentId: string
    latitude: number
    longitude: number
    collectedAt: Date | null,
    owner: string | null
}
