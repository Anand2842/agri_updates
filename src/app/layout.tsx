import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.agriupdates.online'), // Replace with actual domain when live
  title: {
    template: '%s | Agri Updates',
    default: 'Agri Updates | Agricultural Jobs, Funding & Innovation Platform',
  },
  description: "India's premier intelligence and career desk for agriculture jobs, grants & funding, startup news, and agri-warnings.",
  openGraph: {
    title: 'Agri Updates | AgriTech Careers & News',
    description: 'India\'s trusted platform for agricultural jobs, grants & funding, startup, and agri-warnings.',
    url: 'https://www.agriupdates.online',
    siteName: 'Agri Updates',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
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
import { getPublicNavigationCategories, getPublicCategories } from "@/lib/public-categories";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navigationCategories, publicCategories] = await Promise.all([
    getPublicNavigationCategories(),
    getPublicCategories(),
  ]);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Agri Updates',
    'url': 'https://www.agriupdates.online',
    'logo': 'https://www.agriupdates.online/logo.png',
    'description': "India's trusted platform for agricultural jobs, internships, fellowships, and AgriTech innovation.",
    'sameAs': [
      'https://twitter.com/AgriUpdates',
      'https://linkedin.com/company/agriupdates'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'email': 'support@agriupdates.online'
    }
  };

  return (
    <html lang="en-IN" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} antialiased text-slate-900 bg-slate-50 font-sans flex min-h-screen flex-col`}
      >
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W9FZ85PB');`,
          }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W9FZ85PB"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Suspense fallback={<div className="h-20 bg-white" />}>
          <Navbar categories={navigationCategories} />
        </Suspense>
        <main className="flex-grow pb-10 md:pb-0">
          {children}
        </main>
        <Footer categories={publicCategories} />
        <Suspense fallback={null}>
          <GoogleAnalytics GA_MEASUREMENT_ID="G-LLDWYS27VF" />
        </Suspense>
        <CookieConsent />
      </body>
    </html>
  );
}
