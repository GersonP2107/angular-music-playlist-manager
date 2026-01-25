import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItunesService } from '../../core/services/itunes.service';
import { Song } from '../../core/models/song.interface';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.html',
})
export class Search implements OnInit {
    searchTerm: string = '';
    songs: Song[] = [];
    loading: boolean = false;
    hasSearched: boolean = false;
    currentPlayingUrl: string | null = null;
    audio = new Audio();

    // Playlist Modal State
    showPlaylistModal = false;
    songToAdd: Song | null = null;
    userPlaylists: any[] = [];
    isAdding = false;

    constructor(
        private itunesService: ItunesService,
        private route: ActivatedRoute,
        private playlistService: PlaylistService,
        private authService: AuthService
    ) {
        this.audio.onended = () => {
            this.currentPlayingUrl = null;
        };
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const query = params['q'];
            if (query) {
                this.searchTerm = query;
                this.search();
            }
        });
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

    async openAddToPlaylistModal(song: Song) {
        this.songToAdd = song;
        this.showPlaylistModal = true;

        // Fetch playlists if empty
        if (this.userPlaylists.length === 0) {
            const { data: { session } } = await this.authService.getSession();
            if (session?.user) {
                const { data } = await this.playlistService.getPlaylists(session.user.id);
                if (data) this.userPlaylists = data;
            }
        }
    }

    closeModal() {
        this.showPlaylistModal = false;
        this.songToAdd = null;
    }

    async addToPlaylist(playlist: any) {
        if (!this.songToAdd) return;
        this.isAdding = true;

        const songData = {
            playlist_id: playlist.id,
            track_id: this.songToAdd.trackId.toString(),
            track_name: this.songToAdd.trackName,
            artist_name: this.songToAdd.artistName,
            collection_name: this.songToAdd.collectionName,
            artwork_url: this.songToAdd.artworkUrl100,
            preview_url: this.songToAdd.previewUrl,
            duration_ms: this.songToAdd.trackTimeMillis
        };

        try {
            const { error } = await this.playlistService.addSongToPlaylist(songData);
            if (error) {
                console.error('Error adding to playlist', error);
                alert('Error al añadir a la playlist');
            } else {
                this.closeModal();
                alert(`Añadida a ${playlist.name}`);
            }
        } catch (e) {
            console.error('Exception adding song', e);
        } finally {
            this.isAdding = false;
        }
    }

    async addToLikedSongs() {
        if (!this.songToAdd) return;
        this.isAdding = true;

        try {
            const result = await this.playlistService.toggleLike(this.songToAdd);
            this.closeModal();
            if (result) {
                alert('Añadida a tus Canciones Favoritas');
            } else {
                alert('Ya estaba en tus favoritos (o se eliminó)');
            }
        } catch (e) {
            console.error('Error adding to liked songs', e);
            alert('Error al añadir a favoritos');
        } finally {
            this.isAdding = false;
        }
    }
}
