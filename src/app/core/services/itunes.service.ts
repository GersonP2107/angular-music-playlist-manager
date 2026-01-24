import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ItunesSearchResponse, Song } from '../models/song.interface';
import { MOCK_MUSIC } from '../data/mock-music.data';

@Injectable({
    providedIn: 'root'
})
export class ItunesService {
    // private apiUrl = 'https://itunes.apple.com/search'; // Disabled for mock

    constructor(private http: HttpClient) { }

    searchSongs(term: string, limit: number = 20): Observable<Song[]> {
        // Mock implementation
        if (!term.trim()) {
            return of([]);
        }

        const lowerTerm = term.toLowerCase();

        // Filter mock music
        const results = MOCK_MUSIC.filter(song =>
            song.trackName.toLowerCase().includes(lowerTerm) ||
            song.artistName.toLowerCase().includes(lowerTerm) ||
            song.collectionName.toLowerCase().includes(lowerTerm)
        );

        // Simulate network delay for realism
        return of(results).pipe(delay(50));
    }
}
