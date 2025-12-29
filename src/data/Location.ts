import { LatLng } from "react-native-maps"

export type Article = {
    id: string
    name: string
    url: string
}

export type ArticlePoint = {
    coords: LatLng
    article: Article
}