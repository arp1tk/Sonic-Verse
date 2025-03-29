import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

// Define your fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spectra | Your Music Analytics Dashboard",
    template: "%s | Spectra"
  },
  description: "Discover your music listening patterns with Spectra - Advanced Spotify analytics and insights",
  keywords: [
    "Spotify",
    "music analytics",
    "listening stats",
    "music insights",
    "Spotify wrapped alternative"
  ],

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceMono.variable} font-sans antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}