import React from 'react';
import logo from './logo.svg';
import useCurrentTrack from './useCurrentTrack'
import useAlbumSearch from './useAlbumSearch'
import Img from 'react-image'
import './App.css';

function Loader(){
  // return <img src="/queuer-isometric.svg"/>
  return <img src="/record-loader.svg" className="loader"/>
}

function CurrentTrack() {
  const {currentTrack} = useCurrentTrack()
  if(currentTrack){
    return (
      <div className="currentTrack">
        <div>
          <Img  src={currentTrack.artUrl}/>
        </div>
        <div>{currentTrack.artist.join(' & ')}</div>
        <div>{currentTrack.title}</div>
        <div>{currentTrack.album}</div>
      </div>
    )
  } else  {
    return <div>Nothing Playing</div>
  }
}

function AlbumDisplay({album}){
  console.log(album)
  let [image] = album.images;
  return (
    <div className="Album-display">
      <Img src={album.images.map(ii => ii.url)} decode={false} loader={<Loader/>}/>
      <div className="Album-artists">{album.artists.map(({name}) => name).join(' & ')}</div>
      <div>{album.name}</div>  
      {/* <div>{album.release_date}</div> */}
      <button type="button">Add</button>   
    </div>
  );
}

function AlbumSearch() {
  const {setSearchTerm, searchResults, searchTerm} = useAlbumSearch();
  console.log(searchResults)
  const onQueryChange = (event) => {
    setSearchTerm(event.target.value)
  }
  return (
    <div>
      <input type="text" value={searchTerm} onChange={onQueryChange} />
      <div className="Album-grid">
        {searchResults.map(ii => <AlbumDisplay album={ii}/>)}
      </div>
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
      <AlbumSearch/>
    </div>
  );

}

export default App;
