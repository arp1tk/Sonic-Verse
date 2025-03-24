// components/music-track.tsx
import { format } from "date-fns"
import Link from "next/link"

interface MusicTrackProps {
  id: string
  name: string
  artist: string
  album?: string
  image?: string
  played_at?: string
  variant?: "default" | "compact"
}

export default function MusicTrack({
  id,
  name,
  artist,
  album,
  image,
  played_at,
  variant = "default",
}: MusicTrackProps) {
  const formatPlayedAt = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, h:mm a")
    } catch (e) {
      return ""
    }
  }

  return (
    <div
      className={`bg-black/30 rounded-lg p-3 border border-white/5 hover:border-primary/30 transition-colors flex items-center ${
        variant === "compact" ? "" : "mb-3"
      }`}
    >
      <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={`${name} by ${artist}`} className="w-full h-full object-cover" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium truncate">{name}</h3>
        <p className="text-sm text-gray-400 truncate">
          {artist}
          {album && ` • ${album}`}
          {played_at && ` • ${formatPlayedAt(played_at)}`}
        </p>
      </div>
      <Link
        href={`https://open.spotify.com/track/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-3 text-gray-400 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
          <path d="M15 3h6v6"></path>
          <path d="M10 14L21 3"></path>
        </svg>
      </Link>
    </div>
  )
}