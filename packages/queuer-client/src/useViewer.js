// Cheap thing that just creates a user in local store.

import React, { useState, useEffect } from 'react';
import uuid from 'uuid/v4';


export default function useViewer() {
    const [viewer, setViewer] = useState({});
    useEffect(() => {
        let storedViewer = window.localStorage.getItem('viewer')
        if(!storedViewer){
            storedViewer = JSON.stringify({
                id: uuid()
            })
            window.localStorage.setItem('viewer', storedViewer);
        }
        setViewer(JSON.parse(storedViewer))
    }, [])
    return {viewer};
}