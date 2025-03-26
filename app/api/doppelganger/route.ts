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
  culturalReference?: string;
  matchingGenres?: string[];
}

class DoppelgangerGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateDoppelganger(userProfile: SpotifyUserProfile): Promise<Doppelganger> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
    Create a unique musical doppelganger profile based on these details:
    - Genres: ${userProfile.topGenres.join(', ')}
    - Danceability: ${userProfile.audioFeatures.danceability.toFixed(2)}
    - Energy: ${userProfile.audioFeatures.energy.toFixed(2)}
    
    Respond STRICTLY in this JSON format:
    {
      "name": " A movie or web series character which matches the vibe with the genres(it can be bollywood or hollywood), the character should be cool",
      "description": "A vivid, personality-rich description linking the character to the musical profile",
      "genres": ["A pop culture or historical reference that captures their essence"],
      "audioFeatures": {
        "danceability": 0.75,
        "energy": 0.68
      },
      "culturalReference": "A witty pop culture or historical quote that captures the character's essence",
      "matchingGenres": ["complementary music genres"]
    }
    
    Make it creative, personalized, and musically insightful!
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      console.log(response)
      return this.parseResponse(response, userProfile);
    } catch (error) {
      console.error("Gemini API Error:", error);
      return this.getFallbackDoppelganger(userProfile);
    }
  }

  private parseResponse(response: string, userProfile: SpotifyUserProfile): Doppelganger {
    try {
      // First, attempt to parse as JSON
      const jsonResponse = JSON.parse(response);
      
      return {
        name: jsonResponse.name || 'Enigmatic Musician',
        description: jsonResponse.description || 'A mysterious musical spirit',
        genres: jsonResponse.genres || userProfile.topGenres,
        audioFeatures: jsonResponse.audioFeatures || userProfile.audioFeatures,
        culturalReference: jsonResponse.culturalReference || '',
        matchingGenres: jsonResponse.matchingGenres || []
      };
    } catch (jsonError) {
      // Fallback to text parsing if JSON fails
      return this.extractDoppelgangerDetails(response, userProfile);
    }
  }

  private extractDoppelgangerDetails(response: string, userProfile: SpotifyUserProfile): Doppelganger {
    // More robust parsing with regex and fallback mechanisms
    const nameMatch = response.match(/["']?name["']?\s*[:]\s*["']([^"']+)["']/i);
    const descriptionMatch = response.match(/["']?description["']?\s*[:]\s*["']([^"']+)["']/i);
    const referenceMatch = response.match(/["']?culturalReference["']?\s*[:]\s*["']([^"']+)["']/i);

    return {
      name: nameMatch ? nameMatch[1].trim() : this.getRandomFallbackName(),
      description: descriptionMatch ? descriptionMatch[1].trim() : this.getRandomFallbackDescription(),
      genres: userProfile.topGenres,
      audioFeatures: userProfile.audioFeatures,
      culturalReference: referenceMatch ? referenceMatch[1].trim() : '',
      matchingGenres: []
    };
  }

  private getRandomFallbackName(): string {
    const fallbackNames = [
      'Musical Maverick', 
      'Sonic Wanderer', 
      'Rhythm Rebel', 
      'Genre-Bending Hero', 
      'Melodic Adventurer'
    ];
    return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
  }

  private getRandomFallbackDescription(): string {
    const fallbackDescriptions = [
      'A mysterious musical spirit that defies categorization',
      'An enigmatic artist dancing between genres',
      'A musical chameleon with an unpredictable spirit',
      'A sonic explorer traversing musical landscapes',
      'A rhythm virtuoso breaking all musical boundaries'
    ];
    return fallbackDescriptions[Math.floor(Math.random() * fallbackDescriptions.length)];
  }

  private getFallbackDoppelganger(userProfile: SpotifyUserProfile): Doppelganger {
    return {
      name: this.getRandomFallbackName(),
      description: this.getRandomFallbackDescription(),
      genres: userProfile.topGenres,
      audioFeatures: userProfile.audioFeatures,
      culturalReference: '',
      matchingGenres: []
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
    const profileResponse = await axios.get(`${SPOTIFY_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Fetch top artists to get genres
    const artistsResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10, time_range: 'medium_term' }
    });

    // Extract unique genres
    const topGenres = [...new Set(
      artistsResponse.data.items.flatMap((artist: any) => artist.genres)
    )].slice(0, 5); // Limit to top 5 genres

    // Fetch top tracks 
    const tracksResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10, time_range: 'medium_term' }
    });

    // Directly calculate audio features from track attributes
    const averageFeatures = tracksResponse.data.items.reduce((acc: AudioFeatures, track: any) => {
      return {
        danceability: acc.danceability + (track.popularity / 100 * 0.7), // Use popularity as a proxy for danceability
        energy: acc.energy + (track.popularity / 100 * 0.6)  // Use popularity as a proxy for energy
      };
    }, { danceability: 0, energy: 0 });

    const finalAudioFeatures = {
      danceability: averageFeatures.danceability / tracksResponse.data.items.length,
      energy: averageFeatures.energy / tracksResponse.data.items.length
    };

    // Fallback if no tracks found
    const userProfile: SpotifyUserProfile = {
      topGenres: topGenres.length > 0 ? topGenres : ['Eclectic'],
      audioFeatures: finalAudioFeatures.danceability > 0 ? finalAudioFeatures : { 
        danceability: 0.5, 
        energy: 0.5 
      }
    };

    // Generate doppelganger
    const doppelganger = await doppelgangerGenerator.generateDoppelganger(userProfile);

    return NextResponse.json({
      name: doppelganger.name,
      description: doppelganger.description,
      genres: doppelganger.genres || userProfile.topGenres,
      audioFeatures: doppelganger.audioFeatures || userProfile.audioFeatures,
      culturalReference: doppelganger.culturalReference,
      matchingGenres: doppelganger.matchingGenres || []
    });
    
  } catch (error: any) {
    console.error('Doppelgänger Finder Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to find your doppelgänger',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';