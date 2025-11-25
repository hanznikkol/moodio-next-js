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

export interface SpotifyPlayback {
    is_playing: boolean
    item: SpotifyTrack;
}

export interface SpotifyUserProfile {
    display_name: string;
    id: string;
    images: { url: string }[];
}

