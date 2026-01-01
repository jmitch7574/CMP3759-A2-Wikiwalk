import { LatLng, Region } from 'react-native-maps';
import axios from 'axios';
import { Article, Area } from '../data/Location';

const WdqsEndpoint = "https://query.wikidata.org/sparql";

const headers = {
    "User-Agent":
        "Wikiwalk/1.0 (27774557@students.lincoln.ac.uk)",
};

const GetTerritoryFromLocationQuery = `
	SELECT DISTINCT ?settlementCode ?settlementLabel ?typeName ?wikipediaTitle ?article ?countryCode WHERE {{
  
    SERVICE wikibase:around {
        ?place wdt:P625 ?coord .
        bd:serviceParam wikibase:center "Point({longitude} {latitude})"^^geo:wktLiteral .
        bd:serviceParam wikibase:radius "2" .
        bd:serviceParam wikibase:distance ?distance .
    }

    ?place wdt:P131+ ?settlement .

    ?settlement wdt:P31 ?type .
    FILTER(?type IN (
        wd:Q515,
        wd:Q3957,
        wd:Q532,
        wd:Q5084,
        wd:Q15221373,
        wd:Q1549591,
        wd:Q486972,
        wd:Q1637706,
        wd:Q896881
    ))

    ?settlement wdt:P17 ?country .
    ?country wdt:P297 ?countryCode .

    OPTIONAL {
    ?article schema:about ?settlement ;
             schema:isPartOf <https://en.wikipedia.org/> .
    BIND(REPLACE(STR(?article), "https://en.wikipedia.org/wiki/", "") AS ?wikipediaTitle)
  }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    BIND(STRAFTER(STR(?settlement), "/entity/") AS ?settlementCode)

    ?type rdfs:label ?typeName.  filter(lang(?typeName) = "en").

    }}
    ORDER BY ASC(?distance)
    LIMIT 1`

const GetArticlesInTerritoryQuery = `
    SELECT ?articleCode ?placeLabel ?wikipediaTitle ?coord ?lat ?lon ?article ?typeLabel WHERE {
        ?place (wdt:P131|wdt:P276) wd:{location_QID}.
        
        ?place wdt:P625 ?coord.

        ?article schema:about ?place.
        ?article schema:isPartOf <https://en.wikipedia.org/>.
                
        
        OPTIONAL {
            ?place wdt:P31 ?type.
        }

        BIND(geof:latitude(?coord) AS ?lat)
        BIND(geof:longitude(?coord) AS ?lon)
        BIND(STRAFTER(STR(?place), "/entity/") AS ?articleCode)
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
        BIND(REPLACE(STR(?article), "https://en.wikipedia.org/wiki/", "") AS ?wikipediaTitle)
    }
	ORDER BY ?placeLabel`


export async function GetUserArea(coords: LatLng): Promise<Area | null> {
    let parsedQuery = GetTerritoryFromLocationQuery
        .replace('{latitude}', coords.latitude.toString())
        .replace('{longitude}', coords.longitude.toString())

    parsedQuery = encodeURI(parsedQuery);

    const finalURL = `${WdqsEndpoint}?query=${parsedQuery}&format=json`

    const data = await axios.get(finalURL, { headers })

    if (data.status != 200)
        return null;

    const areaCode = data.data['results']['bindings'][0]['settlementCode']['value']
    const wikipediaTitle = data.data['results']['bindings'][0]['wikipediaTitle']['value']
    const countryCode = data.data['results']['bindings'][0]['countryCode']['value']
    const articleUrl = data.data['results']['bindings'][0]['article']['value']
    let areaType = data.data['results']['bindings'][0]['typeName']['value']

    // Consolidate type values to 3 main ones
    if (['city', 'fourth-class city', 'big city', 'million city', 'average city'].includes(areaType)) areaType = 'city';
    if (['town', 'human settlement'].includes(areaType)) areaType = 'town';
    if (['village', 'hamlet'].includes(areaType)) areaType = 'village';

    // Get remaining Area data from a second api request
    const wikipedaRequestURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle}`;

    const secondaryData = await axios.get(wikipedaRequestURL, { headers })

    if (secondaryData.status != 200)
        return null;

    const thumbnailUrl = secondaryData.data['thumbnail']['source']
    const displayName = secondaryData.data['titles']['normalized']


    return {
        id: areaCode,
        name: displayName,
        articleUrl: articleUrl,
        thumbnailUrl: thumbnailUrl,
        type: areaType,
        country: countryCode,
        discoveredAt: null,
        totalCount: null,
        collectedCount: null
    };

}

export async function GetArticles(area: Area): Promise<Article[] | null> {
    let parsedQuery = GetArticlesInTerritoryQuery
        .replace('{location_QID}', area.id)

    parsedQuery = encodeURI(parsedQuery);

    const finalURL = `${WdqsEndpoint}?query=${parsedQuery}&format=json`

    const data = await axios.get(finalURL, { headers })

    if (data.status != 200)
        return null;

    let ArticleCollection: Article[] = [];

    for (const element of data.data['results']['bindings']) {
        let articleId = element['articleCode']['value']
        let coords: LatLng = { latitude: parseFloat(element['lat']['value']) ?? 0, longitude: parseFloat(element['lon']['value']) ?? 0 }
        let url = element['article']['value']
        let displayName = element['placeLabel']['value']
        const wikipediaTitle = element['wikipediaTitle']['value']

        const wikipedaRequestURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle}`;
        const secondaryData = await axios.get(wikipedaRequestURL, { headers })

        if (secondaryData.status != 200)
            return;

        const thumbnailUrl = secondaryData.data?.thumbnail?.source;


        let currentPoint: Article = {
            id: articleId,
            name: displayName,
            articleUrl: url,
            thumbnailUrl: thumbnailUrl,
            parentId: area.id,
            coords: coords,
            collectedAt: null
        };


        console.log(currentPoint);

        let foundId = false;
        ArticleCollection.map((existingArticle, index) => {
            if (existingArticle.id == articleId)
                foundId = true;
        });

        console.log(foundId);

        if (!foundId) {
            ArticleCollection.push(currentPoint);
            console.log(ArticleCollection);
        }

    };

    console.log(ArticleCollection);
    return ArticleCollection;
}

export async function GetArticleText(article: Article) {
    const article_url_ending = article.articleUrl.split('/').pop();
    const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=true&titles=${article_url_ending}`


    const data = await axios.get(url, { headers })


    if (data.status != 200)
        return null;


    // Workaround since wikipedia returns data indexed by page id which we don't know
    const lookup = data.data['query']['pages']

    for (let [key, value] of Object.entries(lookup)) {
        return lookup[key]['extract']
    }

    return "not found";
}