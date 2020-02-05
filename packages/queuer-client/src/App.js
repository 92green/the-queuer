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
  // console.log('viewer queue', viewerQueue)
  return <div>
    <h2>My Queue</h2>
    <div className="Album-grid">
        {userQueue.map(ii => <ItemDisplayFactory item={ii} isAdded={true}/>)}
    </div>
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
      
      {
        searchResults && searchResults.length > 0 ?
        <div>
          <div className="Album-grid">
            {searchResults.map(ii => <TrackDisplay track={ii} isAdded={userQueue.map(jj => jj.id).includes(ii.id)}/>)}
          </div>
          <pre>
            {JSON.stringify(searchResults, null, 3)}
          </pre>
          
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
