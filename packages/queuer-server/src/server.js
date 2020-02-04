const WebSocket = require('ws');
const {currentTrackObs, search, queueFinished, openUri} = require ('./spotify')
const {Subject} = require('rxjs')
const {share, filter} = require('rxjs/operators')

const userQueue = new Map();
const userQueueSub = new Subject().pipe(share());
var currentSong = {};

currentTrackObs.subscribe(ii => {
    delete(ii.length);
    currentSong = ii;
})

let mapItr = 0;
queueFinished.subscribe(ii => {
    let users = Array.from(userQueue.keys());
    if(users.length > 0){
        let userId = users[mapItr % users.length];
        let [item] = userQueue.get(userId);
        userQueueSub.next({
            userId,
            action: 'REMOVE',
            item
        })
        mapItr++;
        openUri(item.uri)
    } else {
        console.log('Nothing to play')
    }
})

// Add items into the playlist 
// Currently responsable to manage the data storage of the list.
userQueueSub.subscribe(({userId, item, action}) => {
    switch(action) {
        case 'ADD':
            if(!userQueue.has(userId)){
                userQueue.set(userId, [item])
            } else {
                userQueue.get(userId).push(item)
            }
        break;
        case 'REMOVE':
            if(userQueue.has(userId)){
                let updated = userQueue.get(userId).filter(ii => ii.uri !== item.uri);
                if(updated.length === 0){
                    userQueue.delete(userId)
                } else {
                    userQueue.set(userId, updated)
                }
            }
        break;
    }
})

const wss = new WebSocket.Server({
    port: 8080
});
const responders = {
    'SUBSCRIBE_CURRENT_TRACK': subscribeCurrentTrack,
    'SEARCH_ALBUM': searchAlbum,
    'SEARCH_TRACK': searchTrack,
    'SEARCH_PLAYLIST': searchPlaylist,
    'SUBSCRIBE_USER_QUEUE': subscribeUserQueue,
    'ADD_USER_QUEUE': addToUserQueue,
    'REMOVE_USER_QUEUE': removeFromUserQueue
}

const SUBSCRIPTION = {
    'CURRENT_TRACK': 'CURRENT_TRACK'
}

wss.on('connection', (ws) => {
    console.log('Got a new connection')
    ws.on('message', function incoming(message) {
        console.log('Got a new message', message)
        let mess = JSON.parse(message);
        if (responders[mess.type]){
            responders[mess.type](ws, mess)
        }
    });
});

function subscribeCurrentTrack(ws, {id}){
    ws.send(JSON.stringify({
        type: 'SUBSCRIBE_CURRENT_TRACK_RESPONSE',
        id,
        data: currentSong
    }))
    currentTrackObs.subscribe((ii) => {
        delete(ii.length)
        return ws.send(JSON.stringify({
            type: 'SUBSCRIBE_CURRENT_TRACK_RESPONSE',
            id,
            data: ii
        }))
    })
}

async function addToUserQueue(ws, {id, userId, item}){
    userQueueSub.next({
        userId, 
        action: 'ADD',
        item
    });
}

async function removeFromUserQueue(ws, {id, userId, item}){
    userQueueSub.next({
        userId,
        action: 'REMOVE',
        item
    })
}

function subscribeUserQueue(ws, {id, userId}){
    if(userQueue.has(userId)){
        ws.send(JSON.stringify({
            type: 'USER_QUEUE_RESPONSE',
            id,
            data: userQueue.get(userId)
        }))
    }
    userQueueSub
        .pipe(filter(ii => ii.userId === userId))
        .subscribe(({item, action}) => {
            if(action === 'ADD'){
                ws.send(JSON.stringify({
                    type: 'USER_QUEUE_UPDATE',
                    id,
                    data: item
                }))
            }
            if(action === 'REMOVE'){
                ws.send(JSON.stringify({
                    type: 'USER_QUEUE_REMOVE',
                    id,
                    data: item
                }))
            }
        })
}

async function searchAlbum(ws, {id, query}){
    let data = await search({type: 'album', query});
    return ws.send(JSON.stringify({
        type: 'SEARCH_ALBUM_RESPONSE',
        id,
        data
    }))
}

async function searchTrack(ws, {id, query}){
    let data = await search({type: 'track', query});
    return ws.send(JSON.stringify({
        type: 'SEARCH_TRACK_RESPONSE',
        id,
        data
    }))
}

async function searchPlaylist(ws, {id, query}){
    let data = await search({type: 'playlist', query});
    return ws.send(JSON.stringify({
        type: 'SEARCH_PLAYLIST_RESPONSE',
        id,
        data
    }))
}