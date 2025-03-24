"use client"

import Header from "@/components/Header"
import axios from "axios"
import { useEffect, useState } from "react"

interface UserProfile {
  display_name?: string
  images?: { url: string }[]
}

export default function MoodVisuals() {
  const [accessToken, setAccessToken] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token")
    if (storedToken) {
      setAccessToken(storedToken)
    } else {
      window.location.href = "/"
    }
  }, [])

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

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to view your mood visuals</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-green-500 text-black font-medium py-2 px-4 rounded-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-blue-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      <Header accessToken={accessToken} userProfile={userProfile} />

      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Mood Visuals</h1>
            <p className="text-gray-400">Visualize your music mood and emotional patterns.</p>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-900/30 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 18v-6a9 9 0 0118 0v6"></path>
                <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We're working on visualizing your music mood patterns. Check back soon for an immersive experience.
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Get Notified When Ready
            </button>
          </div>

          {/* Preview Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-medium mb-4">Mood Distribution</h3>
                <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Mood visualization preview</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-medium mb-4">Energy Levels</h3>
                <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Energy visualization preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

