import request from 'request'
import spotify from 'node-spotify-api'
import express from 'express'

let playlists = Map();
let users = {};
let lastTrack = ""

const URI = 'https://api.spotify.com'
const {SPOTIFY_CLIENT_ID} = process.env;
const {SPOTIFY_CLIENT_SECRET} = process.env;

const USER = "testuser";

app.use(express.json());

var spotify = new Spotify({
    id: SPOTIFY_CLIENT_ID,
    secret: SPOTIFY_CLIENT_SECRET
});

app.get('/search/:type/:query', async (req, res) => {
    let {type, query} = req.params;
    let result = await spotify.search({ type, query});
    res.send(JSON.stringify(result))
});

app.post('/playlist', async (req, res) => {
    let currentUser = USER;
    if(!playlists.has(currentUser)){
        playlists.set(currentUser, []);
    }
    playlists.get(currentUser).push(req.body.id)
    return playlists.get(currentUser);
});

app.get('/playlist/:userId',(req, res) => {
    return playlists.get(req.params.userId)
});