import {webSocket} from "rxjs/webSocket";
import {defer} from 'rxjs'
import {share, filter, first, tap, map, flatMap} from 'rxjs/operators';
import uuidv4 from 'uuid/v4'
import {Subject} from 'rxjs'
import {distinctUntilChanged, debounceTime} from 'rxjs/operators'

const subject = webSocket("ws://localhost:8080");


export function subscribeToUserQueue({userId}){
    const id = uuidv4();
    return subject.pipe(
        share(),
        doOnSubscribe(() =>  {
            subject.next({
                type: 'SUBSCRIBE_USER_QUEUE',
                id,
                userId
            })
        }),
        filter(ii => ii.id === id),
        tap(ii => console.log(ii))
    )
}

export function addToUserQueue({userId, item}){
    console.log('USERID', userId)
    const id = uuidv4();
    return subject.next({
        type: 'ADD_USER_QUEUE',
        id,
        userId,
        item
    });
}

export function subscribeToTrackChange(){
    const id = uuidv4();
    
    return subject.pipe(
        share(),
        doOnSubscribe(() =>  {
            subject.next({
                type: 'SUBSCRIBE_CURRENT_TRACK',
                id
            })
        }),
        filter(ii => ii.id === id)
    )
}

export function SearchAlbumSub(){
    const searchAlbumSubject = new Subject();
    const id = uuidv4();

    return searchAlbumSubject.pipe(
        distinctUntilChanged(),
        debounceTime(20),
        flatMap((query) => {
            subject.next({
                type: 'SEARCH_ALBUM',
                id,
                query
            });
            return subject.pipe(
                filter(ii => ii.id === id && ii.data && ii.data.albums),
                map(ii => ii.data)
            )
        }),
        share(),
    );
} 

function doOnSubscribe<T>(onSubscribe: () => void): (source: Observable<T>) =>  Observable<T> {
    return function inner(source: Observable<T>): Observable<T> {
        return defer(() => {
          onSubscribe();
          return source;
        });
    };
}

