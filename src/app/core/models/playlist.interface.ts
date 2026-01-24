export interface Playlist {
    id: string; // UUID from supabase is string
    user_id: string;
    name: string;
    description?: string;
    image_url?: string;
    created_at: string;
    // Optional for UI
    count?: number;
    creator?: string;
}
