import { Component, computed, signal, effect, Injector, runInInjectionContext } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { PlaylistService } from '../services/playlist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  isLiked = signal<boolean>(false);

  constructor(public player: PlayerService, private playlistService: PlaylistService) {
    effect(() => {
      const track = this.player.currentTrack();
      if (track) {
        this.checkLikeStatus(track.id);
      } else {
        this.isLiked.set(false);
      }
    });
  }

  async checkLikeStatus(trackId: string) {
    try {
      const liked = await this.playlistService.checkIfLiked(trackId);
      this.isLiked.set(liked);
    } catch (e) {
      console.error('Error checking like status', e);
    }
  }

  async toggleLike() {
    const track = this.player.currentTrack();
    if (!track) return;

    // Optimistic update
    const previousState = this.isLiked();
    this.isLiked.set(!previousState);

    try {
      const result = await this.playlistService.toggleLike(track);
      this.isLiked.set(result); // Sync with actual result
    } catch (e) {
      console.error('Error toggling like', e);
      this.isLiked.set(previousState); // Revert on error
      alert('Error al actualizar favoritos. Asegúrate de haber iniciado sesión.');
    }
  }

  // Helpers for time display
  get progress() {
    if (this.player.duration() === 0) return 0;
    return (this.player.currentTime() / this.player.duration()) * 100;
  }

  onSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    const time = (value / 100) * this.player.duration();
    this.player.seek(time);
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.player.setVolume(value / 100);
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
