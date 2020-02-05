const WebSocket = require('ws');
const {currentTrackObs, search, queueFinished, openUri} = require ('./spotify')
const {Subject} = require('rxjs');
const {share, filter, withLatestFrom, tap} = require('rxjs/operators');
const PouchDB = require('pouchdb-node');
PouchDB.plugin(require('pouchdb-find'));
const {subDays} = require('date-fns');
const userQueueDb = new PouchDB('userQueue');
const userPlayedDb = new PouchDB('userPlayed');
const uuid = require('uuid/v4');
userQueueDb.createIndex({
    index: {
      fields: ['items']
    }
});
userPlayedDb.createIndex({
    index: {
      fields: ['date']
    }
});
const userQueue = new Map();
const userQueueSub = new Subject().pipe(share());
const currentPlayingUserSub = new Subject().pipe(share());

var currentSong = {};
const ERROR_NO_CONNECTION = "Unable to connect to librespot-java, check that it's installed and running"

currentTrackObs.subscribe(ii => {
    delete(ii.length);
    currentSong = ii;
},
(err) => {
    console.error(ERROR_NO_CONNECTION);
    process.exit(-1)
})
queueFinished.subscribe(async (ii) => {
    try {
        let window = subDays(new Date(), 7);
        let played = await userPlayedDb.find({
            selector: {date: {$gt: window.toISOString()}}
        });
        let userPlaytimes = played.docs.reduce((rr, ii) => {
            let current = 0
            if(rr.has(ii.userId)){
                current = rr.get(ii.userId);
            }
            current += ii.track.duration_ms
            rr.set(ii.userId, current)
            return rr;
        }, new Map())
        let userQueues = await userQueueDb.find({
            selector: {'items.0': { $exists : true}}
        });
        if(userQueues.docs.length > 0){
            let [{_id: userId, items}] = userQueues.docs.sort((ii, jj) => {
                if(userPlaytimes.has(ii.userId)) {
                    return true;
                }
                if(userPlaytimes.has(jj.userId)) {
                    return false;
                }
                userPlaytimes.get(ii.userId) < userPlaytimes.get(jj.userId)
            })
            let [item] = items;
            userQueueSub.next({
                userId,
                action: 'REMOVE',
                item
            })
            currentPlayingUserSub.next({
                userId
            });
            openUri(item.uri)
        } else {
            console.log('Nothing to play')
        }
    } catch (ee){
        console.error(ee);
    }
},
(err) => {
    console.error(ERROR_NO_CONNECTION);
    process.exit(-1)
})

// Add items into the playlist 
// Currently responsable to manage the data storage of the list.
userQueueSub.subscribe(async ({userId, item, action}) => {
    switch(action) {
        case 'ADD':
            try{
                let doc = await userQueueDb.get(userId)
                var response = await userQueueDb.put({
                    _id: userId,
                    _rev: doc._rev,
                    items: [...doc.items, item]
                });
            } catch (ee){
                if(ee.status === 404){
                    await userQueueDb.put({
                        _id: userId,
                        items: [item]
                    });
                } else {
                    throw ee;
                }
            }
        break;
        case 'REMOVE':
            let doc = await userQueueDb.get(userId)
            let updated = doc.items.filter(ii => ii.uri !== item.uri);
            var response = await userQueueDb.put({
                _id: userId,
                _rev: doc._rev,
                items: updated
            });
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

// Update previous played tracks with the user who played them.
currentTrackObs.pipe(
    withLatestFrom(currentPlayingUserSub)
).subscribe(async ([track, userId]) => {
    try {
        await userPlayedDb.put({
            _id: uuid(),
            track,
            userId,
            date: new Date().toISOString()
        });
    } catch (ee){
        console.error(ee)
    }
})

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

async function subscribeUserQueue(ws, {id, userId}){
    try{
        let doc = await userQueueDb.get(userId)
        ws.send(JSON.stringify({
            type: 'USER_QUEUE_RESPONSE',
            id,
            data: doc.items
        }))
    } catch (ee){
        if(ee.status !== 404){
            throw ee;
        }
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