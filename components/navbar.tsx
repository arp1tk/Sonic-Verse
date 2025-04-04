"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Music, Clock, User2, LayoutDashboard, Menu, X, LogOut, Mic2, BarChart2,Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    display_name?: string;
    images?: { url: string }[];
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { name: "Top Artists", href: "/top-artists", icon: <Mic2 className="w-5 h-5 mr-2" /> },
    { name: "Time Travel", href: "/time-travel", icon: <Clock className="w-5 h-5 mr-2" /> },
    { name: "Doppelgänger", href: "/doppelganger", icon: <User2 className="w-5 h-5 mr-2" /> },
    { name: "Music Analysis", href: "/listening-timeline", icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  ];

  // Check token and fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    const expiresAt = localStorage.getItem("spotify_expires_at");

    if (token && expiresAt) {
      const currentTime = Date.now();
      const expiryTime = parseInt(expiresAt);

      if (currentTime > expiryTime) {
        // Token expired
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_expires_at");
        localStorage.removeItem("spotify_refresh_token");
        router.push("/");
      } else {
        setAccessToken(token);
        fetchUserProfile(token);
      }
    } else {
      setAccessToken(null);
    }
  }, [router, pathname]);

  const fetchUserProfile = async (token: string) => {
    try {
      setLoadingProfile(true);
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Handle expired/invalid token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_expires_at");
    localStorage.removeItem("spotify_refresh_token");
    setUserProfile(null);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
            <Waves className="w-10 h-10 text-green-500" strokeWidth={2} />
              <span className="ml-2 text-xl font-bold text-white">Spectra</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-green-500/20 text-green-500"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="hidden md:flex items-center">
            {accessToken ? (
              loadingProfile ? (
                <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
              ) : userProfile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar>
                        <AvatarImage src={userProfile.images?.[0]?.url || ""} alt={userProfile.display_name || "User"} />
                        <AvatarFallback className="bg-green-500/20 text-green-500">
                          {userProfile.display_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{userProfile.display_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">Spotify User</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/top-artists">Top Artists</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-green-500 border-green-500 hover:bg-green-500/20 hover:text-green-400"
              >
                <Link href="/api/login">Login with Spotify</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? "bg-green-500/20 text-green-500"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
          {accessToken ? (
            loadingProfile ? (
              <div className="pt-4 pb-3 border-t border-white/10 px-5">
                <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
              </div>
            ) : userProfile ? (
              <div className="pt-4 pb-3 border-t border-gray-700"> {/* Changed border color */}
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage 
                      src={userProfile.images?.[0]?.url || ""} 
                      alt={userProfile.display_name || "User"} 
                      className="border border-gray-600" // Added border
                    />
                    <AvatarFallback className="bg-green-500 text-white"> {/* Improved contrast */}
                      {userProfile.display_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white"> {/* Ensured white text */}
                    {userProfile.display_name}
                  </div>
                  <div className="text-xs text-gray-300"> {/* Added subtle subtitle */}
                    Spotify Account
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-900/10" /* Reduced hover bg opacity */
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Log out</span> {/* Added font weight */}
                </Button>
              </div>
            </div>
            ) : null
          ) : (
            <div className="px-2 pb-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full text-green-500 border-green-500 hover:bg-green-500/20 hover:text-green-400"
              >
                <Link href="/api/login">Login with Spotify</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}