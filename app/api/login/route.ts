import { redirect } from 'next/navigation';

export async function GET() {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
  const scopes = 'user-read-private user-top-read user-read-recently-played playlist-modify-public playlist-modify-private';

  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error('Missing environment variables');
  }

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(scopes)}`;

  redirect(authUrl);
}