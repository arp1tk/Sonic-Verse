"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { Waves, UserSearch, Disc, BarChart2, Clock } from "lucide-react";
export default function Home() {
  const router = useRouter();

  const login = () => {
    window.location.href = "/api/login";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const expiresAt = urlParams.get("expires_at");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && expiresAt && refreshToken) {
      localStorage.setItem("spotify_access_token", accessToken);
      localStorage.setItem("spotify_expires_at", expiresAt);
      localStorage.setItem("spotify_refresh_token", refreshToken);
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo with Sound Wave */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative w-16 h-16 mr-2">
              <div className="relative w-full h-full flex items-center justify-center">
                  <Waves className="w-10 h-10 text-green-500" strokeWidth={2} />
                </div>

              </div>
              <h1 className="text-4xl font-bold tracking-tighter">
                Spectra
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

          {/* Feature Cards - Updated with Doppelgänger */}
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
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <path d="M20 8v6M23 11h-6"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-1">Doppelgänger</h3>
              <p className="text-xs text-gray-400">Find your music twin</p>
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
       <div className="flex flex-col items-center space-y-4">
  {/* Privacy Policy Note */}
  <p className="text-sm text-gray-400 text-center">
    By logging in, you agree to our{" "}
    <a
      href="/privacy"
      className="text-green-400 hover:underline transition-colors duration-200"
    >
      Privacy Policy
    </a>
    .
  </p>

  {/* Spotify Login Button */}
  <button
    onClick={login}
    className="w-full bg-green-200 hover:bg-green-300 text-black font-medium py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
  >
    <img
            src="/spotify.png" // <-- set your correct path here
            alt="Spotify"
            className="h-9 w-15"
          />
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

        </div>
      </main>

    
    </div>
  );
}