import React, {useState, useEffect} from 'react';
import useViewer from './useViewer';
import {subscribeToUserQueue} from './api'

let queues = new Map();

export default function useUserQueue({userId}){
    queues.has(userId) || queues.set(userId, [])
    const [userQueue, setUserQueue] = useState([]);
    useEffect(() => {
        subscribeToUserQueue({userId})
            .subscribe(ii => {
                if(ii.type === 'USER_QUEUE_RESPONSE'){
                    queues.set(userId, ii.data)
                    setUserQueue(queues.get(userId))
                }
                else if(ii.type === 'USER_QUEUE_UPDATE'){
                    let update = [...queues.get(userId),  ii.data]
                    queues.set(userId, update)
                    setUserQueue(queues.get(userId))
                }
            })
    }, [userId])
    return {userQueue}
}