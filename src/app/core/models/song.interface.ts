export interface Song {
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    previewUrl: string;
    collectionPrice?: number;
}

export interface ItunesSearchResponse {
    resultCount: number;
    results: Song[];
}
