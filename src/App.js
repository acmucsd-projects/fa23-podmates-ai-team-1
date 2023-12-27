import React, { useEffect, useState } from 'react';
import { YoutubeLinkProvider } from './YoutubeLinkContext';
import GetPrediction from './GetPrediction'; // Adjust the path as necessary
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
function App() {
    const [videoId, setYoutubeVideoId] = useState('');
    const [youtubeLink, setYoutubeLink] = useState(false);
    const [videoDetails, setVideoDetails] = useState(null);
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url.split('&')[0];
            const tempID = extractVideoID(url);
            if (tempID) {
                setYoutubeVideoId(tempID);
            } else {
                setYoutubeVideoId('');
            }
            if (checkIfYoutubeLink(url)) {
                setYoutubeLink(url);
            } else {
                setYoutubeLink('');
            }
        });
    }, []);
    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
                const data = await response.json();
                if (data.items.length > 0) {
                    setVideoDetails(data.items[0].snippet);
                }
            } catch (error) {
                console.error('Error fetching video details:', error);
            }
        };

        fetchVideoDetails();
    }, [videoId]);
    if (!videoDetails) {
        return <div>Not a Youtube Video.</div>;
    }
    function extractVideoID(url) {
        try {
            const urlObj = new URL(url);
            const videoId = urlObj.searchParams.get('v');
            if (videoId && videoId.length === 11) {
                return videoId;
            }
            return null;
        } catch (error) {
            console.error('Error parsing URL:', error);
            return null;
        }
    }
    function checkIfYoutubeLink(url) {
        const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/;
        return youtubeRegex.test(url);
    }
    console.log(youtubeLink);
    return (
        <div className="App">
            <YoutubeLinkProvider value={{ youtubeLink }}>
                <div className="video-details">
                    <div className="video-thumbnail">
                        {videoDetails && (
                            <img src={videoDetails.thumbnails.high.url} alt={`Thumbnail of ${videoDetails.title}`} />
                        )}
                    </div>
                    <div className="video-metadata">
                        <div className="video-title">
                            <h2>{videoDetails && videoDetails.title}</h2>
                            <p>By {videoDetails && videoDetails.channelTitle}</p>
                        </div>
                    </div>
                </div>
                <GetPrediction />
            </YoutubeLinkProvider>  
    </div>
    );
}

export default App;