import { MaterialCommunityIcons } from '@expo/vector-icons';

export type Trophy = {
    id: string,
    title: string,
    description: string | null,
    category: string,
    requirement_type: 'collect_articles' | 'discover_areas' | 'visit_countries' | 'complete_areas' | 'complete_village' | 'complete_town' | 'complete_city' | 'wetherspoons',
    requirement_value: number,
    icon_name?: keyof typeof MaterialCommunityIcons.glyphMap
}

export type TrophyTracker = {
    id: string,
    value: number,
    completedAt: Date | null
}

export const TROPHIES: Trophy[] = [

    // Article Collecting

    {
        id: 'collect_articles_first',
        title: 'First Steps',
        description: 'Collect your first article',
        category: 'Article Collector',
        requirement_type: 'collect_articles',
        requirement_value: 1,
        icon_name: 'book'
    },
    {
        id: 'collect_articles_second',
        title: 'Amateur Collector',
        description: 'Collect 25 articles',
        category: 'Article Collector',
        requirement_type: 'collect_articles',
        requirement_value: 25,
        icon_name: 'book'
    },
    {
        id: 'collect_articles_third',
        title: 'Tour Guide',
        description: 'Collect 50 articles',
        category: 'Article Collector',
        requirement_type: 'collect_articles',
        requirement_value: 50,
        icon_name: 'book'
    },
    {
        id: 'collect_articles_fourth',
        title: 'Historian',
        description: 'Collect 100 articles',
        category: 'Article Collector',
        requirement_type: 'collect_articles',
        requirement_value: 100,
        icon_name: 'book'
    },

    // Discovering Areas

    {
        id: 'discover_areas_first',
        title: 'Traveller',
        description: 'Visit 3 different areas',
        category: 'Traveller',
        requirement_type: 'discover_areas',
        requirement_value: 3,
        icon_name: 'walk'
    },
    {
        id: 'discover_areas_second',
        title: 'Tourist',
        description: 'Visit 5 different areas',
        category: 'Traveller',
        requirement_type: 'discover_areas',
        requirement_value: 5,
        icon_name: 'walk'
    },
    {
        id: 'discover_areas_third',
        title: 'Cross Country',
        description: 'Visit 15 different areas',
        category: 'Traveller',
        requirement_type: 'discover_areas',
        requirement_value: 15,
        icon_name: 'walk'
    },

    // Completing Areas

    {
        id: 'complete_areas_first',
        title: 'First Area Complete',
        description: 'Collect every article in an area',
        category: 'Completionist',
        requirement_type: 'complete_areas',
        requirement_value: 1
    },
    {
        id: 'complete_areas_second',
        title: 'Amateur Completionist',
        description: 'Collect every article in 5 different areas',
        category: 'Completionist',
        requirement_type: 'complete_areas',
        requirement_value: 5
    },
    {
        id: 'complete_areas_third',
        title: 'All your areas are belong to us',
        description: 'Collect every article in 15 areas',
        category: 'Completionist',
        requirement_type: 'complete_areas',
        requirement_value: 15
    },

    // Special

    {
        id: 'special_complete_village',
        title: 'It Takes a Village',
        description: 'Collect all articles in a village area',
        category: 'Special',
        requirement_type: 'complete_village',
        requirement_value: 1,
        icon_name: 'home'
    },
    {
        id: 'special_complete_town',
        title: 'Talk of the Town',
        description: 'Collect all articles in a town area',
        category: 'Special',
        requirement_type: 'complete_town',
        requirement_value: 1,
        icon_name: 'town-hall'
    },
    {
        id: 'special_complete_city',
        title: 'Just a City Boy',
        description: 'Collect all articles in a city area',
        category: 'Special',
        requirement_type: 'complete_city',
        requirement_value: 1,
        icon_name: 'city'
    },
    {
        id: 'special_wetherspoons_one',
        title: 'For a Few Spoons More',
        description: 'Collect a Wetherspoons Location',
        category: 'Special',
        requirement_type: 'wetherspoons',
        requirement_value: 1,
        icon_name: 'home'
    },
]