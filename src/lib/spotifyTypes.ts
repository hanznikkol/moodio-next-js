export interface SpotifyArtist {
    name: string
}

export interface SpotifyTrack {
    id: string,
    name: string,
    artists: SpotifyArtist[],
    external_urls: { spotify: string };
    preview_url?: string;
}