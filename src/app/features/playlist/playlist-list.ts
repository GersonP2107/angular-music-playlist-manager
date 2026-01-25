import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.interface';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-playlist-list',
  standalone: true,
  imports: [],
  templateUrl: './playlist-list.html',
  styleUrl: './playlist-list.css',
})
export class PlaylistList implements OnInit {
  playlists: Playlist[] = [];
  loading = true;
  activeMenuId: string | null = null;

  // Delete modal state
  showDeleteModal = false;
  playlistToDelete: Playlist | null = null;
  isDeleting = false;

  constructor(
    private router: Router,
    private playlistService: PlaylistService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  async ngOnInit() {
    await this.loadInitialData();
  }

  async loadInitialData() {
    this.loading = true;

    try {
      // Try to get user from session first
      const { data: { session } } = await this.authService.getSession();

      if (session?.user) {
        await this.loadPlaylists(session.user.id);
      } else {
        console.log('No user session found');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
  async loadPlaylists(userId: string) {
    try {
      const { data, error } = await this.playlistService.getPlaylists(userId);
      if (data) {
        this.playlists = data;
      }
      if (error) {
        console.error('Error loading playlists:', error);
      }
    } catch (e) {
      console.error('Exception loading playlists', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Force UI update
    }
  }

  createNew() {
    this.router.navigate(['/create-playlist']);
  }

  openPlaylist(id: string) {
    this.router.navigate(['/playlists', id]);
  }

  toggleMenu(event: Event, id: string) {
    event.stopPropagation();
    if (this.activeMenuId === id) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = id;
    }
  }

  editPlaylist(event: Event, id: string) {
    event.stopPropagation();
    this.router.navigate(['/edit-playlist', id]);
    this.activeMenuId = null;
  }

  confirmDelete(event: Event, playlist: Playlist) {
    event.stopPropagation();
    this.playlistToDelete = playlist;
    this.showDeleteModal = true;
    this.activeMenuId = null;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.playlistToDelete = null;
  }

  async deletePlaylist() {
    if (!this.playlistToDelete) return;

    this.isDeleting = true;
    try {
      const { error } = await this.playlistService.deletePlaylist(this.playlistToDelete.id);
      if (error) {
        console.error('Error deleting playlist:', error);
        alert('Error al eliminar la playlist');
      } else {
        // Remove locally
        this.playlists = this.playlists.filter(p => p.id !== this.playlistToDelete?.id);
        this.showDeleteModal = false;
        this.playlistToDelete = null;
      }
    } catch (e) {
      console.error('Exception deleting playlist:', e);
    } finally {
      this.isDeleting = false;
      this.cdr.markForCheck();
    }
  }

  // Close menu when clicking outside (simple implementation: backdrop or directive preferred, 
  // but for now user has to click toggle or another menu)
  closeMenu(event: Event) {
    if (this.activeMenuId) {
      this.activeMenuId = null;
    }
  }
}
