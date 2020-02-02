import React, {useState, useEffect} from 'react';
import useViewer from './useViewer';
import useUserQueue from './useUserQueue';
import {addToUserQueue} from './api' 
export default function useViewerQueue(){
    const {viewer} = useViewer();
    let viewerQueue;
    useEffect(() =>{
        const {userQueue} = useUserQueue({userId: viewer.id})
        viewerQueue = userQueue;
    })
    return {viewerQueue, addToViewerQueue: ({item}) => addToUserQueue({userId: viewer.id, item}) } 
}