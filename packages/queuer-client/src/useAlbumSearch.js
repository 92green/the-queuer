import React, { useState, useEffect } from 'react';
import {SearchAlbumSub} from './api'

const searchAlbumSub = SearchAlbumSub();
export default function useAlbumSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    useEffect(() => {
        searchAlbumSub.next(searchTerm);
    })
    searchAlbumSub.subscribe(({albums}) => {
        setSearchResults(albums.items);
    })
    
    return {setSearchTerm, searchResults, searchTerm};
}