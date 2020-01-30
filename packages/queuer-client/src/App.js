import React from 'react';
import logo from './logo.svg';
import useCurrentTrack from './useCurrentTrack'
import useAlbumSearch from './useAlbumSearch'
import './App.css';

function CurrentTrack() {
  const {currentTrack} = useCurrentTrack()
  if(currentTrack){
    return (
      <div>
        <img src={currentTrack.artUrl}/>
        <div>{currentTrack.title}</div>
        <div>{currentTrack.artist.join(' & ')}</div>
        <div>{currentTrack.album}</div>
      </div>
    )
  } else  {
    return <div>Nothing Playing</div>
  }
}


function AlbumSearch() {
  const {setSearchTerm, searchResults, searchTerm} = useAlbumSearch();
  const onQueryChange = (event) => {
    setSearchTerm(event.target.value)
  }
  return (
    <div>
      <input type="text" value={searchTerm} onChange={onQueryChange} />
      <pre>
        {JSON.stringify(searchResults)}
      </pre>
    </div>
  )
}

function App() {
  const {currentTrack} = useCurrentTrack()
  return (
    <div className="App">
      <header className="App-header">
        <CurrentTrack/>
        <AlbumSearch/>
      </header>
    </div>
  );

}

export default App;
