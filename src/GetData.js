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
            try{
                const app = await client("https://gamereview-youtubegamereview.hf.space/--replicas/lirca/");
                const result = await app.predict("/get_vid_details", [youtubeLink]);
                setTitle(result.data[0]);
                setAuthor(result.data[1]);
                setThumbnail(result.data[2].url);
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