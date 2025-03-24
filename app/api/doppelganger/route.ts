import axios from 'axios';
import { NextResponse } from 'next/server';

interface AudioFeatures {
  danceability: number;
  energy: number;
}

interface Doppelganger {
  name: string;
  genres: string[];
  audioFeatures: AudioFeatures;
  description: string;
}

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const doppelgangers: Doppelganger[] = [
  {
    name: 'Dr. Dre',
    genres: ['rap', 'hip hop', 'west coast hip hop'],
    audioFeatures: { danceability: 0.7, energy: 0.8 },
    description: 'You are Dr. Dre, laying down beats that shake the West Coast.',
  },
  {
    name: 'A.R. Rahman',
    genres: ['bollywood', 'hindi pop', 'sufi'],
    audioFeatures: { danceability: 0.6, energy: 0.5 },
    description: 'You are A.R. Rahman, weaving soulful melodies with a Bollywood twist.',
  },
  {
    name: 'Badshah',
    genres: ['desi hip hop', 'hindi hip hop', 'punjabi hip hop'],
    audioFeatures: { danceability: 0.8, energy: 0.7 },
    description: 'You are Badshah, dropping desi beats that make the party bounce.',
  },
  {
    name: 'Clairo',
    genres: ['bedroom pop'],
    audioFeatures: { danceability: 0.6, energy: 0.4 },
    description: 'Youu are Clairo, chilling in a bedroom pop haze with lo-fi dreams.',
  },
  {
    name: 'Yo Yo Honey Singh',
    genres: ['desi pop', 'punjabi hip hop', 'hindi hip hop'],
    audioFeatures: { danceability: 0.8, energy: 0.9 },
    description: 'You are Yo Yo Honey Singh, the king of desi swagger and party anthems.',
  },
  {
    name: 'Nusrat Fateh Ali Khan',
    genres: ['sufi', 'desi'],
    audioFeatures: { danceability: 0.5, energy: 0.6 },
    description: 'You are Nusrat Fateh Ali Khan, channeling mystical vibes through timeless qawwalis.',
  },
  {
    name: 'Rani Mukherjee (as Tina from KKHH)',
    genres: ['bollywood', 'hindi pop'],
    audioFeatures: { danceability: 0.7, energy: 0.6 },
    description: 'You are Tina from Kuch Kuch Hota Hai, dancing through Bollywood romance.',
  },
  {
    name: 'Raftaar',
    genres: ['desi hip hop', 'hindi hip hop', 'rap'],
    audioFeatures: { danceability: 0.75, energy: 0.85 },
    description: 'You are Raftaar, spitting rapid-fire rhymes with desi flair.',
  },
  {
    name: 'AP Dhillon',
    genres: ['punjabi hip hop', 'desi pop'],
    audioFeatures: { danceability: 0.7, energy: 0.65 },
    description: 'You are AP Dhillon, blending Punjabi vibes with smooth modern beats.',
  },
  {
    name: 'Shakti (from Shakti Comics)',
    genres: ['desi', 'hindi pop'],
    audioFeatures: { danceability: 0.6, energy: 0.7 },
    description: 'You are Shakti, a desi superhero grooving to epic Hindi anthems.',
  },
];

const calculateSimilarity = (userFeatures: AudioFeatures, doppelgangerFeatures: AudioFeatures) => {
  const danceDiff = Math.abs(userFeatures.danceability - doppelgangerFeatures.danceability);
  const energyDiff = Math.abs(userFeatures.energy - doppelgangerFeatures.energy);
  return 1 - (danceDiff + energyDiff) / 2;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
  }

  try {
    // First, verify the token is valid by making a simple profile request
    try {
      await axios.get(`${SPOTIFY_API_BASE}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (profileError: any) {
      console.error('Token validation error:', profileError.response?.data);
      return NextResponse.json(
        { 
          error: 'Invalid or expired token', 
          details: profileError.response?.data?.error || profileError.message 
        }, 
        { status: 401 }
      );
    }

    // Now fetch top artists for genre information
    let topGenres = [];
    try {
      const artistsResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/artists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 10, time_range: 'medium_term' },
      });
      topGenres = [...new Set(artistsResponse.data.items.flatMap((artist: any) => artist.genres))];
      console.log('Top genres:', topGenres);
    } catch (artistsError: any) {
      console.error('Error fetching top artists:', artistsError.response?.data);
      // Continue with empty genres rather than failing
      topGenres = [];
    }

    // If we don't have any genre matches, let's use a fallback approach
    if (topGenres.length === 0) {
      // We'll select a random doppelganger as fallback
      const randomIndex = Math.floor(Math.random() * doppelgangers.length);
      const fallbackMatch = doppelgangers[randomIndex];
      
      return NextResponse.json({
        name: fallbackMatch.name,
        description: fallbackMatch.description,
        genres: [],
        audioFeatures: { danceability: 0.5, energy: 0.5 },
        note: "We couldn't analyze your music preferences, so we picked a random musical twin."
      });
    }

    // Try to get audio features for top tracks
    let userFeatures: AudioFeatures = { danceability: 0.5, energy: 0.5 }; // Default values
    
    try {
      const tracksResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/tracks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 10, time_range: 'medium_term' },
      });
      
      if (tracksResponse.data.items.length > 0) {
        const trackIds = tracksResponse.data.items.map((track: any) => track.id).join(',');
        
        const audioFeaturesResponse = await axios.get(`${SPOTIFY_API_BASE}/audio-features`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { ids: trackIds },
        });
        
        if (audioFeaturesResponse.data.audio_features && audioFeaturesResponse.data.audio_features.length > 0) {
          // Filter out null values that might come from the API
          const validFeatures = audioFeaturesResponse.data.audio_features.filter((item: any) => item !== null);
          
          if (validFeatures.length > 0) {
            const avgFeatures = validFeatures.reduce(
              (acc: AudioFeatures, curr: any) => ({
                danceability: acc.danceability + (curr.danceability || 0),
                energy: acc.energy + (curr.energy || 0),
              }),
              { danceability: 0, energy: 0 }
            );
            
            userFeatures = {
              danceability: avgFeatures.danceability / validFeatures.length,
              energy: avgFeatures.energy / validFeatures.length,
            };
          }
        }
      }
      
      console.log('User audio features:', userFeatures);
    } catch (tracksError: any) {
      console.error('Error fetching audio features:', tracksError.response?.data);
      // Continue with default audio features
    }

    // Find best match
    let bestMatch: Doppelganger | null = null;
    let highestSimilarity = -1;

    // First try to match by genre
    for (const doppelganger of doppelgangers) {
      const genreMatch = doppelganger.genres.some((genre) => 
        topGenres.some(userGenre => userGenre.includes(genre) || genre.includes(userGenre))
      );
      
      if (genreMatch) {
        const similarity = calculateSimilarity(userFeatures, doppelganger.audioFeatures);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = doppelganger;
        }
      }
    }

    // If no genre match, find best match based on audio features alone
    if (!bestMatch) {
      for (const doppelganger of doppelgangers) {
        const similarity = calculateSimilarity(userFeatures, doppelganger.audioFeatures);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = doppelganger;
        }
      }
    }

    // Fallback to first doppelganger if still no match
    if (!bestMatch) {
      bestMatch = doppelgangers[0];
    }

    return NextResponse.json({
      name: bestMatch.name,
      description: bestMatch.description,
      genres: topGenres.slice(0, 5),
      audioFeatures: userFeatures,
    });
    
  } catch (error: any) {
    console.error('Doppelgänger Finder Error:', {
      message: error.message,
      response: error.response?.data,
    });
    
    return NextResponse.json(
      {
        error: 'Failed to find your doppelgänger',
        details: error.response?.data?.error?.message || error.message,
      },
      { status: 500 }
    );
  }
}