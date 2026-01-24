import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.interface';

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
    private playlistService: PlaylistService
  ) { }

  async ngOnInit() {
    await this.loadPlaylists();
  }

  async loadPlaylists() {
    this.loading = true;
    const { data, error } = await this.playlistService.getPlaylists();
    this.loading = false;

    if (data) {
      this.playlists = data;
    } else if (error) {
      console.error('Error loading playlists:', error);
    }
  }

  createNew() {
    this.router.navigate(['/create-playlist']);
  }

  openPlaylist(id: string) {
    this.router.navigate(['/playlists', id]);
  }
}
