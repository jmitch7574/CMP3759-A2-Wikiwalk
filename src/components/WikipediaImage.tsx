import React, { useEffect, useState } from "react";
import { StyleSheet, Image, View, StyleProp, ViewStyle } from "react-native";
import { Buffer } from 'buffer';
import axios from "axios";
import { FilterImage } from 'react-native-svg/filter-image';

type WikipediaImageProps = {
    url: string,
    width: number,
    height: number,
    isCollected: boolean,
    style?: StyleProp<ViewStyle>
}


export default function WikipediaImage(props: WikipediaImageProps) {
    const [base64Image, setBase64Image] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Takes an image hosted on wikipedia and fetches it using axios into an array buffer. 
         * Wikipedia is really stupidly strict with requests, and I kept getting 403 forbidden responses when
         * I used the <Image source = {{uri: xxx}} /> component to render images.
         * 
         * Credit to these guys for solving this issue already: https://stackoverflow.com/questions/41846669/download-an-image-using-axios-and-convert-it-to-base64
         */
        const fetchImage = async () => {
            try {
                const response = await axios.get(props.url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'WikiWalk/1.0 (27774557@students.lincoln.ac.uk)',
                    },
                });

                // Convert the binary data to a Base64 string
                const base64 = Buffer.from(response.data, 'binary').toString('base64');
                const imageSource = `data:image/jpeg;base64,${base64}`;

                setBase64Image(imageSource);
            } catch (error) {
                console.error("Axios Error:", error);
            }
        };

        fetchImage();
    }, [props.url]);

    return (
        <View style={[props.style, { alignContent: 'center', justifyContent: 'center', alignItems: 'center' }]}>
            {
                base64Image ? (
                    <FilterImage
                        source={{ uri: base64Image }}
                        style={[
                            styles.image,
                            {
                                width: props.width,
                                height: props.height,
                                filter: props.isCollected ? '' : 'grayscale(100%)'
                            }
                        ]}
                    />
                ) : null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        aspectRatio: 1,
        borderRadius: 1000,
        borderColor: 'black',
        borderWidth: 4,
        margin: 0
    }
})
