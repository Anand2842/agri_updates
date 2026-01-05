import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://agriupdates.com'), // Replace with actual domain when live
  title: {
    template: '%s | Agri Updates',
    default: 'Agri Updates | Agricultural Jobs & Innovation Platform for India',
  },
  description: "India's trusted platform for agricultural jobs, internships, fellowships, research news, and AgriTech startup updates.",
  openGraph: {
    title: 'Agri Updates | AgriTech Careers & News',
    description: 'India\'s trusted platform for agricultural jobs, internships, fellowships, and AgriTech innovation.',
    url: 'https://agriupdates.com',
    siteName: 'Agri Updates',
    images: [
      {
        url: '/og-image.jpg', // Needs to be added to public folder later
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-stone-50 text-stone-900 font-sans flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
