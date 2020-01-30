import React, { useState } from 'react';
import {subscribeToTrackChange} from './api'

export default function useCurrentTrack(friendID) {
    const [currentTrack, setCurrrentTrack] = useState(null);
    subscribeToTrackChange().subscribe(ii => {
        setCurrrentTrack(ii.data);
    });
    return {currentTrack};
}