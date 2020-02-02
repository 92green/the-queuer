import React, {useState, useEffect} from 'react';
import useViewer from './useViewer';
import useUserQueue from './useUserQueue';
import {addToUserQueue} from './api' 
export default function useViewerQueue(){
    const {viewer} = useViewer();
    const {userQueue} = useUserQueue({userId: viewer.id})
    return {viewerQueue: userQueue, addToViewerQueue: ({item}) => addToUserQueue({userId: viewer.id, item}) } 
}