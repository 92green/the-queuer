const {Subject} = require('rxjs');
const {share, map, distinctUntilChanged, filter} = require('rxjs/operators');
const Spotify = require('node-spotify-api');
const dbus = require('dbus-next');
const bus = dbus.sessionBus();
const Variant = dbus.Variant;
const metadataObs = new Subject();
const playbackStatusObs = new Subject();
var spotify = new Spotify({
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET
});

async function openUri (spotifyUri) {
    let obj = await bus.getProxyObject('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2');
    let properties = obj.getInterface('org.freedesktop.DBus.Properties');
    let player = obj.getInterface('org.mpris.MediaPlayer2.Player');
    player.OpenUri(spotifyUri)
}

async function search({type, query}){
    if (!query || query === "" || !type){
        return []
    }
    return spotify.search({type, query})
}

let currentTrackObs = metadataObs
    .pipe(
        map(ii => ii.value),
        map(ii => ({
                trackid: ii['mpris:trackid'].value,
                length: ii['mpris:length'].value,
                artUrl: ii['mpris:artUrl'].value,
                album: ii['xesam:album'].value,
                artist: ii['xesam:albumArtist'].value,
                autoRating: ii['xesam:autoRating'].value,
                title: ii['xesam:title'].value,
                trackNumber: ii['xesam:trackNumber'].value,
                url: ii['xesam:url'].value
            })
        ),
        distinctUntilChanged((ii, jj) => ii.trackid === jj.trackid),
        share()
    )

let queueFinished = playbackStatusObs
    .pipe(
        distinctUntilChanged((ii, jj) => ii.value === jj.value),
        filter(ii => ii.value === 'Paused')
    );


async function listen(){
    let obj = await bus.getProxyObject('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2');
    let properties = obj.getInterface('org.freedesktop.DBus.Properties');
    let metadata = await properties.Get('org.mpris.MediaPlayer2.Player', 'Metadata');
    metadataObs.next(metadata);
    properties.on('PropertiesChanged', (iface, changed, invalidated) => {
        if(changed.Metadata)
        {
            metadataObs.next(changed.Metadata);
            playbackStatusObs.next(changed.PlaybackStatus)
        }
    });
}
listen()

module.exports = {
    queueFinished,
    currentTrackObs,
    openUri,
    search
}