import axios from 'axios';

interface Artist {
  id: string;
  name: string;
  genres: string[];
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; release_date: string };
  image: string;
}

interface TopArtistsResponse {
  items: Artist[];
}

interface RecommendationsResponse {
  tracks: Track[];
}

interface SearchResponse {
  tracks: {
    items: Track[];
  };
}

const VALID_SEED_GENRES = [
  'rap', 'hip-hop', 'pop', 'rock', 'soul', 'jazz', 'disco',
  'punk', 'metal', 'classical', 'country', 'indie', 'electronic', 'dance',
];

// Map of decades to genres that were popular during that time
const ERA_GENRES = {
  '1960': ['rock', 'pop', 'soul', 'folk', 'jazz'],
  '1970': ['rock', 'disco', 'pop', 'funk', 'soul', 'jazz'],
  '1980': ['pop', 'rock', 'disco', 'new-wave', 'metal', 'hip-hop'],
  '1990': ['rock', 'pop', 'grunge', 'hip-hop', 'r-n-b', 'electronic'],
  '2000': ['pop', 'hip-hop', 'r-n-b', 'rock', 'electronic', 'indie'],
  '2010': ['pop', 'hip-hop', 'edm', 'r-n-b', 'indie', 'trap']
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');
  const era = searchParams.get('era');

  if (!accessToken || !era) {
    return new Response('Missing access_token or era', { status: 400 });
  }

  try {
    console.log('Fetching top artists with token:', accessToken.slice(0, 10) + '...');
    
    // Step 1: Get user's top artists
    const topArtistsResponse = await axios.get<TopArtistsResponse>(
      'https://api.spotify.com/v1/me/top/artists',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 10, time_range: 'medium_term' },
      }
    );

    // Extract genres from user's top artists
    const allGenres = [...new Set(topArtistsResponse.data.items.flatMap((artist) => artist.genres))];
    console.log('All extracted genres:', allGenres);
    
    // Filter to valid seed genres
    const validUserGenres = allGenres
      .filter(genre => VALID_SEED_GENRES.some(validGenre => genre.includes(validGenre)))
      .slice(0, 3);
    console.log('Valid user genres:', validUserGenres);
    
    // Combine user genres with era-appropriate genres
    const eraGenres = ERA_GENRES[era as keyof typeof ERA_GENRES] || ['pop', 'rock'];
    const searchGenres = [...validUserGenres, ...eraGenres];
    console.log('Search genres:', searchGenres);
    
    // Combine top artists' names for search
    const topArtistNames = topArtistsResponse.data.items.map(artist => artist.name).slice(0, 3);
    
    // Build time range for the selected era
    const eraStart = parseInt(era);
    const eraEnd = eraStart + 9;
    
    // Step 2: Attempt multiple search strategies to find era-appropriate music
    
    let tracks: Track[] = [];
    
    // Strategy 1: Search for tracks within the era with genre keywords
    for (const genre of searchGenres) {
      if (tracks.length >= 30) break;
      
      try {
        console.log(`Searching tracks for genre "${genre}" from ${eraStart}-${eraEnd}`);
        const searchQuery = `genre:${genre} year:${eraStart}-${eraEnd}`;
        
        const searchResponse = await axios.get<SearchResponse>(
          'https://api.spotify.com/v1/search',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              q: searchQuery,
              type: 'track',
              limit: 20,
              market: 'from_token'
            },
          }
        );
        
        if (searchResponse.data.tracks.items.length > 0) {
          tracks = [...tracks, ...searchResponse.data.tracks.items];
        }
      } catch (error) {
        console.log(`Search failed for genre "${genre}":`, error);
      }
    }
    
    // Strategy 2: If still not enough tracks, search by year directly
    if (tracks.length < 20) {
      try {
        console.log(`Searching tracks by year range ${eraStart}-${eraEnd}`);
        const searchResponse = await axios.get<SearchResponse>(
          'https://api.spotify.com/v1/search',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              q: `year:${eraStart}-${eraEnd}`,
              type: 'track',
              limit: 50,
              market: 'from_token'
            },
          }
        );
        
        if (searchResponse.data.tracks.items.length > 0) {
          tracks = [...tracks, ...searchResponse.data.tracks.items];
        }
      } catch (error) {
        console.log('Year search failed:', error);
      }
    }
    
    // Strategy 3: As a last resort, search for popular songs from the era
    if (tracks.length < 10) {
      try {
        console.log(`Searching for popular tracks from ${era}s`);
        const searchResponse = await axios.get<SearchResponse>(
          'https://api.spotify.com/v1/search',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              q: `${era}s popular music`,
              type: 'track',
              limit: 50,
              market: 'from_token'
            },
          }
        );
        
        if (searchResponse.data.tracks.items.length > 0) {
          tracks = [...tracks, ...searchResponse.data.tracks.items];
        }
      } catch (error) {
        console.log('Popular music search failed:', error);
      }
    }
    
    // Filter duplicate tracks
    const uniqueTracks = Array.from(
      new Map(tracks.map(track => [track.id, track])).values()
    );
    
    // Filter tracks by release year and take up to 20
    const filteredTracks = uniqueTracks
      .filter(track => {
        // Some tracks might not have proper release_date format
        try {
          const releaseYear = parseInt(track.album.release_date.slice(0, 4));
          return releaseYear >= eraStart - 5 && releaseYear <= eraEnd + 5;
        } catch (e) {
          return false;
        }
      })
      .slice(0, 20);
    
    console.log(`Filtered ${filteredTracks.length} tracks for ${era}s`);
    
    // Map to the expected format
    const playlist = filteredTracks.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url || null
    }));

    return new Response(JSON.stringify({ tracks: playlist }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Time travel playlist error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // Return empty playlist instead of 500 error
    return new Response(
      JSON.stringify({ tracks: [] }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}