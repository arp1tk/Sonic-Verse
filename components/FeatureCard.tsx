"use client";

import { HoverEffect } from "./ui/card-hover-effect";
import { Music, Clock, User2, BarChart2 } from "lucide-react";

export function FeatureCardsHoverEffect() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <HoverEffect items={features} />
    </div>
  );
}

export const features = [
  {
    title: "Doppelgänger Finder",
    description: "Discover your musical twin from celebs, characters, and legends who vibe like you.",
    link: "/doppelganger",
    icon: <User2 className="w-8 h-8 text-purple-400" />,
    borderColor: "border-purple-500/50",
    hoverBorderColor: "hover:border-purple-400/80"
  },
  {
    title: "Time Travel",
    description: "Generate playlists from past decades that match your unique music taste.",
    link: "/time-travel",
    icon: <Clock className="w-8 h-8 text-amber-400" />,
    borderColor: "border-amber-500/50",
    hoverBorderColor: "hover:border-amber-400/80"
  },
  {
    title: "Top Artists",
    description: "Explore your most-played artists and discover more from their catalogs.",
    link: "/top-artists",
    icon: <Music className="w-8 h-8 text-green-400" />,
    borderColor: "border-green-500/50",
    hoverBorderColor: "hover:border-green-400/80"
  },
  {
    title: "Music Analysis",
    description: "Deep dive into your music preferences with detailed analytics and insights.",
    link: "/listening-timeline",
    icon: <BarChart2 className="w-8 h-8 text-blue-400" />,
    borderColor: "border-blue-500/50",
    hoverBorderColor: "hover:border-blue-400/80"
  },
];