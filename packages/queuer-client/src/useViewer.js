// Cheap thing that just creates a user in local store.

import React, { useState } from 'react';
import {subscribeToTrackChange} from './api'
import uuid from 'uuid/v4';

var storedViewer = window.localStorage.getItem('viewer')
if(!storedViewer){
    storedViewer = JSON.stringify({
        id: uuid()
    })
    window.localStorage.setItem('viewer', storedViewer);
}

export default function useCurrentTrack() {
    const [viewer, setViewer] = useState(null);
    setViewer(JSON.parse(storedViewer))
    return {viewer};
}