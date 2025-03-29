"use client";
import { Suspense } from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import { Music, Moon, Sun, Coffee, Flame, Star, Zap, Headphones } from "lucide-react";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface TimelineData {
  hour: number;
  trackCount: number;
  avgEnergy: number;
  tracks: { trackName: string; artist: string; albumArt: string }[];
  topTrack: { name: string; artist: string; albumArt: string } | null;
}

export default function ListeningTimeline() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string>("");
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    if (token) setAccessToken(token);
  }, [searchParams]);

  const fetchTimeline = async () => {
    if (!accessToken) {
      setError("No access token available. Please log in.");
      return;
    }

    setLoading(true);
    setError("");
    setTimeline([]);

    try {
      const response = await axios.get("/api/listening-timeline", {
        params: { access_token: accessToken },
      });
      setTimeline(response.data.timeline);
    } catch (err: any) {
      console.error("Timeline fetch error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to fetch your listening history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced chart data with all new metrics
  const chartData = {
    labels: timeline.map((t) => `${t.hour}:00`),
    datasets: [
      {
        type: "bar" as const,
        label: "Tracks Played",
        data: timeline.map((t) => t.trackCount),
        backgroundColor: timeline.map((t) =>
          t.avgEnergy > 0.7
            ? "rgba(239, 68, 68, 0.8)" // Red for high energy
            : t.avgEnergy > 0.5
            ? "rgba(249, 115, 22, 0.8)" // Orange for medium energy
            : "rgba(147, 51, 234, 0.8)" // Purple for low energy
        ),
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 24,
      },
      {
        type: "line" as const,
        label: "Energy Level",
        data: timeline.map((t) => t.avgEnergy * 100),
        borderColor: "#facc15",
        backgroundColor: "rgba(250, 204, 21, 0.1)",
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: true,
      },
    ],
  };

  // Chart options with original styling but keeping new functionality
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#e5e7eb", font: { size: 14 } },
      },
      title: {
        display: true,
        text: "Your Daily Listening Journey",
        color: "#d8b4fe",
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        callbacks: {
          label: (context: any) => {
            const hourData = timeline[context.dataIndex];
            const isEnergy = context.dataset.label === "Energy Level";
            
            if (isEnergy) {
              return `Energy: ${(hourData.avgEnergy * 100).toFixed(0)}%`;
            }
            
            return [
              `Tracks: ${hourData.trackCount}`,
              `Avg Energy: ${(hourData.avgEnergy * 100).toFixed(0)}%`,
              hourData.topTrack ? `Top Track: ${hourData.topTrack.name}` : ""
            ];
          },
          afterBody: (context: any) => {
            const hourData = timeline[context[0].dataIndex];
            if (hourData.tracks.length > 0) {
              return [
                "",
                ...hourData.tracks.slice(0, 3).map(t => `${t.trackName} - ${t.artist}`),
                hourData.tracks.length > 3 ? `+${hourData.tracks.length - 3} more...` : ""
              ];
            }
            return [];
          }
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Tracks Played", color: "#d8b4fe" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#e5e7eb" },
      },
      x: {
        title: { display: true, text: "Time of Day", color: "#d8b4fe" },
        grid: { display: false },
        ticks: {
          color: "#e5e7eb",
          callback: function(value: number) {
            return value % 3 === 0 ? `${value}:00` : '';
          },
          autoSkip: false
        },
      },
    },
  };

  // Calculate all the enhanced metrics
  const peakHours = {
    morning: timeline.slice(6, 12).reduce((max, curr) => 
      curr.trackCount > max.trackCount ? curr : max, 
      { trackCount: 0 } as TimelineData
    ),
    afternoon: timeline.slice(12, 18).reduce((max, curr) => 
      curr.trackCount > max.trackCount ? curr : max, 
      { trackCount: 0 } as TimelineData
    ),
    evening: timeline.slice(18, 24).reduce((max, curr) => 
      curr.trackCount > max.trackCount ? curr : max, 
      { trackCount: 0 } as TimelineData
    ),
    night: timeline.slice(0, 6).reduce((max, curr) => 
      curr.trackCount > max.trackCount ? curr : max, 
      { trackCount: 0 } as TimelineData
    ),
  };

  const totalStats = {
    tracks: timeline.reduce((sum, hour) => sum + hour.trackCount, 0),
    avgEnergy: timeline.reduce((sum, hour) => sum + hour.avgEnergy, 0) / 24,
    peakHour: timeline.reduce((max, curr) => 
      curr.trackCount > max.trackCount ? curr : max, 
      { trackCount: 0 } as TimelineData
    ),
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>

      <Navbar accessToken={accessToken} />

      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4 text-purple-200">
              Your Listening Timeline
            </h1>
            <p className="text-gray-300 mb-8">
              Discover your daily music listening patterns and energy levels
            </p>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-purple-200 flex items-center">
                  <Music className="w-5 h-5 mr-2" />
                  Generate Your Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={fetchTimeline}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Generate Timeline"
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Card className="bg-red-900/20 border-red-500/30 mb-8">
                <CardContent className="pt-6">
                  <p className="text-red-300">{error}</p>
                </CardContent>
              </Card>
            )}

            {timeline.length > 0 && (
              <>
                {/* Main Chart */}
                <Card className="bg-gradient-to-br from-purple-900/30 to-black border-purple-500/20 mb-8">
                  <CardContent className="pt-6">
                    <div className="h-[500px]">
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Overview - New section but with original styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-purple-900/30 border-purple-500/20">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Music className="w-5 h-5 text-purple-300" />
                        <CardTitle className="text-lg text-purple-200">
                          Total Tracks
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        {totalStats.tracks}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/30 border-purple-500/20">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-lg text-purple-200">
                          Avg Energy
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        {(totalStats.avgEnergy * 100).toFixed(0)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/30 border-purple-500/20">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Flame className="w-5 h-5 text-red-400" />
                        <CardTitle className="text-lg text-purple-200">
                          Peak Hour
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        {totalStats.peakHour.hour}:00
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {totalStats.peakHour.trackCount} tracks
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-900/30 border-purple-500/20">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-blue-400" />
                        <CardTitle className="text-lg text-purple-200">
                          Peak Energy
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">
                        {(totalStats.peakHour.avgEnergy * 100).toFixed(0)}%
                      </p>
                      {totalStats.peakHour.topTrack && (
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          {totalStats.peakHour.topTrack.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Time of Day Breakdown - New section with original styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {Object.entries(peakHours).map(([period, data]) => {
                    if (data.trackCount === 0) return null;
                    
                    const periodName = period.charAt(0).toUpperCase() + period.slice(1);
                    const icon =
                      period === "morning" ? (
                        <Sun className="w-5 h-5 text-amber-400" />
                      ) : period === "afternoon" ? (
                        <Coffee className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Moon className="w-5 h-5 text-indigo-400" />
                      );

                    return (
                      <motion.div
                        key={period}
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="bg-purple-900/30 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              {icon}
                              <CardTitle className="text-lg text-purple-200">
                                {periodName} Session
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p className="text-gray-300">
                                <span className="font-bold text-white">
                                  {data.hour}:00
                                </span> - {data.trackCount} tracks played
                              </p>
                              <p className="text-sm text-gray-400">
                                Avg Energy:{" "}
                                <span className="font-medium">
                                  {(data.avgEnergy * 100).toFixed(0)}%
                                </span>
                              </p>
                              {data.topTrack && (
                                <div className="mt-3 flex items-center space-x-3">
                                  <img
                                    src={data.topTrack.albumArt}
                                    alt={data.topTrack.name}
                                    className="w-12 h-12 rounded-md"
                                  />
                                  <div>
                                    <p className="font-medium text-white">
                                      {data.topTrack.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {data.topTrack.artist}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Peak Hour Card - Original version */}
                {totalStats.peakHour.trackCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="bg-purple-900/50 border-purple-400/30">
                      <CardHeader>
                        <CardTitle className="text-purple-200 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-400" />
                          Peak Listening Moment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">
                          <span className="font-bold text-purple-200">
                            {totalStats.peakHour.hour}:00
                          </span> - {totalStats.peakHour.trackCount} tracks played with{" "}
                          {(totalStats.peakHour.avgEnergy * 100).toFixed(0)}% energy
                        </p>
                        {totalStats.peakHour.topTrack && (
                          <div className="mt-4 flex items-center">
                            <img
                              src={totalStats.peakHour.topTrack.albumArt}
                              alt="Album cover"
                              className="w-16 h-16 rounded-md mr-4"
                            />
                            <div>
                              <p className="text-purple-200 font-semibold">
                                {totalStats.peakHour.topTrack.name}
                              </p>
                              <p className="text-gray-400">
                                {totalStats.peakHour.topTrack.artist}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
export function ListeningTimelinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListeningTimeline/>
    </Suspense>
  );
}