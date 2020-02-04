# The Queuer

A spotify frontend for a collaborative office listening experiance.

The Queuer allows individuals to create a custom album queue, the server will then round robin between all the users who have albums in their queues and play their albums.

![queue](./assets/queue.png "Queue")

![search](./assets/search.png "Search")

## Setup.

The application uses [librespot-java](https://github.com/librespot-org/librespot-java/) as a backend

### Download librespot-java and configure

Edit `config.toml` (configiration file created when you first run librespot-java)

Make certain that autoplay is set to false.

```
autoplayEnabled = false
```

currently I have only tested this application using USER_PASS authentication, although it may work using the other options.

To setup this authentication method set the following in the `config.toml`

```
strategy = "USER_PASS"
username = "YourSpotifyUsername"
password = "YourSpotifyPassword"
```

### Run the client.

The client can be run using `yarn start` (or `npm run start`) from within ``packages/queuer-client` from the client directory, or alternativly built and deployed using `serv` or another http server (nginx perhaps)

```
cd packages/client
yarn
yarn start

```

### Run the server

```
cd packages/queuer-server
yarn
node src/server.js
```