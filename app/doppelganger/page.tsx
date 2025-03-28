"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Sparkles, Music, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"

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
  culturalReference?: string
  matchingGenres?: string[]
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
    const token = localStorage.getItem("spotify_access_token")
    if (token) {
      setAccessToken(token)
    }
  }, [searchParams])

  const findDoppelganger = async () => {
    if (!accessToken) {
      setError("No access token available. Please log in again.")
      return
    }
    
    setLoading(true)
    setError("")
    setDoppelganger(null)

    try {
      const response = await axios.get(`/api/doppelganger`, {
        params: { access_token: accessToken },
      })
      console.log("Full API response:", response.data); 
      setDoppelganger(response.data)

    } catch (error: any) {
      console.error("Error finding doppelgänger:", error)
      if (error.response) {
        setError(error.response.data.error || "Failed to find your doppelgänger. Please try again.")
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const extractSourceFromName = (name: string) => {
    const singleQuoteMatch = name.match(/'([^']+)'/)
    if (singleQuoteMatch) return singleQuoteMatch[1]
    
    const doubleQuoteMatch = name.match(/"([^"]+)"/)
    if (doubleQuoteMatch) return doubleQuoteMatch[1]
    
    const parenthesisMatch = name.match(/\(([^)]+)\)/)
    if (parenthesisMatch) return parenthesisMatch[1]
    
    return 'Popular Culture'
  }

  const renderErrorCard = () => {
    if (!error) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-300 flex items-center">
              <RefreshCw className="w-6 h-6 mr-2 text-red-400" />
              Doppelgänger Discovery Failed
            </CardTitle>
            <CardDescription className="text-red-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={findDoppelganger}
              className="bg-red-600 hover:bg-red-500 text-white font-medium w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderDoppelgangerCard = () => {
    if (!doppelganger) return null;
  
    // Extract name and source more reliably
    const nameParts = doppelganger.name.split('(');
    const characterName = nameParts[0].trim();
    const source = nameParts[1] ? nameParts[1].replace(')', '').replace('from ', '').trim() : 'Popular Culture';
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Card className="bg-gradient-to-br from-purple-900/30 to-black border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-purple-200 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                Your Musical Doppelgänger
              </CardTitle>
              <CardDescription className="text-purple-300">
                A cosmic musical match revealed
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-purple-900/50 text-purple-300 border-purple-500/30">
              <Star className="w-4 h-4 mr-1 text-yellow-400" /> Matched
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="bg-black/40 rounded-lg p-6 border border-purple-500/20 space-y-6">
              {/* Character Section */}
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-purple-200 flex items-center justify-center">
                  <Music className="w-8 h-8 mr-3 text-purple-400" />
                  {characterName}
                </h3>
                <div className="text-gray-400 italic">
                  From {source}
                </div>
              </div>
  
              {/* Full Description with proper formatting */}
              <div className="space-y-2">
                <h4 className="text-purple-400 font-semibold">Character Description</h4>
                <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {doppelganger.description}
                  </p>
                </div>
              </div>
  
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-purple-400 font-semibold mb-2">Genre Fusion</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(doppelganger.genres) ? (
                        doppelganger.genres.map((genre, index) => (
                          <Badge 
                            key={index} 
                            className="bg-purple-900/50 text-purple-300 border-purple-500/30"
                          >
                            {genre}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-purple-900/50 text-purple-300 border-purple-500/30">
                          {doppelganger.genres}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-purple-400 font-semibold mb-2">Audio Features</h4>
                    <div className="flex gap-4">
                      <div className="bg-purple-900/30 p-3 rounded-lg flex-1">
                        <p className="text-gray-200 text-sm">Danceability</p>
                        <p className="text-2xl font-bold text-purple-300">
                          {(doppelganger.audioFeatures.danceability * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-purple-900/30 p-3 rounded-lg flex-1">
                        <p className="text-gray-200 text-sm">Energy</p>
                        <p className="text-2xl font-bold text-purple-300">
                          {(doppelganger.audioFeatures.energy * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Right Column */}
                <div className="space-y-4">
                  {/* Cultural Reference */}
                  {doppelganger.culturalReference && (
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">Cultural Reference</h4>
                      <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                        <p className="text-gray-300 italic">
                          {doppelganger.culturalReference.replace(/^"+|"+$/g, '')}
                        </p>
                      </div>
                    </div>
                  )}
  
                  {/* Matching Genres */}
                  {doppelganger.matchingGenres && doppelganger.matchingGenres.length > 0 && (
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">Suggested Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {doppelganger.matchingGenres.map((genre, index) => (
                          <Badge 
                            key={index} 
                            className="bg-purple-900/50 text-purple-300 border-purple-500/30"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      <Navbar accessToken={accessToken} userProfile={userProfile} />

      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-purple-200">Doppelgänger Finder</h1>
            <p className="text-gray-400">Uncover your musical twin across time and imagination</p>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-purple-200">Find Your Musical Twin</CardTitle>
              <CardDescription>
                Click below to reveal a legendary musical counterpart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={findDoppelganger}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium w-full md:w-auto"
              >
                {loading ? (
                  <span className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning the Musical Multiverse...
                  </span>
                ) : (
                  "Reveal My Doppelgänger"
                )}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {doppelganger && renderDoppelgangerCard()}
            {error && renderErrorCard()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}