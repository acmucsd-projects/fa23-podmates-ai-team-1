import React, { useEffect, useState } from 'react';
import { YoutubeLinkProvider } from './YoutubeLinkContext';
import GetPrediction from './GetPrediction'; // Adjust the path as necessary
import GetData from './GetData';
function App() {
    const [youtubeLink, setYoutubeLink] = useState(null);
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url;
            if (checkIfYoutubeLink(url)) {
                setYoutubeLink(url);
            }
        });
    }, []);
    if (!youtubeLink) {
        return (
            <div className="notApp">
                <div className="video-details">
                    <div className="video-metadata">
                        <div className="notvideo-title">
                            <h2>Not a video</h2>
                        </div>
                    </div>
            </div>
        </div>
        );
    }
    function checkIfYoutubeLink(url) {
        const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/;
        return youtubeRegex.test(url);
    }
    return (
        <div className="App">
            <YoutubeLinkProvider value={{ youtubeLink }}>
                <GetData/>
                <GetPrediction />    
            </YoutubeLinkProvider>  
        </div>
    );
}

export default App;