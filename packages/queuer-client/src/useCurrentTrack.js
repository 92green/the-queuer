import React, { useState, useEffect } from 'react';
import {subscribeToTrackChange} from './api'
let  obs = subscribeToTrackChange();
export default function useCurrentTrack() {
    const [currentTrack, setCurrrentTrack] = useState(null);
    useEffect(() => {
        obs.subscribe(ii => {
            setCurrrentTrack(ii.data);
        });
    }, [])
    return {currentTrack};
}