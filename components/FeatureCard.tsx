import type React from "react"
import Link from "next/link"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  gradient: string
  borderColor: string
}

export default function FeatureCard({ title, description, icon, href, gradient, borderColor }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={`block group relative overflow-hidden rounded-xl border ${borderColor} bg-black/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 opacity-20 ${gradient}`}></div>
      <div className="relative p-6">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
          Explore
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </Link>
  )
}

