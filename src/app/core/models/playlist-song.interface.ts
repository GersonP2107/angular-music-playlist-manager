export interface PlaylistSong {
    id: string; // Table ID
    playlist_id: string;
    track_id: string;
    track_name: string;
    artist_name: string;
    collection_name: string;
    artwork_url: string;
    preview_url: string;
    duration_ms?: number;
    added_at: string;
}
