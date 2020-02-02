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
                switch(ii.type){
                    case 'USER_QUEUE_RESPONSE':
                        queues.set(userId, ii.data)
                    break;
                    case 'USER_QUEUE_UPDATE':
                        var update = [...queues.get(userId),  ii.data]
                        queues.set(userId, update);
                    break;
                    case 'USER_QUEUE_REMOVE':
                        var update = queues.get(userId).filter(jj => jj.uri !== ii.data.uri);
                        queues.set(userId, update);
                    break;
                }
                setUserQueue(queues.get(userId));
            })
    }, [userId])
    return {userQueue}
}