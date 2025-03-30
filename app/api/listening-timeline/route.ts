import axios from 'axios';
import { NextResponse } from 'next/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 400 });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/me/player/recently-played`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: { limit: 50 },
    });


    const tracks = response.data.items.map((item: any) => ({
      playedAt: item.played_at,
      trackName: item.track.name,
      artist: item.track.artists[0].name,
      energy: item.track.energy || 0.5,
      durationMs: item.track.duration_ms,
      albumArt: item.track.album.images[0]?.url || '',
    }));

    // Process into hourly buckets
    const now = new Date();
    const timelineData = Array(24).fill(0).map((_, hour) => {
      const startTime = new Date(now);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(hour + 1, 0, 0, 0);

      const tracksInHour = tracks.filter((track: any) => {
        const playedAt = new Date(track.playedAt);
        return playedAt >= startTime && playedAt < endTime;
      });

      const topTrack = tracksInHour[0] || null;

      return {
        hour,
        trackCount: tracksInHour.length,
        avgEnergy: tracksInHour.length
          ? tracksInHour.reduce((sum: number, track: any) => sum + track.energy, 0) / tracksInHour.length
          : 0,
        tracks: tracksInHour,
        topTrack: topTrack
          ? { name: topTrack.trackName, artist: topTrack.artist, albumArt: topTrack.albumArt }
          : null,
      };
    });

    return NextResponse.json({ timeline: timelineData });
  } catch (error: any) {
    console.error('Listening Timeline Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listening timeline', details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}