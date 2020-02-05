import React, { useState, useEffect } from 'react';
import {SearchTrackSub} from './api'

const searchTrackSub = SearchTrackSub();
export default function useAlbumSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    useEffect(() => {
        searchTrackSub.next(searchTerm);
    })
    searchTrackSub.subscribe(({tracks}) => {
        setSearchResults(tracks.items);
    })
    
    return {setSearchTerm, searchResults, searchTerm};
}