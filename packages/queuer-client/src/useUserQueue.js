import React, {useState, useEffect} from 'react';
import useViewer from './useViewer';
import {subscribeToUserQueue} from './api'



export default function useUserQueue({userId}){
    // let queues = new Map();
    // queues.has(userId) || queues.set(userId, [])
    const [userQueue, setUserQueue] = useState([]);
    useEffect(() => {
        subscribeToUserQueue({userId})
            .subscribe(ii => {
                switch(ii.type){
                    case 'USER_QUEUE_RESPONSE':
                        setUserQueue(ii.data)
                    break;
                    case 'USER_QUEUE_UPDATE':
                        setUserQueue((queue) => queue.concat(ii.data))
                    break;
                    case 'USER_QUEUE_REMOVE':
                        setUserQueue((queue) => queue.filter(jj => jj.uri !== ii.data.uri));
                    break;
                }
            })
    }, [userId])
    return {userQueue}
}