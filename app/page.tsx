"use client"

import { useEffect } from "react"
import { ToastContainer } from "react-toastify"

<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark"
/>

export default function Home() {
  const login = () => {
    window.location.href = "/api/login"
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("access_token")
    if (token) {
      window.location.href = "/dashboard?access_token=" + token
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative w-16 h-16 mr-2">
                <div className="absolute inset-0 rounded-full bg-green-500 blur-md opacity-70 animate-pulse"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.2-.51.2-.71 0-1.79-1.78-4.64-2.16-7.44-1.18-.21.07-.43-.09-.5-.29-.07-.21.09-.43.29-.5 3.16-1.09 6.39-.66 8.43 1.35.2.19.2.51.01.71l-.08-.09zm1.23-2.75c-.25.25-.65.25-.9 0-2.17-2.17-5.46-2.8-8.02-1.53-.26.12-.58.01-.7-.24-.12-.26-.01-.58.24-.7 2.93-1.39 6.63-.67 9.13 1.82.25.25.25.65 0 .9l.25-.25zm.11-2.77c-.26.26-.68.26-.94 0-2.54-2.54-6.35-3.12-9.48-1.71-.3.13-.64-.01-.77-.3-.13-.3.01-.64.3-.77 3.49-1.58 7.76-.9 10.65 1.96.26.26.26.68 0 .94l.24-.12z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter">
                Sonic<span className="text-green-500">Verse</span>
              </h1>
            </div>
            <p className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 font-medium">
              Your music universe, reimagined.
            </p>
          </div>

          {/* Hero Text */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Discover Your <span className="text-green-500">Music Identity</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Explore your listening habits through immersive visualizations and personalized insights.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"></path>
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-1">Top Artists</h3>
              <p className="text-xs text-gray-400">Discover your most played artists</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 18v-6a9 9 0 0118 0v6"></path>
                  <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-1">Mood Visuals</h3>
              <p className="text-xs text-gray-400">See your music mood patterns</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 12h5"></path>
                  <path d="M9 12h5"></path>
                  <path d="M16 12h6"></path>
                  <path d="M4 7v10"></path>
                  <path d="M11 7v10"></path>
                  <path d="M18 7v10"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-1">Taste Analysis</h3>
              <p className="text-xs text-gray-400">Analyze your music preferences</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <h3 className="font-medium mb-1">Time Travel</h3>
              <p className="text-xs text-gray-400">Discover music from different eras</p>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-medium py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.2-.51.2-.71 0-1.79-1.78-4.64-2.16-7.44-1.18-.21.07-.43-.09-.5-.29-.07-.21.09-.43.29-.5 3.16-1.09 6.39-.66 8.43 1.35.2.19.2.51.01.71l-.08-.09zm1.23-2.75c-.25.25-.65.25-.9 0-2.17-2.17-5.46-2.8-8.02-1.53-.26.12-.58.01-.7-.24-.12-.26-.01-.58.24-.7 2.93-1.39 6.63-.67 9.13 1.82.25.25.25.65 0 .9l.25-.25zm.11-2.77c-.26.26-.68.26-.94 0-2.54-2.54-6.35-3.12-9.48-1.71-.3.13-.64-.01-.77-.3-.13-.3.01-.64.3-.77 3.49-1.58 7.76-.9 10.65 1.96.26.26.26.68 0 .94l.24-.12z" />
            </svg>
            Connect with Spotify
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 text-center text-gray-500 text-sm">
        <p>Not affiliated with Spotify. Made for music lovers.</p>
      </footer>
    </div>
  )
}

