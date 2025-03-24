"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"

interface UserProfile {
  display_name?: string
  images?: { url: string }[]
}

interface Doppelganger {
  name: string
  description: string
  genres: string[]
  audioFeatures: {
    danceability: number
    energy: number
  }
}

export default function DoppelgangerFinder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [doppelganger, setDoppelganger] = useState<Doppelganger | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Check URL for new token from callback
    const tokenFromUrl = searchParams.get("access_token")
    if (tokenFromUrl) {
      localStorage.setItem("spotify_access_token", tokenFromUrl)
      setAccessToken(tokenFromUrl)
      // Clear URL params by redirecting to clean path
      router.replace("/doppelganger")
    } else {
      // Fallback to stored token
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

  const findDoppelganger = async () => {
    if (!accessToken) return
    setLoading(true)
    setError("")
    setDoppelganger(null)

    try {
      const response = await axios.get(`/api/doppelganger?access_token=${accessToken}`)
      setDoppelganger(response.data)
    } catch (error: any) {
      console.error("Error finding doppelgänger:", error)
      if (error.response?.status === 403) {
        setError("Permission issue: Please re-login to grant access to your top artists and tracks.")
        localStorage.removeItem("spotify_access_token") // Clear invalid token
        setTimeout(() => router.push("/api/login"), 2000) // Redirect to login
      } else {
        setError("Failed to find your doppelgänger. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to use Doppelgänger Finder</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      <Navbar accessToken={accessToken} userProfile={userProfile} />

      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Doppelgänger Finder</h1>
            <p className="text-gray-400">Discover who shares your music soul across time and fiction.</p>
          </div>

          {/* Finder Section */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
            <CardHeader>
              <CardTitle>Find Your Musical Twin</CardTitle>
              <CardDescription>
                Click below to uncover a celebrity, character, or legend who vibes like you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={findDoppelganger}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium w-full md:w-auto"
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
                    Scanning the Multiverse...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Find My Doppelgänger
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 animate-pulse">
              {error}
            </div>
          )}

          {/* Doppelgänger Result */}
          {doppelganger && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Musical Doppelgänger</CardTitle>
                  <CardDescription>Based on your listening patterns</CardDescription>
                </div>
                <Badge variant="outline" className="bg-purple-900/50 text-purple-400 border-purple-500/30">
                  Match Found!
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="bg-black/30 rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-colors">
                  <h3 className="text-2xl font-semibold text-purple-300 mb-2">{doppelganger.name}</h3>
                  <p className="text-gray-300 italic mb-4">{doppelganger.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-purple-400">Your Top Genres:</span>{" "}
                      {doppelganger.genres.join(", ")}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-purple-400">Danceability:</span>{" "}
                      {(doppelganger.audioFeatures.danceability * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-purple-400">Energy:</span>{" "}
                      {(doppelganger.audioFeatures.energy * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !doppelganger && !error && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center">
              <CardContent className="pt-10 pb-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <Search className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Who's Your Musical Twin?</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Hit the button to find a celebrity, character, or legend who grooves like you.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

// Animation utility for fade-in effect
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

