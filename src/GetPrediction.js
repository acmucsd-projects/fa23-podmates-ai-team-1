import React, { useEffect, useState, useContext } from 'react';
import { client } from "@gradio/client";
import { YoutubeLinkContext } from './YoutubeLinkContext';
import './App.css';

function GetPrediction() {
    const [prediction, setPrediction] = useState(null);
    const [feeling1, setFeeling1] = useState(null);
    const [feeling2, setFeeling2] = useState(null);
    const [feeling3, setFeeling3] = useState(null);
    const { youtubeLink } = useContext(YoutubeLinkContext);
    console.log(youtubeLink);
    useEffect(() => {
        console.log("calculating...")
        async function fetchPrediction() {
            // Try to get a stored prediction first
            const storedPrediction = chrome.storage.local.get([youtubeLink], function(result) {
                setPrediction(result[youtubeLink] || 'calculating...');
            });
            const storedFeeling1 = chrome.storage.local.get(["feeling1" + youtubeLink], function(result) {
                setFeeling1(result["feeling1" + youtubeLink] || 'Feeling1');
            });
            const storedFeeling2 = chrome.storage.local.get(["feeling2" + youtubeLink], function(result) {
                setFeeling2(result["feeling2" + youtubeLink] || 'Feeling2');
            });
            const storedFeeling3 = chrome.storage.local.get(["feeling3" + youtubeLink], function(result) {
                setFeeling3(result["feeling3" + youtubeLink] || 'Feeling3');
            });
            console.log(storedPrediction);
            if (storedPrediction && storedFeeling1 && storedFeeling2 && storedFeeling3) {
                setPrediction(storedPrediction);
                setFeeling1(storedFeeling1);
                setFeeling2(storedFeeling2);
                setFeeling3(storedFeeling3);
                return;
            }

            try {
                const app = await client("https://gamereview-youtubegamereview2.hf.space/--replicas/4sb4a/");
                const result = await app.predict("/rate", [youtubeLink]);
                chrome.storage.local.set({ [youtubeLink]: result.data[0]}, function() {
                    console.log('Prediction stored');
                });
                chrome.storage.local.set({ ["feeling1" + youtubeLink]: result.data[1]}, function() {
                    console.log('Feeling 1 stored');
                });   
                chrome.storage.local.set({ ["feeling2" + youtubeLink]: result.data[2]}, function() {
                    console.log('Feeling 2 stored');
                });
                chrome.storage.local.set({ ["feeling3" + youtubeLink]: result.data[3]}, function() {
                    console.log('Feeling 3 stored');
                });                      
                setPrediction(result.data[0]);
                setFeeling1(result.data[1]);
                setFeeling2(result.data[2]);
                setFeeling3(result.data[3]);
            } catch (error) {
                console.error("Error fetching prediction:", error);
            }
        }

        fetchPrediction();
    }, [youtubeLink]); // Run the effect when youtubeLink changes

    return (
        <div className="result-container">
            <div className="prediction-container">
            <p>General Sentiment: {prediction}</p>
            </div>
            <div className="boxes">
                <div className="box">{feeling1}</div>
                <div className="box">{feeling2}</div>
                <div className="box">{feeling3}</div>
            </div>
        </div>
        
    );
}

export default GetPrediction;