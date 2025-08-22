"use client"

import { useEffect, useState } from "react"
import Link from "next/link";
import axios from "axios"
import { useSearchParams, useRouter } from "next/navigation"
import { Mic2, Music, TrendingUp, Award, Disc, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

interface UserProfile {
  display_name?: string
  images?: { url: string }[]
}

interface Artist {
  id: string
  name: string
  genres: string[]
  popularity: number
  images: { url: string }[]
}

interface TimeSpentData {
  artist: string
  time: number
}

export default function TopArtists() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [timeRange, setTimeRange] = useState<string>("medium_term")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("grid")
  const [timeSpentData, setTimeSpentData] = useState<TimeSpentData[]>([])
  
  const [timeSpentLoading, setTimeSpentLoading] = useState(false)
  const timeRanges = [
    { value: "short_term", label: "Last 4 Weeks" },
    { value: "medium_term", label: "Last 6 Months" },
    { value: "long_term", label: "All Time" },
  ]

  const COLORS = ['#1DB954', '#1ED760', '#2EBD59', '#57B660', '#7C25F8', '#A020F0', '#663399', '#9370DB', '#4B0082']

  useEffect(() => {
    const tokenFromUrl = searchParams.get("access_token")
    if (tokenFromUrl) {
      localStorage.setItem("spotify_access_token", tokenFromUrl)
      setAccessToken(tokenFromUrl)
      router.replace("/top-artists")
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

  useEffect(() => {
    if (accessToken) {
      fetchTopArtists()
    }
  }, [accessToken, timeRange])

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
  // const fetchTimeSpentData = async () => {
  //   if (!accessToken) return
    
  //   setTimeSpentLoading(true)
  //   try {
  //     const response = await axios.get(
  //       `/api/time-spent?access_token=${accessToken}&time_range=${timeRange}`
  //     )
      
  //     setTimeSpentData(response.data)
  //   } catch (error) {
  //     console.error("Error fetching time spent data:", error)
  //     setError("Failed to load time spent data")
  //   } finally {
  //     setTimeSpentLoading(false)
  //   }
  // }
  
  // // Update your useEffect
  // useEffect(() => {
  //   if (accessToken) {
  //     fetchUserProfile()
  //     fetchTopArtists()
  //     if (activeTab === 'time') {
  //       fetchTimeSpentData()
  //     }
  //   }
  // }, [accessToken, timeRange, activeTab])
  const fetchTopArtists = async () => {
    if (!accessToken) return
    setLoading(true)
    setError("")
    try {
      const response = await axios.get(`/api/top-artists?access_token=${accessToken}&time_range=${timeRange}`)
      setTopArtists(response.data.items || [])
    } catch (error) {
      console.error("Error fetching top artists:", error)
      setError("Failed to load your top artists. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

 

  // Prepare data for charts
  const popularityChartData = topArtists
    .slice(0, 10)
    .map(artist => ({
      name: artist.name,
      popularity: artist.popularity
    }))
    .sort((a, b) => b.popularity - a.popularity)

  // Aggregate genres for pie chart
  const genreCounts: Record<string, number> = {}
  topArtists.forEach(artist => {
    artist.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })

  const genreChartData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-2 rounded-md text-white text-sm">
          <p className="font-bold">{label}</p>
          <p>Popularity: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  const GenreTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-2 rounded-md text-white text-sm">
          <p className="font-bold">{payload[0].name}</p>
          <p>Count: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to see your top artists</p>
          <button
            onClick={() => router.push("/api/login")}
            className="bg-green-500 text-white font-medium py-2 px-4 rounded-md"
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=800&width=800')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]"></div>
      </div>

      <Navbar accessToken={accessToken} userProfile={userProfile} />

      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-purple-500">Your Top Artists</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Discover the artists that define your musical journey and shape your listening experience.</p>
          </div>

          {/* Time Range Selector */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">Time Range</CardTitle>
              <CardDescription>Select a time period to see your top artists</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4 gap-2 bg-black/30">
                  {timeRanges.map((range) => (
                    <TabsTrigger 
                      key={range.value} 
                      value={range.value}
                      className="data-[state=active]:bg-amber-500/80 data-[state=active]:text-white
                               data-[state=active]:border-amber-400 border border-transparent
                               hover:bg-white/10 transition-colors"
                    >
                      {range.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* View Selector */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10 mb-8">
            <CardContent className="pt-6">
              <Tabs defaultValue="grid" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 gap-2 bg-black/30">
                  <TabsTrigger 
                    value="grid"
                    className="data-[state=active]:bg-amber-500/80 data-[state=active]:text-white
                             data-[state=active]:border-amber-400 border border-transparent
                             hover:bg-white/10 transition-colors"
                  >
                    <Disc className="w-4 h-4 mr-2" />
                    Grid View
                  </TabsTrigger>
                  <TabsTrigger 
                    value="popularity"
                    className="data-[state=active]:bg-amber-500/80 data-[state=active]:text-white
                             data-[state=active]:border-amber-400 border border-transparent
                             hover:bg-white/10 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Popularity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="genres"
                    className="data-[state=active]:bg-amber-500/80 data-[state=active]:text-white
                             data-[state=active]:border-amber-400 border border-transparent
                             hover:bg-white/10 transition-colors"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Genres
                  </TabsTrigger>
                  {/* <TabsTrigger 
                    value="time"
                    className="data-[state=active]:bg-amber-500/80 data-[state=active]:text-white
                             data-[state=active]:border-amber-400 border border-transparent
                             hover:bg-white/10 transition-colors"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Time Spent
                  </TabsTrigger> */}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400">{error}</div>
          )}

          {/* Content based on selected tab */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-40 w-40 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Grid View */}
              
              {activeTab === "grid" && (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 gap-y-3 md:gap-y-4">
  {topArtists.map((artist, index) => (
    <CardContainer key={artist.id} className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-3 border hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 mb-0">
        <Link
          href={`https://open.spotify.com/artist/${artist.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <CardItem
            translateZ="20"
            className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/50"
          >
            {/* Top rank badge */}
            {index < 3 && (
              <CardItem
                translateZ="60"
                className="absolute top-2 right-2 z-10"
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full ${
                    index === 0
                      ? "bg-amber-500"
                      : index === 1
                      ? "bg-gray-300"
                      : "bg-amber-700"
                  }`}
                >
                  <Award className="h-4 w-4 text-black" />
                </div>
              </CardItem>
            )}

            {/* Artist image */}
            <CardItem
              translateZ="70"
              className="w-full h-full transform transition-all duration-500 group-hover/card:translate-z-20"
            >
              {artist.images?.[0]?.url ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-900/30">
                  <Mic2 className="h-12 w-12 text-green-400" />
                </div>
              )}
            </CardItem>

            {/* Hover overlay */}
            <CardItem
              translateZ="100"
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3"
            >
              <div className="w-full transform group-hover/card:translate-z-30">
                <div className="flex items-center mb-1">
                  <span className="text-xs text-white/70 mr-1">
                    Popularity:
                  </span>
                  <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${artist.popularity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardItem>
          </CardItem>

          {/* Artist info + Spotify logo */}
          <CardItem
            translateZ="30"
            className="mt-2 text-center transform group-hover/card:translate-z-10"
          >
            <div className="flex flex-col items-center">
              <div className="flex justify-between items-start w-full">
                <div> <h3 className="font-bold flex items-center text-md mb-0.5 line-clamp-1 dark:text-white group-hover/card:text-green-400 transition-colors">
                {artist.name}
              </h3>
              <p className="text-xs text-neutral-500 flex items-center dark:text-neutral-300 line-clamp-1">
                {artist.genres?.slice(0, 2).join(", ") || "No genres"}
              </p>
              </div>
             
              <img
                src="/spotify.png"
                alt="Spotify"
                className="h-5 mt-2"
              /></div>
            </div>
          </CardItem>
        </Link>
      </CardBody>
    </CardContainer>
  ))}
</div>

)}

              {/* Popularity Chart */}
              {activeTab === "popularity" && popularityChartData.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl">Artist Popularity Ranking</CardTitle>
                    <CardDescription>
                      Spotify popularity score (0-100) for your top artists
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={popularityChartData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={150}
                            tick={{ fill: 'white' }}
                          />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="popularity" 
                            fill="#1DB954"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                          >
                            {popularityChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Genres Chart */}
              {activeTab === "genres" && genreChartData.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Genre Breakdown</CardTitle>
                    <CardDescription>
                      Distribution of music genres among your top artists
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genreChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {genreChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<GenreTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time Spent View */}
              {/* {activeTab === "time" && (
  <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
    <CardHeader>
      <CardTitle className="text-2xl">
        Estimated Listening Time ({timeRanges.find(r => r.value === timeRange)?.label})
      </CardTitle>
      <CardDescription>
        Based on your top tracks from this period (weighted by popularity)
      </CardDescription>
    </CardHeader>
    <CardContent>
      {timeSpentLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full mr-4" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : timeSpentData.length > 0 ? (
        <div className="space-y-4">
          {timeSpentData.map((item, index) => (
            <div key={`${item.artist}-${index}`} className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-4">
                <img
                  src={item.image}
                  alt={item.artist}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/default-artist.png'
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.artist}</span>
                  <span className="text-green-400">
                    {item.time} {item.time === 1 ? 'min' : 'mins'}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (item.time / (timeSpentData[0]?.time || 1)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-400">No listening data available for this period</p>
          <Button 
            variant="ghost" 
            className="mt-4 text-green-500 hover:text-green-400"
            onClick={fetchTimeSpentData}
          >
            Retry
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)} */}

              {/* Empty State */}
              {!loading && topArtists.length === 0 && !error && (
                <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-center">
                  <CardContent className="pt-10 pb-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/30 flex items-center justify-center">
                      <Mic2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Artists Found</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      We couldn't find any top artists for this time period. Try selecting a different time range or listen
                      to more music!
                    </p>
                  </CardContent>
                </Card>
                
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}