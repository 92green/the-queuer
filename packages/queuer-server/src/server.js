const WebSocket = require('ws');
const {currentTrackObs, search} = require ('./spotify')
const wss = new WebSocket.Server({
    port: 8080
});
const responders = {
    'SUBSCRIBE_CURRENT_TRACK': subscribeCurrentTrack,
    'SEARCH_ALBUM': searchAlbum,
    'SEARCH_TRACK': searchTrack,
    'SEARCH_PLAYLIST': searchPlaylist
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
    console.log('subscribeCurrentTrack')
    currentTrackObs.subscribe((ii) => {
        delete(ii.length)
        return ws.send(JSON.stringify({
            type: 'SUBSCRIBE_CURRENT_TRACK_RESPONSE',
            id,
            data: ii
        }))
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