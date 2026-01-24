import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { ItunesService } from '../../../core/services/itunes.service';
import { Playlist } from '../../../core/models/playlist.interface';
import { PlaylistSong } from '../../../core/models/playlist-song.interface';
import { Song } from '../../../core/models/song.interface';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-playlist-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './playlist-detail.html',
})
export class PlaylistDetail implements OnInit {
    playlistId: string | null = null;
    playlist: Playlist | null = null;
    playlistSongs: PlaylistSong[] = [];
    loading = true;

    // Search state
    searchTerm = '';
    searchResults: Song[] = [];
    isSearching = false;
    currentPlayingUrl: string | null = null;
    audio = new Audio();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private playlistService: PlaylistService,
        private itunesService: ItunesService
    ) {
        this.audio.onended = () => this.currentPlayingUrl = null;
    }

    async ngOnInit() {
        this.playlistId = this.route.snapshot.paramMap.get('id');
        if (this.playlistId) {
            await this.loadPlaylist();
            await this.loadSongs();
        }
    }

    async loadPlaylist() {
        if (!this.playlistId) return;
        const { data, error } = await this.playlistService.getPlaylist(this.playlistId);
        if (data) this.playlist = data;
        if (error) console.error('Error loading playlist', error);
    }

    async loadSongs() {
        if (!this.playlistId) return;
        const { data, error } = await this.playlistService.getPlaylistSongs(this.playlistId);
        if (data) this.playlistSongs = data;
        this.loading = false;
    }

    search() {
        if (!this.searchTerm.trim()) return;
        this.isSearching = true;
        this.itunesService.searchSongs(this.searchTerm).subscribe(results => {
            this.searchResults = results;
            this.isSearching = false;
        });
    }

    async addSong(song: Song) {
        if (!this.playlistId) return;

        // Check if song already exists in playlist (simple check by trackId)
        // Note: trackId from iTunes is number, stored as string in DB for flexibility
        const exists = this.playlistSongs.some(s => s.track_id === song.trackId.toString());
        if (exists) {
            alert('Esta canción ya está en tu playlist');
            return;
        }

        const songData = {
            playlist_id: this.playlistId,
            track_id: song.trackId.toString(),
            track_name: song.trackName,
            artist_name: song.artistName,
            collection_name: song.collectionName,
            artwork_url: song.artworkUrl100,
            preview_url: song.previewUrl
        };

        const { data, error } = await this.playlistService.addSongToPlaylist(songData);
        if (data) {
            this.playlistSongs.unshift(data);
            // Clear search to show added song
            this.searchResults = [];
            this.searchTerm = '';
        }
        if (error) console.error('Error adding song', error);
    }

    async removeSong(id: string) {
        if (!confirm('¿Estás seguro de quitar esta canción?')) return;

        const { error } = await this.playlistService.removeSongFromPlaylist(id);
        if (!error) {
            this.playlistSongs = this.playlistSongs.filter(s => s.id !== id);
        } else {
            console.error('Error removing song', error);
        }
    }

    playPreview(url: string) {
        if (this.currentPlayingUrl === url) {
            this.audio.pause();
            this.currentPlayingUrl = null;
        } else {
            this.audio.pause();
            this.currentPlayingUrl = url;
            this.audio.src = url;
            this.audio.play();
        }
    }
}
