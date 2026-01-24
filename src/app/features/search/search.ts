import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItunesService } from '../../core/services/itunes.service';
import { Song } from '../../core/models/song.interface';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.html',
})
export class Search {
    searchTerm: string = '';
    songs: Song[] = [];
    loading: boolean = false;
    hasSearched: boolean = false;
    currentPlayingUrl: string | null = null;
    audio = new Audio();

    constructor(private itunesService: ItunesService) {
        this.audio.onended = () => {
            this.currentPlayingUrl = null;
        };
    }

    search() {
        if (!this.searchTerm.trim()) return;

        this.loading = true;
        this.hasSearched = true;
        this.currentPlayingUrl = null;
        this.audio.pause();

        this.itunesService.searchSongs(this.searchTerm).subscribe({
            next: (results) => {
                this.songs = results;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error searching songs:', error);
                this.loading = false;
            }
        });
    }

    playPreview(url: string) {
        if (this.currentPlayingUrl === url) {
            this.audio.pause();
            this.currentPlayingUrl = null;
        } else {
            if (this.currentPlayingUrl) {
                this.audio.pause();
            }
            this.currentPlayingUrl = url;
            this.audio.src = url;
            this.audio.play();
        }
    }
}
