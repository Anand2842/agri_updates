import type { Metadata } from "next";
import Script from "next/script";
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
        url: '/og-image.png',
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
  verification: {
    google: 'googlefc8ca8a578ae80e6',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agri Updates | AgriTech Careers & News',
    description: "India's trusted platform for agricultural jobs, internships, fellowships, and AgriTech innovation.",
    images: ['/og-image.png'], // Must be added to public folder
    creator: '@AgriUpdates', // Replace with actual handle
  },
};

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import CookieConsent from "@/components/ui/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Agri Updates',
    'url': 'https://agriupdates.com',
    'logo': 'https://agriupdates.com/logo.png',
    'description': "India's trusted platform for agricultural jobs, internships, fellowships, and AgriTech innovation.",
    'sameAs': [
      'https://twitter.com/AgriUpdates',
      'https://linkedin.com/company/agriupdates'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'email': 'support@agriupdates.com'
    }
  };

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-stone-50 text-stone-900 font-sans flex flex-col min-h-screen`}
      >
        <Suspense fallback={<div className="h-20 bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Suspense fallback={null}>
          <GoogleAnalytics GA_MEASUREMENT_ID="G-LLDWYS27VF" />
        </Suspense>
        <CookieConsent />
      </body>
    </html>
  );
}
