// /api/user-music-stats.ts or /app/api/user-music-stats/route.ts
import axios from 'axios';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { 
    name: string; 
    images: { url: string }[] 
  };
}

interface SpotifyRecentTrack {
  track: SpotifyTrack;
  played_at: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return new Response('Missing access token', { status: 400 });
  }

  try {
    // Fetch top tracks
    const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10, time_range: 'short_term' },
    });

    // Fetch recently played
    const recentTracksResponse = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 },
    });

    // Format top tracks with images
    const topTracks = topTracksResponse.data.items.map((track: SpotifyTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url || null, // Get the first image or null if none exists
    }));

    // Format recent tracks with images
    const recentTracks = recentTracksResponse.data.items.map((item: SpotifyRecentTrack) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      image: item.track.album.images[0]?.url || null, // Get the first image or null if none exists
      played_at: item.played_at,
    }));

    return new Response(JSON.stringify({ topTracks, recentTracks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching music stats:', error.response?.data || error.message);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch music stats', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}