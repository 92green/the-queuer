import React, {useState, useEffect} from 'react';
import useViewer from './useViewer';
import {subscribeToUserQueue} from './api'

export default function useUserQueue({userId}){
    const [userQueue, setUserQueue] = useState([]);
    useEffect(() => {
        subscribeToUserQueue({userId})
            .subscribe(ii => {
                if(ii.type === 'USER_QUEUE_RESPONSE'){
                    setUserQueue(ii.data)
                }
                else if(ii.type === 'USER_QUEUE_UPDATE'){
                    userQueue.push(ii.data)
                    setUserQueue(userQueue)
                }
            })
    }, [userId])
    return {userQueue}
}