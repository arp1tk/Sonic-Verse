"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSearchParams, useRouter } from "next/navigation"
import { Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast, Toaster } from "sonner"
import Navbar from "@/components/navbar"
import MusicTrack from "@/components/music-track"

interface Track {
  id: string
  name: string
  artist: string
  album: string
  image?: string
}

interface UserProfile {
  display_name?: string
  images?: { url: string }[]
}

const EraTabs = ({
  eras,
  selectedEra,
  onEraChange
}: {
  eras: { value: string; label: string }[]
  selectedEra: string
  onEraChange: (era: string) => void
}) => {
  return (
    <div className="mb-6">
      <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-2 gap-y-5.5">
        {eras.map((era) => (
          <button
            key={era.value}
            onClick={() => onEraChange(era.value)}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedEra === era.value
                ? 'bg-amber-600 text-white'
                : 'bg-black text-white border border-gray-700 hover:bg-gray-800'
            }`}
          >
            {era.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TimeTravel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedEra, setSelectedEra] = useState<string>("1980")
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [savingPlaylist, setSavingPlaylist] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const eras = [
    { value: "1960", label: "60s" },
    { value: "1970", label: "70s" },
    { value: "1980", label: "80s" },
    { value: "1990", label: "90s" },
    { value: "2000", label: "00s" },
    { value: "2010", label: "10s" },
  ]

  useEffect(() => {
    const tokenFromUrl = searchParams.get("access_token")
    if (tokenFromUrl) {
      localStorage.setItem("spotify_access_token", tokenFromUrl)
      setAccessToken(tokenFromUrl)
      router.replace("/time-travel")
    } else {
      const storedToken = localStorage.getItem("spotify_access_token")
      if (storedToken) {
        setAccessToken(storedToken)
      } else {
        router.push("/api/login")
      }
    }
  }, [searchParams, router])

  useEffect(() => {
    if (accessToken) {
      fetchUserProfile()
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

  const generatePlaylist = async () => {
    if (!accessToken) return
    setLoading(true)
    setError("")
    try {
      const response = await axios.get(`/api/time-travel-playlist?access_token=${accessToken}&era=${selectedEra}`)
      setPlaylist(response.data.tracks || [])
      if (response.data.tracks.length === 0) {
        setError(
          `No tracks found for the ${selectedEra}s with your taste. Try another decade!`,
        )
      }
    } catch (error) {
      console.error("Error generating playlist:", error)
      setError("Failed to generate playlist. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const savePlaylistToSpotify = async () => {
    if (!accessToken || playlist.length === 0) return
    setSavingPlaylist(true)
    try {
      const response = await axios.post("/api/save-playlist", {
        access_token: accessToken,
        tracks: playlist.map((track) => track.id),
        name: `My ${selectedEra}s Time Travel Playlist`,
        description: `Songs from the ${selectedEra}s that match my music taste, generated by SonicVerse.`,
      })

      toast.success("Playlist Saved Successfully!", {
        description: `Created time travel playlist with ${playlist.length} tracks`,
        duration: 5000,
        position: "top-right",
      })
    } catch (error) {
      console.error("Error saving playlist:", error)
      toast.error("Failed to Save Playlist", {
        description: "Please try again later.",
        duration: 3000,
        position: "top-right",
      })
    } finally {
      setSavingPlaylist(false)
    }
  }

  const playTrack = (id: string) => {
    window.open(`https://open.spotify.com/track/${id}`, "_blank")
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to use Time Travel</p>
          <Button onClick={() => router.push("/api/login")} className="bg-primary text-white font-medium">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-black to-amber-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      <Navbar accessToken={accessToken} userProfile={userProfile} />

      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Time Travel</h1>
            <p className="text-gray-400">Discover music from different eras based on your taste.</p>
          </div>

          {/* Era Selector */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
            <CardHeader>
              <CardTitle>Choose an Era</CardTitle>
              <CardDescription>
                Select a decade and we'll generate a playlist of songs from that era that match your music taste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EraTabs 
                eras={eras} 
                selectedEra={selectedEra} 
                onEraChange={setSelectedEra} 
              />

              <Button
                onClick={generatePlaylist}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Generate {selectedEra}s Playlist
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400">{error}</div>
          )}

          {/* Playlist */}
          {playlist.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your {selectedEra}s Playlist</CardTitle>
                  <CardDescription>Songs that match your music taste</CardDescription>
                </div>
                <Badge variant="outline" className="bg-amber-900/50 text-amber-400 border-amber-500/30">
                  {playlist.length} tracks
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  {playlist.map((track) => (
                    <MusicTrack
                      key={track.id}
                      id={track.id}
                      name={track.name}
                      artist={track.artist}
                      album={track.album}
                      image={track.image}
                      onPlay={() => playTrack(track.id)}
                    />
                  ))}
                </div>

                <Button
                  onClick={savePlaylistToSpotify}
                  disabled={savingPlaylist}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  {savingPlaylist ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving to Spotify...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Save to Spotify
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && playlist.length === 0 && !error && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center">
              <CardContent className="pt-10 pb-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to Time Travel?</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Select an era and generate a playlist to discover music from that decade that matches your taste.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Toaster/>
    </div>
  )
}