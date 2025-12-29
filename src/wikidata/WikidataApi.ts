import { LatLng, Region } from 'react-native-maps';
import axios from 'axios';
import { Article, ArticlePoint } from '../data/Location';

const WdqsEndpoint = "https://query.wikidata.org/sparql";

const headers = {
    "User-Agent":
        "Wikiwalk/1.0 (27774557@students.lincoln.ac.uk)",
};

const GetTerritoryFromLocationQuery = `
	SELECT DISTINCT ?settlementCode ?settlementLabel WHERE {{
  
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
        wd:Q486972
    ))

    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    BIND(STRAFTER(STR(?settlement), "/entity/") AS ?settlementCode)
    }}
    ORDER BY ASC(?distance)
    LIMIT 1`

const GetArticlesInTerritoryQuery = `
    SELECT ?articleCode ?placeLabel ?coord ?lat ?lon ?article ?typeLabel WHERE {
        ?place wdt:P131 wd:{location_QID}.
        
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
    }
	ORDER BY ?placeLabel`


export async function GetUserTerritory(coords: LatLng): Promise<string | null> {
    let parsedQuery = GetTerritoryFromLocationQuery
        .replace('{latitude}', coords.latitude.toString())
        .replace('{longitude}', coords.longitude.toString())

    parsedQuery = encodeURI(parsedQuery);

    const finalURL = `${WdqsEndpoint}?query=${parsedQuery}&format=json`


    const data = await axios.get(finalURL, { headers })

    if (data.status != 200)
        return null;

    const territory = data.data['results']['bindings'][0]['settlementCode']['value']
    return territory;
}

export async function GetArticles(territory: string): Promise<Array<ArticlePoint> | null> {
    let parsedQuery = GetArticlesInTerritoryQuery
        .replace('{location_QID}', territory)

    parsedQuery = encodeURI(parsedQuery);

    const finalURL = `${WdqsEndpoint}?query=${parsedQuery}&format=json`

    const data = await axios.get(finalURL, { headers })

    if (data.status != 200)
        return null;

    let ArticleCollection: Array<ArticlePoint> = [];

    data.data['results']['bindings'].forEach((element: { [x: string]: { [x: string]: any; }; }) => {
        let articleId = element['articleCode']['value']
        let coords: LatLng = { latitude: parseFloat(element['lat']['value']) ?? 0, longitude: parseFloat(element['lon']['value']) ?? 0 }
        let url = element['article']['value']
        let displayName = element['placeLabel']['value']

        let currentPoint: ArticlePoint = {
            coords: coords,
            article: {
                id: articleId,
                url: url,
                name: displayName
            }
        };

        let foundId = false;
        ArticleCollection.map((existingArticle, index) => {
            if (existingArticle.article.id == articleId)
                foundId = true;
        });

        if (!foundId)
            ArticleCollection.push(currentPoint);

    });

    return ArticleCollection;
}

export async function GetArticleText(article: Article) {
    const article_url_ending = article.url.split('/').pop();
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