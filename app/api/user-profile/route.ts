import axios from 'axios';

interface SpotifyUserProfile {
  id: string;
  display_name: string;
  images: { url: string }[];
  followers: { total: number };
  country: string;
  email: string; // Optional, requires user-read-email scope
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Missing access_token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Fetching user profile with token:', accessToken.slice(0, 10) + '...');
    const response = await axios.get<SpotifyUserProfile>('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userProfile = {
      id: response.data.id,
      display_name: response.data.display_name,
      images: response.data.images,
      followers: response.data.followers,
      country: response.data.country,
    };
    console.log('Fetched user profile for:', userProfile.display_name);

    return new Response(JSON.stringify(userProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('User profile error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 401) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - please re-login' }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch user profile',
        details: error.response?.data || error.message,
      }),
      { status: 500 }
    );
  }
}