import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { PlayerService } from '../../../core/services/player.service';
import { ItunesService } from '../../../core/services/itunes.service';
import { Playlist } from '../../../core/models/playlist.interface';
import { PlaylistSong } from '../../../core/models/playlist-song.interface';
import { Song } from '../../../core/models/song.interface';
import { Track } from '../../../core/models/track.interface';
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

    // Computed or helpers for player state
    // Accessed directly from playerService

    // Subscription management
    private subscriptions = new Subscription();

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private playlistService: PlaylistService,
        private itunesService: ItunesService,
        public playerService: PlayerService,
        private cdr: ChangeDetectorRef,
    ) { }

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
    }

    async loadData() {
        this.loading = true;

        // Reset state for new playlist to avoid showing stale data
        this.playlist = null;
        this.playlistSongs = [];
        this.searchResults = [];
        this.searchTerm = '';

        this.playlistId = this.route.snapshot.paramMap.get('id');
        const isLikedPage = this.route.snapshot.data['isLiked'];

        if (isLikedPage) {
            try {
                const likedPlaylist = await this.playlistService.getLikedSongsPlaylist();
                if (likedPlaylist) {
                    this.playlistId = likedPlaylist.id;
                    this.playlist = likedPlaylist;
                    await this.loadSongs();
                } else {
                    console.error('Could not load liked playlist');
                }
            } catch (error) {
                console.error('Error loading liked playlist', error);
            } finally {
                this.loading = false;
                this.cdr.markForCheck();
            }
        } else if (this.playlistId) {
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
        }
    }

    async loadSongs() {
        if (!this.playlistId) return;
        const { data, error } = await this.playlistService.getPlaylistSongs(this.playlistId);
        if (data) this.playlistSongs = data;
        if (error) console.error('Error loading songs', error);
    }

    // Allow searching only on regular playlists, usually liked songs are just a collection
    // But user might want to search to add TO liked songs. 
    // This is fine, since Add logic adds to current playlistId.
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


    confirmAddSong(song: Song) {
        if (!this.playlistId) return;

        // Check availability locally first
        const exists = this.playlistSongs.some(s => s.track_id === song.trackId.toString());
        if (exists) {
            alert('Esta canción ya está en tu playlist');
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
            preview_url: song.previewUrl,
            duration_ms: song.trackTimeMillis
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

    // Player Helpers

    // Play the playlist starting from the first song
    playPlaylist() {
        if (!this.playlistSongs.length) return;
        const tracks = this.mapPlaylistSongsToTracks(this.playlistSongs);
        this.playerService.playQueue(tracks, 0);
    }

    // Play a specific song from the playlist (setting the context to the playlist)
    playFromPlaylist(index: number) {
        const song = this.playlistSongs[index];
        if (this.isSongPlaying(song)) {
            this.playerService.toggle();
            return;
        }

        const tracks = this.mapPlaylistSongsToTracks(this.playlistSongs);
        this.playerService.playQueue(tracks, index);
    }

    playSearchResult(song: Song) {
        if (this.isSearchResultPlaying(song)) {
            this.playerService.toggle();
            return;
        }

        const track: Track = {
            id: song.trackId.toString(),
            trackId: song.trackId.toString(), // Explicit ID
            title: song.trackName,
            artist: song.artistName,
            album: song.collectionName,
            artworkUrl: song.artworkUrl100,
            audioUrl: song.previewUrl,
            durationMs: song.trackTimeMillis
        };
        this.playerService.play(track);
    }

    private mapPlaylistSongsToTracks(songs: PlaylistSong[]): Track[] {
        return songs.map(s => ({
            id: s.id, // using playlist_song id to identify the specific item in playlist
            trackId: s.track_id, // Explicit ID from DB
            title: s.track_name,
            artist: s.artist_name,
            album: s.collection_name,
            artworkUrl: s.artwork_url,
            audioUrl: s.preview_url,
            durationMs: s.duration_ms
        }));
    }

    // Helper to check if a playlist song is currently playing
    isSongPlaying(song: PlaylistSong): boolean {
        const current = this.playerService.currentTrack();
        return !!current && current.id === song.id && this.playerService.isPlaying();
    }

    isSearchResultPlaying(song: Song): boolean {
        const current = this.playerService.currentTrack();
        // For search results, we rely on trackId mapping or url if trackId not available or ambiguous
        // In search result play, we mapped id = song.trackId.toString()
        return !!current && current.id === song.trackId.toString() && this.playerService.isPlaying();
    }
}
