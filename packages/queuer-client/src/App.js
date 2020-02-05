import React from 'react';
import useCurrentTrack from './useCurrentTrack'
import useAlbumSearch from './useAlbumSearch'
import useTrackSearch from './useTrackSearch'
import useViewer from './useViewer'; 
import {useState} from 'react';
import Img from 'react-image'
import './App.css';
import useUserQueue from './useUserQueue'
import {addToUserQueue, removeFromUserQueue} from './api' 


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function Loader(){
  return <img src="/record-loader.svg" className="loader"/>
}

function CurrentTrack() {
  const {currentTrack} = useCurrentTrack()
  if(currentTrack && currentTrack.artist){
    return (
      <div className="currentTrack">
        <Img  src={currentTrack.artUrl}  loader={<Loader/>} className="Album-art"/>
        <div>{currentTrack.artist.join(' & ')} - {currentTrack.title} - {currentTrack.album}</div>
      </div>
    )
  } else  {
    return <div>Nothing Playing</div>
  }
}


function ItemDisplayFactory({item, isAdded = false}){
    return item.uri.includes("album") ? <AlbumDisplay album={item} isAdded={isAdded}/> : <TrackDisplay track={item} isAdded={isAdded}/>
}

function TrackDisplay({track, isAdded = false}){
  let {viewer} = useViewer()
  const onAdd = () => {
    addToUserQueue({userId: viewer.id, item: track});
  }
  const onRemove = () => {
    removeFromUserQueue({userId: viewer.id, item: track});
  }
  return (
    <div className="Album-display" key={track.id}>
      <Img src={track.album.images.map(ii => ii.url)} decode={false} loader={<Loader/>}  className="Album-art"/>
      <div>{track.name}</div>
      <div className="Album-artists">{track.artists.map(({name}) => name).join(' & ')}</div>
      <div>{track.album.name}</div>
      {isAdded ? <button type="button" onClick={onRemove} className="btn-red">Remove</button> : <button type="button" onClick={onAdd}>Add</button>}
    </div>
  );
}


function AlbumDisplay({album, isAdded = false}){
  let {viewer} = useViewer()
  const onAdd = () => {
    addToUserQueue({userId: viewer.id, item: album});
  }
  const onRemove = () => {
    removeFromUserQueue({userId: viewer.id, item: album});
  }
  return (
    <div className="Album-display" key={album.id}>
      <Img src={album.images.map(ii => ii.url)} decode={false} loader={<Loader/>}  className="Album-art"/>
      <div className="Album-artists">{album.artists.map(({name}) => name).join(' & ')}</div>
      <div>{album.name}</div>
      {isAdded ? <button type="button" onClick={onRemove} className="btn-red">Remove</button> : <button type="button" onClick={onAdd}>Add</button>}
    </div>
  );
}

function UserQueue() {
  const {viewer} = useViewer();
  let {userQueue} = useUserQueue({userId: viewer.id});
  let albums = userQueue.filter(ii=> ii.uri.includes('album'))
  let tracks = userQueue.filter(ii=> ii.uri.includes('track'))
  return <div>
    <h2>My Queue</h2>
    { userQueue.length > 0 ?
        <div className="Queue-grid">
          { albums.length > 0 ? 
            <div>
              <h3>Albums</h3>
              <div className="Album-grid"> 
                {albums.map(ii => <ItemDisplayFactory item={ii} isAdded={true}/>)} 
              </div> 
          </div> : <div/> }
          { tracks.length > 0 ? 
            <div>
              <h3>Tracks</h3>
              <div className="Album-grid"> 
                {tracks.map(ii => <ItemDisplayFactory item={ii} isAdded={true}/>)} 
              </div> 
          </div> : <div/> }
        </div> :
        <div>
          Nothing added <Link to="/searchAlbum">Search Albums</Link> or <Link to="/searchTrack">Search Tracks</Link> to populate your queue with you favorite tunes
        </div>
    }
  </div>
}

function AlbumSearch() {
  const {setSearchTerm, searchResults, searchTerm} = useAlbumSearch();
  const {viewer} = useViewer();
  let {userQueue} = useUserQueue({userId: viewer.id});
  const onQueryChange = (event) => {
    setSearchTerm(event.target.value)
  }
  console.log(userQueue.map(jj => jj.id))
  return (
    <div>
      
      <input type="text" value={searchTerm} onChange={onQueryChange} placeholder="Search Albums"/>
      <h2>Albums</h2>
      {
        searchResults && searchResults.length > 0 ?
        <div className="Album-grid">
          {searchResults.map(ii => <AlbumDisplay album={ii} isAdded={userQueue.map(jj => jj.id).includes(ii.id)}/>)}
        </div>
        :
        <div></div>
      }
    </div>
  )
}



function TrackSearch() {
  const {setSearchTerm, searchResults, searchTerm} = useTrackSearch();
  const {viewer} = useViewer();
  let {userQueue} = useUserQueue({userId: viewer.id});
  const onQueryChange = (event) => {
    setSearchTerm(event.target.value)
  }
  console.log(userQueue.map(jj => jj.id))
  return (
    <div>
      <input type="text" value={searchTerm} onChange={onQueryChange} placeholder="Search Tracks"/>
      <h2>Tracks</h2>
      {
        searchResults && searchResults.length > 0 ?
        <div>
          <div className="Album-grid">
            {searchResults.map(ii => <TrackDisplay track={ii} isAdded={userQueue.map(jj => jj.id).includes(ii.id)}/>)}
          </div>
        </div>
        :
        <div></div>
      }
    </div>
  )
}

function App() {
  const {currentTrack} = useCurrentTrack()
  return (
    <div className="App">
       <Router>
        <header className="App-header">
          <CurrentTrack/>
        </header>
        <div className="menu">
          <Link to="/">Queue</Link>
          <Link to="/searchAlbum">Search Albums</Link>
          <Link to="/searchTrack">Search Tracks</Link>
        </div>
        <div className="content"> 
          <Switch>
            <Route path="/searchAlbum">
              <AlbumSearch />
            </Route>
            <Route path="/searchTrack">
              <TrackSearch />
            </Route>
            <Route path="/">
              <UserQueue/>
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );

}

export default App;
