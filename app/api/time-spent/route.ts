// app/api/time-spent/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accessToken = searchParams.get('access_token')
  const timeRange = searchParams.get('time_range') || 'medium_term'

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 })
  }

  try {
    // Get top tracks for the selected time range
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        time_range: timeRange,
        limit: 50
      }
    })

    // Calculate artist time based on track popularity and duration
    const artistTime: Record<string, { time: number, image: string }> = {}

    response.data.items.forEach((track: any) => {
      const durationMinutes = track.duration_ms / 60000
      // Weight by track's position in the list (higher position = more plays)
      const weight = 1 + (50 - track.popularity) / 50
      
      track.artists.forEach((artist: any) => {
        if (!artistTime[artist.name]) {
          artistTime[artist.name] = {
            time: 0,
            image: track.album.images?.[0]?.url || '/default-artist.png'
          }
        }
        artistTime[artist.name].time += durationMinutes * weight
      })
    })

    // Convert to array and sort
    const timeSpentData = Object.entries(artistTime)
      .map(([artist, data]) => ({
        artist,
        time: Math.round(data.time),
        image: data.image
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10)

    return NextResponse.json(timeSpentData)
  } catch (error: any) {
    console.error('Error fetching time spent data:', error)
    return NextResponse.json(
      { error: error.response?.data?.error?.message || 'Failed to fetch time spent data' },
      { status: error.response?.status || 500 }
    )
  }
}