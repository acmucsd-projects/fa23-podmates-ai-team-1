import React, { useEffect, useState, useContext } from 'react';
import { client } from "@gradio/client";
import { YoutubeLinkContext } from './YoutubeLinkContext';
import './App.css';

function GetPrediction() {
    const [prediction, setPrediction] = useState(null);
    const { youtubeLink } = useContext(YoutubeLinkContext);
    console.log(youtubeLink);
    useEffect(() => {
        console.log("calculating...")
        async function fetchPrediction() {
            // Try to get a stored prediction first
            const storedPrediction = chrome.storage.local.get([youtubeLink], function(result) {
                setPrediction(result[youtubeLink] || 'calculating...');
            });
            console.log(storedPrediction);
            if (storedPrediction) {
                setPrediction(storedPrediction);
                return;
            }

            try {
                const app = await client("https://gamereview-youtubegamereview.hf.space/--replicas/lirca/");
                const result = await app.predict("/rate", [youtubeLink]);
                chrome.storage.local.set({ [youtubeLink]: result.data[0]}, function() {
                    console.log('Prediction stored');
                });                
                setPrediction(result.data[0]);
            } catch (error) {
                console.error("Error fetching prediction:", error);
            }
        }

        fetchPrediction();
    }, [youtubeLink]); // Run the effect when youtubeLink changes

    return (
        <div className="prediction-container">
            <p>General Sentiment: {prediction}</p>
        </div>
    );
}

export default GetPrediction;