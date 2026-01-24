import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Playlist } from '../models/playlist.interface';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {

    constructor(private supabase: SupabaseService) { }

    async getPlaylists(): Promise<PostgrestResponse<Playlist>> {
        return this.supabase.client
            .from('playlists')
            .select('*')
            .order('created_at', { ascending: false });
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
