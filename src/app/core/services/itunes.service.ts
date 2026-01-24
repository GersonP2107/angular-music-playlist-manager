import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItunesSearchResponse, Song } from '../models/song.interface';

@Injectable({
    providedIn: 'root'
})
export class ItunesService {
    private apiUrl = 'https://itunes.apple.com/search';

    constructor(private http: HttpClient) { }

    searchSongs(term: string, limit: number = 20): Observable<Song[]> {
        const url = `${this.apiUrl}?term=${term}&media=music&limit=${limit}`;
        return this.http.jsonp<ItunesSearchResponse>(url, 'callback').pipe(
            map(response => response.results)
        );
    }
}
