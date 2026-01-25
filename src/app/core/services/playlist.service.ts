import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Playlist } from '../models/playlist.interface';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {

    constructor(private supabase: SupabaseService) { }

    private likedPlaylistId: string | null = null;

    async getLikedSongsPlaylist(): Promise<Playlist | null> {
        const { data: { user } } = await this.supabase.client.auth.getUser();
        if (!user) return null;

        if (this.likedPlaylistId) {
            const { data } = await this.supabase.client
                .from('playlists')
                .select('*')
                .eq('id', this.likedPlaylistId)
                .single();
            if (data) return data;
        }

        // Try to find existing
        const { data } = await this.supabase.client
            .from('playlists')
            .select('*')
            .eq('user_id', user.id)
            .eq('name', 'Liked Songs')
            .single();

        if (data) {
            this.likedPlaylistId = data.id;
            return data;
        }

        // Create if not exists
        const { data: newPlaylist, error } = await this.supabase.client
            .from('playlists')
            .insert({
                user_id: user.id,
                name: 'Liked Songs',
                description: 'Tus canciones favoritas',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating Liked Songs playlist:', error);
            return null;
        }

        if (newPlaylist) this.likedPlaylistId = newPlaylist.id;
        return newPlaylist;
    }

    async checkIfLiked(trackId: string): Promise<boolean> {
        if (!trackId) return false;

        const playlist = await this.getLikedSongsPlaylist();
        if (!playlist) return false;

        const { data } = await this.supabase.client
            .from('playlist_songs')
            .select('id')
            .eq('playlist_id', playlist.id)
            .eq('track_id', trackId)
            .single();

        return !!data;
    }

    async toggleLike(track: any): Promise<boolean> {
        const playlist = await this.getLikedSongsPlaylist();
        if (!playlist) throw new Error('No playlist found. User might not be logged in or creation failed.');

        // Use the explicit trackId if available (robustness), otherwise fallback to id
        const trackId = track.trackId?.toString() || track.id?.toString();
        if (!trackId) throw new Error('Invalid track ID');

        // Check if exists
        const { data: existing } = await this.supabase.client
            .from('playlist_songs')
            .select('id')
            .eq('playlist_id', playlist.id)
            .eq('track_id', trackId)
            .single();

        if (existing) {
            await this.supabase.client
                .from('playlist_songs')
                .delete()
                .eq('id', existing.id);
            return false; // Unliked
        } else {
            // Map standard Track or Song interface to DB schema
            const { error } = await this.supabase.client
                .from('playlist_songs')
                .insert({
                    playlist_id: playlist.id,
                    track_id: trackId,
                    track_name: track.title || track.trackName,
                    artist_name: track.artist || track.artistName,
                    collection_name: track.album || track.collectionName || '',
                    artwork_url: track.artworkUrl || track.artworkUrl100,
                    preview_url: track.audioUrl || track.previewUrl,
                    duration_ms: track.durationMs || track.trackTimeMillis || 0
                });

            if (error) {
                console.error('Error adding like:', error);
                throw error;
            }
            return true; // Liked
        }
    }


    async getPlaylists(userId?: string): Promise<PostgrestResponse<Playlist>> {
        let query = this.supabase.client
            .from('playlists')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        return query;
    }

    async getPlaylist(id: string): Promise<PostgrestSingleResponse<Playlist>> {
        return this.supabase.client
            .from('playlists')
            .select('*')
            .eq('id', id)
            .single();
    }

    async createPlaylist(playlist: Partial<Playlist>): Promise<PostgrestSingleResponse<Playlist>> {
        return this.supabase.client
            .from('playlists')
            .insert(playlist)
            .select()
            .single();
    }

    async updatePlaylist(id: string, updates: Partial<Playlist>): Promise<PostgrestSingleResponse<Playlist>> {
        return this.supabase.client
            .from('playlists')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
    }

    async deletePlaylist(id: string): Promise<PostgrestSingleResponse<null>> {
        return this.supabase.client
            .from('playlists')
            .delete()
            .eq('id', id);
    }

    async uploadImage(filePath: string, file: File) {
        return this.supabase.client.storage
            .from('playlist-images')
            .upload(filePath, file);
    }

    getImageUrl(filePath: string): string {
        const { data } = this.supabase.client.storage
            .from('playlist-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async getPlaylistSongs(playlistId: string): Promise<PostgrestResponse<any>> {
        return this.supabase.client
            .from('playlist_songs')
            .select('*')
            .eq('playlist_id', playlistId)
            .order('added_at', { ascending: false });
    }

    async addSongToPlaylist(songData: any): Promise<PostgrestSingleResponse<any>> {
        return this.supabase.client
            .from('playlist_songs')
            .insert(songData)
            .select()
            .single();
    }

    async removeSongFromPlaylist(id: string): Promise<PostgrestSingleResponse<null>> {
        return this.supabase.client
            .from('playlist_songs')
            .delete()
            .eq('id', id);
    }
}
