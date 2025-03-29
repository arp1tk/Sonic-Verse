import axios from 'axios';

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return new Response('Missing environment variables', { status: 500 });
  }

  try {
    const response = await axios.post<TokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, expires_in, refresh_token } = response.data;

    // Calculate expiration timestamp (current time + expires_in seconds)
    const expiresAt = Date.now() + expires_in * 1000; // Convert to milliseconds

    // Include access_token, expires_at, and refresh_token in the redirect URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/?access_token=${access_token}&expires_at=${expiresAt}&refresh_token=${refresh_token}`,
      },
    });
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    return new Response(
      JSON.stringify({
        error: 'Error during authentication',
        details: error.response?.data || error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}