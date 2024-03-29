import React, { useEffect, useState, useContext } from 'react';
import { client } from "@gradio/client";
import { YoutubeLinkContext } from './YoutubeLinkContext';
import './App.css';

function GetData(){
    const [thumbnail, setThumbnail] = useState(null);
    const [title, setTitle] = useState(null);
    const [author, setAuthor] = useState(null);
    const { youtubeLink } = useContext(YoutubeLinkContext);
    console.log(youtubeLink);
    useEffect(() => {
        async function fetchData(){
            const storedTitle = chrome.storage.local.get(["title" + youtubeLink], function(result) {
                setTitle(result["title" + youtubeLink] || '');
            });
            const storedAuthor = chrome.storage.local.get(["author" + youtubeLink], function(result) {
                setAuthor(result["author" + youtubeLink] || '');
            });
            const storedThumbnail = chrome.storage.local.get(["thumbnail" + youtubeLink], function(result) {
                setThumbnail(result["thumbnail" + youtubeLink] || '');
            });

            if (storedTitle && storedAuthor && storedThumbnail) {
                setTitle(storedTitle);
                setAuthor(storedAuthor);
                setThumbnail(storedThumbnail);
                return;
            }

            try{
                const app = await client("https://gamereview-youtubegamereview2.hf.space/--replicas/4sb4a/");
                const result = await app.predict("/get_vid_details", [youtubeLink]);
                setTitle(result.data[0]);
                setAuthor(result.data[1]);
                setThumbnail(result.data[2].url);
                chrome.storage.local.set({ ["title" + youtubeLink]: result.data[0]}, function() {
                    console.log('Title stored');
                });
                chrome.storage.local.set({ ["author" + youtubeLink]: result.data[1]}, function() {
                    console.log('Author stored');
                }); 
                chrome.storage.local.set({ ["thumbnail" + youtubeLink]: result.data[2].url}, function() {
                    console.log('Thumbnail stored');
                });     
                console.log(result.data);
            } catch(error){
                console.error("Error fetching data", error);
            }
        }
        fetchData();
    }, [youtubeLink]);
    return(
        <div className="video-details">
            <div className="video-thumbnail">
                <img src={thumbnail} alt={`Thumbnail of ${title}`} />
            </div>
            <div className="video-metadata">
                <div className="video-title">
                    <h2>{title}</h2>
                    <p>By {author}</p>
                </div>
            </div>
        </div>
    );
}

export default GetData;