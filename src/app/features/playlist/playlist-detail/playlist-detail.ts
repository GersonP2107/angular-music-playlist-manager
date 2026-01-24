import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { ItunesService } from '../../../core/services/itunes.service';
import { Playlist } from '../../../core/models/playlist.interface';
import { PlaylistSong } from '../../../core/models/playlist-song.interface';
import { Song } from '../../../core/models/song.interface';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-playlist-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './playlist-detail.html',
})
export class PlaylistDetail implements OnInit, OnDestroy {
    playlistId: string | null = null;
    playlist: Playlist | null = null;
    playlistSongs: PlaylistSong[] = [];
    loading = true;

    // Search state
    searchTerm = '';
    searchResults: Song[] = [];
    isSearching = false;
    currentPlayingUrl: string | null = null;
    audio: HTMLAudioElement | null = null;

    // Subscription management
    private subscriptions = new Subscription();

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private playlistService: PlaylistService,
        private itunesService: ItunesService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.audio = new Audio();
            this.audio.onended = () => {
                this.currentPlayingUrl = null;
                this.cdr.markForCheck();
            };
        }
    }

    ngOnInit() {
        // Subscribe to route changes to handle navigation between playlists
        const routeSub = this.route.paramMap.subscribe(params => {
            this.loadData();
        });
        this.subscriptions.add(routeSub);
    }

    ngOnDestroy() {
        // Clean up all subscriptions
        this.subscriptions.unsubscribe();

        // Stop any playing audio
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
        }
    }

    async loadData() {
        this.loading = true;

        // Reset state for new playlist to avoid showing stale data
        this.playlist = null;
        this.playlistSongs = [];
        this.searchResults = [];
        this.searchTerm = '';

        this.playlistId = this.route.snapshot.paramMap.get('id');

        if (this.playlistId) {
            try {
                await this.loadPlaylist();
                await this.loadSongs();
            } catch (error) {
                console.error('Error during init', error);
            } finally {
                this.loading = false;
                this.cdr.markForCheck();
            }
        } else {
            this.loading = false;
            this.cdr.markForCheck();
        }
    }

    async loadPlaylist() {
        if (!this.playlistId) return;
        const { data, error } = await this.playlistService.getPlaylist(this.playlistId);
        if (data) {
            this.playlist = data;
        }
        if (error) {
            console.error('Error loading playlist', error);
            // Don't alert immediately, handle in template
        }
    }

    async loadSongs() {
        if (!this.playlistId) return;
        const { data, error } = await this.playlistService.getPlaylistSongs(this.playlistId);
        if (data) this.playlistSongs = data;
        if (error) console.error('Error loading songs', error);
    }

    search() {
        if (!this.searchTerm.trim()) return;
        this.isSearching = true;
        this.cdr.markForCheck(); // Trigger check for loading state

        const searchSub = this.itunesService.searchSongs(this.searchTerm).subscribe(results => {
            this.searchResults = results;
            this.isSearching = false;
            this.cdr.markForCheck(); // Trigger check for results
        });
        this.subscriptions.add(searchSub);
    }

    // Modal States
    showAddModal = false;
    showRemoveModal = false;
    songToAdd: Song | null = null;
    songToRemoveId: string | null = null;
    isProcessing = false;

    // ... existing subscription code ...

    confirmAddSong(song: Song) {
        if (!this.playlistId) return;

        // Check availability locally first
        const exists = this.playlistSongs.some(s => s.track_id === song.trackId.toString());
        if (exists) {
            // Optional: You could show a specialized modal "Already exists"
            // For now, let's just use the add modal but maybe with a warning or just proceed to show it
            // usually you don't even confirm if it exists, you just say it exists.
            alert('Esta canción ya está en tu playlist'); // Keep simple alert for exists, or upgrade later
            return;
        }

        this.songToAdd = song;
        this.showAddModal = true;
    }

    cancelAdd() {
        this.showAddModal = false;
        this.songToAdd = null;
    }

    async executeAddSong() {
        if (!this.playlistId || !this.songToAdd) return;

        this.isProcessing = true;
        const song = this.songToAdd;

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

        this.isProcessing = false;
        this.showAddModal = false;
        this.songToAdd = null;

        if (data) {
            this.playlistSongs.unshift(data);
            this.searchResults = [];
            this.searchTerm = '';
            this.cdr.markForCheck();
        }
        if (error) console.error('Error adding song', error);
    }

    confirmRemoveSong(id: string) {
        this.songToRemoveId = id;
        this.showRemoveModal = true;
    }

    cancelRemove() {
        this.showRemoveModal = false;
        this.songToRemoveId = null;
    }

    async executeRemoveSong() {
        if (!this.songToRemoveId) return;

        this.isProcessing = true;
        const { error } = await this.playlistService.removeSongFromPlaylist(this.songToRemoveId);

        this.isProcessing = false;
        this.showRemoveModal = false;

        if (!error) {
            this.playlistSongs = this.playlistSongs.filter(s => s.id !== this.songToRemoveId);
            this.songToRemoveId = null;
            this.cdr.markForCheck();
        } else {
            console.error('Error removing song', error);
        }
    }

    playPreview(url: string) {
        if (!this.audio) return;

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
