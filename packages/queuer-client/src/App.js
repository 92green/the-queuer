import React from 'react';
import logo from './logo.svg';
import useCurrentTrack from './useCurrentTrack'
import useAlbumSearch from './useAlbumSearch'
import {useState} from 'react';
import Img from 'react-image'
import './App.css';
import useViewerQueue from './useViewerQueue'
function Loader(){
  // return <img src="/queuer-isometric.svg"/>
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

function AlbumDisplay({album}){
  let {addToViewerQueue} = useViewerQueue();
  let [disabled, setDisabled] = useState(false)
  const onAdd = () => {
    addToViewerQueue({item: album});
    setDisabled(true);
  }
  return (
    <div className="Album-display">
      <Img src={album.images.map(ii => ii.url)} decode={false} loader={<Loader/>}  className="Album-art"/>
      <div className="Album-artists">{album.artists.map(({name}) => name).join(' & ')}</div>
      <div>{album.name}</div>
      <button type="button" onClick={onAdd} disabled={disabled}>Add</button>   
    </div>
  );
}

function AlbumSearch() {
  const {setSearchTerm, searchResults, searchTerm} = useAlbumSearch();
  const onQueryChange = (event) => {
    setSearchTerm(event.target.value)
  }
  return (
    <div>
      <input type="text" value={searchTerm} onChange={onQueryChange} placeholder="Search Albums"/>
      
      {
        searchResults && searchResults.length > 0 ?
        <div className="Album-grid">
          {searchResults.map(ii => <AlbumDisplay album={ii}/>)}
        </div>
        :
        <div>Type in the serach box to find an album</div>
      }
    </div>
  )
}

function App() {
  const {currentTrack} = useCurrentTrack()
  return (
    <div className="App">
      <header className="App-header">
        <CurrentTrack/>
      </header>
      <div className="content"> 
        <AlbumSearch />
      </div>
      
    </div>
  );

}

export default App;
