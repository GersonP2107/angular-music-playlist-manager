import { Injectable, signal, computed, Inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Track } from '../models/track.interface';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private audio: HTMLAudioElement | null = null;

    // State
    // The current queue of tracks
    queue = signal<Track[]>([]);
    // The index of the current track in the queue
    currentIndex = signal<number>(-1);
    // The currently loaded track (derived or separate)
    currentTrack = computed(() => {
        const idx = this.currentIndex();
        const q = this.queue();
        return (idx >= 0 && idx < q.length) ? q[idx] : null;
    });

    isPlaying = signal<boolean>(false);
    currentTime = signal<number>(0);
    duration = signal<number>(0);
    volume = signal<number>(0.5);
    isShuffle = signal<boolean>(false);
    isRepeat = signal<boolean>(false);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.audio = new Audio();
            this.initAudioEvents();

            // Effect to update volume when signal changes
            effect(() => {
                if (this.audio) {
                    this.audio.volume = this.volume();
                }
            });
        }
    }

    private initAudioEvents() {
        if (!this.audio) return;

        this.audio.addEventListener('play', () => this.isPlaying.set(true));
        this.audio.addEventListener('pause', () => this.isPlaying.set(false));
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio) this.currentTime.set(this.audio.currentTime);
        });
        this.audio.addEventListener('loadedmetadata', () => {
            if (this.audio) this.duration.set(this.audio.duration);
        });
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error', e);
            this.isPlaying.set(false);
        });
    }

    private onEnded() {
        this.isPlaying.set(false);
        if (this.isRepeat()) {
            this.play(); // Replay current
        } else {
            this.next();
        }
    }

    play(track?: Track) {
        if (!this.audio) return;

        if (track) {
            // If playing a specific track not in the current position of queue
            // For simplicity, if we play a track directly, we might want to ensure it's in the queue
            // But if we just want to play it immediately (like from search), 
            // we can set a single-item queue or append it.
            // Let's assume if play(track) is called, we replace the queue with just this track 
            // OR we find it in the queue.
            // Better strategy: Add it to queue or just set it as current.
            // For now: Just play it.

            // If we are already playing this track, just resume
            const current = this.currentTrack();
            if (current && current.id === track.id) {
                this.audio.play();
                return;
            }

            // Force set queue to just this track if it's not part of a known queue context
            // (This is a simplification, can be improved)
            this.setQueue([track]);
            this.currentIndex.set(0);
        }

        // Play current index
        const current = this.currentTrack();
        if (!current) return;

        if (this.audio.src !== current.audioUrl) {
            this.audio.src = current.audioUrl;
            this.audio.load();
        }

        this.audio.play()
            .catch(err => console.error('Error playing audio:', err));
    }

    toggle() {
        if (!this.audio) return;
        if (this.isPlaying()) {
            this.audio.pause();
        } else {
            // If we have a track but it's paused
            if (this.currentTrack()) {
                this.audio.play();
            }
        }
    }

    next() {
        const q = this.queue();
        if (q.length === 0) return;

        let nextIdx = this.currentIndex() + 1;
        if (nextIdx >= q.length) {
            // End of queue. If repeat is on?
            nextIdx = 0; // Loop back or stop? 
            // Standard behavior: Stop unless repeat.
            // But let's loop for now or stop.
            // Let's stop
            this.audio?.pause();
            this.currentTime.set(0);
            return;
        }
        this.currentIndex.set(nextIdx);
        this.play(); // will pick up new current track
    }

    prev() {
        const q = this.queue();
        if (q.length === 0) return;

        // If we are more than 3 seconds in, restart song
        if (this.currentTime() > 3 && this.audio) {
            this.audio.currentTime = 0;
            return;
        }

        let prevIdx = this.currentIndex() - 1;
        if (prevIdx < 0) prevIdx = 0;
        this.currentIndex.set(prevIdx);
        this.play();
    }

    seek(time: number) {
        if (this.audio) {
            this.audio.currentTime = time;
        }
    }

    setVolume(vol: number) {
        this.volume.set(vol);
        // Effect handles the actual audio object update
    }

    setQueue(tracks: Track[], startIndex = 0) {
        this.queue.set(tracks);
        this.currentIndex.set(startIndex);
        // this.play(); // Don't auto play on setQueue unless requested? 
        // Usually setQueue is followed by play
    }

    playQueue(tracks: Track[], startIndex = 0) {
        this.setQueue(tracks, startIndex);
        this.play();
    }
}
