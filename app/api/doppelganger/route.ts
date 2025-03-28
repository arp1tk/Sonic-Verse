import axios from 'axios';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface AudioFeatures {
  danceability: number;
  energy: number;
}

interface SpotifyUserProfile {
  topGenres: string[];
  audioFeatures: AudioFeatures;
}

interface Doppelganger {
  name: string;
  description: string;
  genres: string[];
  audioFeatures: AudioFeatures;
  culturalReference: string;
  matchingGenres: string[];
}

class DoppelgangerGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateDoppelganger(userProfile: SpotifyUserProfile): Promise<Doppelganger> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
    Create a detailed musical doppelganger profile based on these Spotify listening habits:
    - Top Genres: ${userProfile.topGenres.join(', ')}
    - Danceability: ${userProfile.audioFeatures.danceability.toFixed(2)}
    - Energy: ${userProfile.audioFeatures.energy.toFixed(2)}

    Respond STRICTLY in this exact JSON format (include all fields):
    {
      "name": "A movie or web series character which matches the vibe with the genres(it can be bollywood or hollywood), the character should be cool",
      "description": "At least 3-4 sentences describing the character's musical personality",
      "genres": ["Genre fusion description ,keep it short of 5 to 6 words"],
      "audioFeatures": {
        "danceability": ${userProfile.audioFeatures.danceability.toFixed(2)},
        "energy": ${userProfile.audioFeatures.energy.toFixed(2)}
      },
      "culturalReference": "A witty pop culture or historical quote that captures the character's essence",
      "matchingGenres": ["At least 3 complementary music genres"]
    }

    Rules:
    1. All fields must be populated
    2. Description must be at least 100 words
    3. matchingGenres must have at least 3 items
    4. Never return empty or null values
    5. Format must be valid JSON
    `;

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log("Gemini Raw Response:", response);
        
        // Clean the response
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("Cleaned Response:", cleanedResponse);
        
        const parsed = this.parseResponse(cleanedResponse, userProfile);
        
        if (this.validateDoppelganger(parsed)) {
          console.log("Valid response generated:", parsed);
          return parsed;
        }
        
        attempts++;
        console.warn(`Attempt ${attempts}: Response validation failed, retrying...`);
      } catch (error) {
        console.error("Gemini API Error:", error);
        attempts++;
        if (attempts >= maxAttempts) {
          break;
        }
      }
    }
    
    console.warn("Falling back to default doppelganger after retries");
    return this.getFallbackDoppelganger(userProfile);
  }

  private validateDoppelganger(data: Doppelganger): boolean {
    const isValid = (
      data?.name?.length > 0 &&
      data?.description?.length >= 100 &&
      data?.genres?.length > 0 &&
      data?.culturalReference?.length > 0 &&
      data?.matchingGenres?.length >= 3 &&
      typeof data?.audioFeatures?.danceability === 'number' &&
      typeof data?.audioFeatures?.energy === 'number'
    );
    
    if (!isValid) {
      console.warn("Validation failed for:", data);
    }
    
    return isValid;
  }

  private parseResponse(response: string, userProfile: SpotifyUserProfile): Doppelganger {
    try {
      const jsonResponse = JSON.parse(response);
      
      return {
        name: jsonResponse.name || this.getRandomFallbackName(),
        description: jsonResponse.description || this.getRandomFallbackDescription(),
        genres: jsonResponse.genres || userProfile.topGenres,
        audioFeatures: jsonResponse.audioFeatures || userProfile.audioFeatures,
        culturalReference: jsonResponse.culturalReference || this.getRandomCulturalReference(),
        matchingGenres: jsonResponse.matchingGenres || this.getDefaultMatchingGenres()
      };
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      return this.extractDoppelgangerDetails(response, userProfile);
    }
  }

  private extractDoppelgangerDetails(response: string, userProfile: SpotifyUserProfile): Doppelganger {
    // Fallback extraction if JSON parsing fails
    const nameMatch = response.match(/"name"\s*:\s*"([^"]+)"/i) || response.match(/'name'\s*:\s*'([^']+)'/i);
    const descMatch = response.match(/"description"\s*:\s*"([^"]+)"/i) || response.match(/'description'\s*:\s*'([^']+)'/i);
    const refMatch = response.match(/"culturalReference"\s*:\s*"([^"]+)"/i) || response.match(/'culturalReference'\s*:\s*'([^']+)'/i);
    const genresMatch = response.match(/"genres"\s*:\s*\[([^\]]+)\]/i);
    const matchGenresMatch = response.match(/"matchingGenres"\s*:\s*\[([^\]]+)\]/i);

    return {
      name: nameMatch?.[1]?.trim() || this.getRandomFallbackName(),
      description: descMatch?.[1]?.trim() || this.getRandomFallbackDescription(),
      genres: genresMatch?.[1]?.split(',').map(g => g.trim().replace(/['"]/g, '')) || userProfile.topGenres,
      audioFeatures: userProfile.audioFeatures,
      culturalReference: refMatch?.[1]?.trim() || this.getRandomCulturalReference(),
      matchingGenres: matchGenresMatch?.[1]?.split(',').map(g => g.trim().replace(/['"]/g, '')) || this.getDefaultMatchingGenres()
    };
  }

  private getRandomFallbackName(): string {
    const names = ['Musical Maverick', 'Sonic Wanderer', 'Rhythm Rebel', 'Genre-Bending Hero'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomFallbackDescription(): string {
    const descriptions = [
      'A mysterious musical spirit that defies categorization with a unique blend of sounds and styles.',
      'An enigmatic artist dancing between genres, creating a sonic signature that is entirely their own.',
      'A musical chameleon with an unpredictable spirit, constantly evolving their sound.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getRandomCulturalReference(): string {
    const references = [
      '"Music is the divine way to tell beautiful, poetic things to the heart" - Pablo Casals',
      '"Where words fail, music speaks" - Hans Christian Andersen'
    ];
    return references[Math.floor(Math.random() * references.length)];
  }

  private getDefaultMatchingGenres(): string[] {
    return ['Alternative', 'Indie', 'Fusion'];
  }

  private getFallbackDoppelganger(userProfile: SpotifyUserProfile): Doppelganger {
    return {
      name: this.getRandomFallbackName(),
      description: this.getRandomFallbackDescription(),
      genres: userProfile.topGenres,
      audioFeatures: userProfile.audioFeatures,
      culturalReference: this.getRandomCulturalReference(),
      matchingGenres: this.getDefaultMatchingGenres()
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }

  const doppelgangerGenerator = new DoppelgangerGenerator(GEMINI_API_KEY);

  try {
    // Validate Spotify token
    await axios.get(`${SPOTIFY_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Fetch top artists
    const artistsResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10, time_range: 'medium_term' }
    });

    // Extract unique genres
    const topGenres = [...new Set(
      artistsResponse.data.items.flatMap((artist: any) => artist.genres)
    )].slice(0, 5);

    // Fetch top tracks for audio features
    const tracksResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10, time_range: 'medium_term' }
    });

    // Calculate average audio features
    const averageFeatures = tracksResponse.data.items.reduce((acc: AudioFeatures, track: any) => {
      return {
        danceability: acc.danceability + (track.popularity / 100 * 0.7),
        energy: acc.energy + (track.popularity / 100 * 0.6)
      };
    }, { danceability: 0, energy: 0 });

    const finalAudioFeatures = {
      danceability: averageFeatures.danceability / tracksResponse.data.items.length,
      energy: averageFeatures.energy / tracksResponse.data.items.length
    };

    // Create user profile
    const userProfile: SpotifyUserProfile = {
      topGenres: topGenres.length > 0 ? topGenres : ['Eclectic'],
      audioFeatures: finalAudioFeatures.danceability > 0 ? finalAudioFeatures : { 
        danceability: 0.5, 
        energy: 0.5 
      }
    };

    // Generate doppelganger with validation
    const doppelganger = await doppelgangerGenerator.generateDoppelganger(userProfile);

    // Final validation
    if (!doppelgangerGenerator.validateDoppelganger(doppelganger)) {
      console.warn("Final validation failed, using fallback");
      return NextResponse.json(doppelgangerGenerator.getFallbackDoppelganger(userProfile));
    }

    return NextResponse.json({
      name: doppelganger.name,
      description: doppelganger.description,
      genres: doppelganger.genres,
      audioFeatures: doppelganger.audioFeatures,
      culturalReference: doppelganger.culturalReference,
      matchingGenres: doppelganger.matchingGenres
    });
    
  } catch (error: any) {
    console.error('Doppelgänger Finder Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to find your doppelgänger',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';