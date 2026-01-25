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
    private apiUrl = 'https://itunes.apple.com/search';

    constructor(private http: HttpClient) { }

    searchSongs(term: string, limit: number = 20): Observable<Song[]> {
        if (!term.trim()) {
            return of([]);
        }

        // Use JSONP if possible or just GET. iTunes API supports CORS usually.
        // We will try GET first.
        const url = `${this.apiUrl}?term=${encodeURIComponent(term)}&media=music&limit=${limit}`;

        return this.http.get<ItunesSearchResponse>(url).pipe(
            map(res => res.results || [])
        );
    }
}
