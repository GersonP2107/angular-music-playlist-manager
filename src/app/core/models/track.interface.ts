export interface Track {
    id: string; // unique identifier (could be database id or itunes trackId stringified)
    trackId?: string; // Explicit iTunes Track ID for data consistency
    title: string;
    artist: string;
    album: string;
    artworkUrl: string;
    audioUrl: string;
    durationMs?: number;
}
