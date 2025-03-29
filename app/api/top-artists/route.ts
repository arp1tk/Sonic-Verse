import axios from 'axios';

interface Artist {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  images: { url: string }[];
}

interface TopArtistsResponse {
  items: Artist[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');
  const timeRange = searchParams.get('time_range') || 'medium_term';

  if (!accessToken) {
    return new Response('Missing access token', { status: 400 });
  }

  try {
    const response = await axios.get<TopArtistsResponse>(
      'https://api.spotify.com/v1/me/top/artists',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          time_range: timeRange,
          limit: 50
        }
      }
    );

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch top artists' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}