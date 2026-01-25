export interface Song {
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    previewUrl: string;
    trackTimeMillis?: number;
    collectionPrice?: number;
}

export interface ItunesSearchResponse {
    resultCount: number;
    results: Song[];
}
