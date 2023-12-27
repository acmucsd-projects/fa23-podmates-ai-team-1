import React, { useEffect, useState, useContext} from 'react';
import { client } from "@gradio/client";
import { YoutubeLinkContext } from './YoutubeLinkContext';
import './App.css';

function GetPrediction() {
    const [prediction, setPrediction] = useState(null);
    const { youtubeLink } = useContext(YoutubeLinkContext);
    console.log(youtubeLink);
    useEffect(() => {
        async function fetchPrediction() {
            if (!youtubeLink) return; // Exit if no link is provided
            try {
                const app = await client("https://gamereview-youtubegamereview.hf.space/--replicas/eo53i/");
                const result = await app.predict("/rate", [youtubeLink]);
                setPrediction(result.data);
            } catch (error) {
                console.error("Error fetching prediction:", error);
            }
        }

        fetchPrediction();
    }, [youtubeLink]); // Empty dependency array means this runs once on component mount

    return (
        <div className="prediction-container">
            <p>Prediction: {prediction}</p>
        </div>
    );
}

export default GetPrediction;