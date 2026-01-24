import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.interface';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-playlist-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-list.html',
  styleUrl: './playlist-list.css',
})
export class PlaylistList implements OnInit {
  playlists: Playlist[] = [];
  loading = true;

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
}
