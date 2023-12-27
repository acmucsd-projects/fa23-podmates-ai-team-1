import React, { useEffect, useState, useContext } from 'react';
import { client } from "@gradio/client";
import { YoutubeLinkContext } from './YoutubeLinkContext';
import './App.css';

function GetPrediction() {
    const [prediction, setPrediction] = useState(null);
    const { youtubeLink } = useContext(YoutubeLinkContext);
    console.log(youtubeLink);
    useEffect(() => {
        // Define the function inside the effect
        async function fetchPrediction() {
            if (!youtubeLink) {
                return; // Exit if no link is provided
            }

            // Try to get a stored prediction first
            const storedPrediction = chrome.storage.local.get([youtubeLink], function(result) {
                setPrediction(result[youtubeLink] || 'No prediction available');
            });
            console.log(storedPrediction);
            if (storedPrediction) {
                setPrediction(storedPrediction);
                return;
            }

            try {
                const app = await client("https://gamereview-youtubegamereview.hf.space/--replicas/eo53i/");
                const result = await app.predict("/rate", [youtubeLink]);
                chrome.storage.local.set({ [youtubeLink]: result.data}, function() {
                    console.log('Prediction stored');
                });                
                //localStorage.setItem(youtubeLink, result.data); // Store the prediction
                //console.log(sessionStorage.getItem(youtubeLink));
                setPrediction(result.data);
            } catch (error) {
                console.error("Error fetching prediction:", error);
            }
        }

        fetchPrediction();
    }, [youtubeLink]); // Run the effect when youtubeLink changes

    return (
        <div className="prediction-container">
            <p>Prediction: {prediction}</p>
        </div>
    );
}

export default GetPrediction;