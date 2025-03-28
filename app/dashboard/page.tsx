"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart, Clock, Music, User2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/navbar"
import MusicTrack from "@/components/music-track"

interface UserProfile {
  display_name?: string
  images?: { url: string }[]
  followers?: { total: number }
  country?: string
}

interface Track {
  id: string
  name: string
  artist: string
  album: string
  image?: string
  played_at?: string
}

interface Artist {
  id: string
  name: string
  genres: string[]
  image?: string
  popularity: number
}

interface MusicStats {
  topTracks: Track[]
  recentTracks: Track[]
  topArtists?: Artist[]
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [musicStats, setMusicStats] = useState<MusicStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = searchParams.get("access_token")
    if (token) {
      setAccessToken(token)
      localStorage.setItem("spotify_access_token", token)
      router.replace("/dashboard")
    } else {
      const storedToken = localStorage.getItem("spotify_access_token")
      if (storedToken) {
        setAccessToken(storedToken)
      } else {
        router.push("/")
      }
    }
    setLoading(false)
  }, [searchParams, router])

  useEffect(() => {
    if (accessToken) {
      fetchUserProfile()
      fetchMusicStats()
    }
  }, [accessToken])

  const fetchUserProfile = async () => {
    if (!accessToken) return
    try {
      const response = await axios.get("/api/user-profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setUserProfile(response.data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchMusicStats = async () => {
    if (!accessToken) return
    try {
      const response = await axios.get(`/api/user-music-stats?access_token=${accessToken}`)
      setMusicStats(response.data)
    } catch (error) {
      console.error("Error fetching music stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      <Navbar accessToken={accessToken} userProfile={userProfile} />

      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to <span className="text-primary">SonicVerse</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore your music universe through immersive visualizations and personalized insights.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/5 backdrop-blur-sm border-purple-900/50 hover:border-purple-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center  text-lg">
                  <User2 className="w-5 h-5 mr-2 text-purple-400" />
                  Doppelgänger Finder
                </CardTitle>
                <CardDescription>Discover who shares your music soul</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Find your musical twin from celebs, characters, legends who vibe like you.
                </p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                  <Link href="/doppelganger">Find Your Twin</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-amber-900/50 hover:border-amber-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2 text-amber-400" />
                  Time Travel
                </CardTitle>
                <CardDescription>Explore music from different eras</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Generate playlists from past decades that match your unique music taste.
                </p>
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-500 text-white">
                  <Link href="/time-travel">Travel Through Time</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-green-900/50 hover:border-green-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Top Artists
                </CardTitle>
                <CardDescription>Your favorite music creators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Explore your most-played artists and discover more from their catalogs.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white">
                  <Link href="/top-artists">View Artists</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-blue-900/50 hover:border-blue-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="w-5 h-5 mr-2 text-blue-400" />
                  Music Analysis
                </CardTitle>
                <CardDescription>Visualize your listening patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Deep dive into your music preferences with detailed analytics and insights.
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                  <Link href="/listening-timeline">Analyze My Music</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Music Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Top Tracks */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="w-5 h-5 mr-2 text-primary" />
                  Your Top Tracks
                </CardTitle>
                <CardDescription>The songs you've been loving lately</CardDescription>
              </CardHeader>
              <CardContent>
                {musicStats ? (
                  <div className="space-y-3">
                    {musicStats.topTracks.slice(0, 5).map((track) => (
                      <MusicTrack
                        key={track.id}
                        id={track.id}
                        name={track.name}
                        artist={track.artist}
                        album={track.album}
                        image={track.image}
                        variant="compact"
                      />
                    ))}
                    {musicStats.topTracks.length === 0 && (
                      <div className="text-center py-6 text-gray-400">
                        <p>No top tracks found. Try listening to more music!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-md mr-3" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Played */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Recently Played
                </CardTitle>
                <CardDescription>Your latest listening activity</CardDescription>
              </CardHeader>
              <CardContent>
                {musicStats ? (
                  <div className="space-y-3">
                    {musicStats.recentTracks.slice(0, 5).map((track) => (
                      <MusicTrack
                        key={`${track.id}-${track.played_at}`}
                        id={track.id}
                        name={track.name}
                        artist={track.artist}
                        played_at={track.played_at}
                        image={track.image}
                        variant="compact"
                      />
                    ))}
                    {musicStats.recentTracks.length === 0 && (
                      <div className="text-center py-6 text-gray-400">
                        <p>No recent activity. Start listening to see your history!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-md mr-3" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}