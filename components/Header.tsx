"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface HeaderProps {
  accessToken: string
  userProfile?: {
    display_name?: string
    images?: { url: string }[]
  } | null
}

export default function Header({ accessToken, userProfile }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const logout = () => {
    localStorage.removeItem("spotify_access_token")
    window.location.href = "/"
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Top Artists", path: "/top-artists" },
    { name: "Mood Visuals", path: "/mood-visuals" },
    { name: "Taste Analysis", path: "/taste-analysis" },
    { name: "Time Travel", path: "/time-travel" },
  ]

  return (
    <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4 md:space-x-10">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <div className="absolute inset-0 rounded-full bg-green-500 blur-sm opacity-70"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.2-.51.2-.71 0-1.79-1.78-4.64-2.16-7.44-1.18-.21.07-.43-.09-.5-.29-.07-.21.09-.43.29-.5 3.16-1.09 6.39-.66 8.43 1.35.2.19.2.51.01.71l-.08-.09zm1.23-2.75c-.25.25-.65.25-.9 0-2.17-2.17-5.46-2.8-8.02-1.53-.26.12-.58.01-.7-.24-.12-.26-.01-.58.24-.7 2.93-1.39 6.63-.67 9.13 1.82.25.25.25.65 0 .9l.25-.25zm.11-2.77c-.26.26-.68.26-.94 0-2.54-2.54-6.35-3.12-9.48-1.71-.3.13-.64-.01-.77-.3-.13-.3.01-.64.3-.77 3.49-1.58 7.76-.9 10.65 1.96.26.26.26.68 0 .94l.24-.12z" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tighter">
                Sonic<span className="text-green-500">Verse</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path ? "text-green-500" : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center">
            {userProfile ? (
              <div className="flex items-center">
                <div className="mr-4 hidden md:block">
                  <p className="text-sm font-medium">{userProfile.display_name}</p>
                </div>
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                      {userProfile.images && userProfile.images[0] ? (
                        <img
                          src={userProfile.images[0].url || "/placeholder.svg"}
                          alt={userProfile.display_name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-full h-full p-1 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-white/10 md:hidden">
                        <p className="text-sm font-medium">{userProfile.display_name}</p>
                      </div>
                      {/* Mobile Navigation */}
                      <div className="md:hidden py-2 border-b border-white/10">
                        {navItems.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`block px-4 py-2 text-sm ${
                              pathname === item.path ? "text-green-500" : "text-gray-300 hover:bg-gray-800"
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

