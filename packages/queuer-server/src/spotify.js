global.WebSocket = require('ws');

const {Subject, interval, defer, merge, of} = require('rxjs');
const {webSocket} = require('rxjs/webSocket');
const {share, map, distinctUntilChanged, filter, tap, withLatestFrom, startWith} = require('rxjs/operators');
const fetch = require('node-fetch');

const LIBRESPOT_LOCATION = "localhost:24879";

const respotEvents = webSocket(`ws://${LIBRESPOT_LOCATION}/events`).pipe(share());

// respotEvents.subscribe(() => {}, (err) => {
//     console.error(ERROR_NO_CONNECTION);
// })

const currentTrackObs = respotEvents.pipe(
    filter(ii => ii.event === 'metadataAvailable'),
    map(({track}) => {
        let artUrl = "";
        if(track.album && track.album.coverGroup && track.album.coverGroup.image){
            let art = track.album.coverGroup.image.sort((ii, jj) => ii.height < jj.height)[0];
            artUrl = `https://i.scdn.co/image/${art.fileId.toLowerCase()}`
        }
        return {
            artUrl,
            trackid: track.gid,
            album: track.album.name,
            artist: track.artist.map(ii => ii.name),
            title: track.name,
            trackNumber: track.number
        }
    }),
    distinctUntilChanged((ii, jj) => ii.trackid === jj.trackid)
)



let startStopStatus = 
    merge(defer(() => of({event: 'playbackPaused'})), 
    respotEvents
        .pipe(
            tap(ii => console.log(ii)),
            filter(({event}) => event === 'playbackPaused' || event === 'playbackResumed')
        )
    )
let requestItemTick = 
    interval(2000).pipe(
        withLatestFrom(startStopStatus, (ii, jj) => jj),
        filter((ii) => ii.event === 'playbackPaused'),
        share()
    );


async function openUri (spotifyUri) {
    return fetch(`http://${LIBRESPOT_LOCATION}/player/load`, { method: 'POST', body: `uri=${spotifyUri}&play=true` })
}

async function getToken({scope}){
    let tokenRes = await fetch(`http://${LIBRESPOT_LOCATION}/token/${scope}`, { method: 'POST' });
    let tokenJson = await tokenRes.json();
    return tokenJson.token;
}

async function search({type, query}){
    let token = await getToken({scope: 'user-read-private'});
    let serachUrl = new URL('https://api.spotify.com/v1/search');
    serachUrl.searchParams.append('q', query);
    serachUrl.searchParams.append('type', type);
    serachUrl.searchParams.append('market', 'from_token');
    let res = await fetch(serachUrl.href, {
        headers:  {
            'Authorization': `Bearer ${token}`
        }
    });
    return await res.json()
}

module.exports = {
    queueFinished: requestItemTick,
    currentTrackObs,
    openUri,
    search
}
