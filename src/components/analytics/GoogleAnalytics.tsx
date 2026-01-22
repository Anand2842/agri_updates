'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + searchParams.toString();

        if (typeof window !== 'undefined' && (window as any).gtag) {
            // Send pageview on route change
            (window as any).gtag('config', GA_MEASUREMENT_ID, {
                page_path: url,
            });
        }
    }, [pathname, searchParams, GA_MEASUREMENT_ID]);

    return (
        <>
            <Script
                id="google-analytics-consent"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        
                        // Default consent to 'denied' for GDPR compliance
                        gtag('consent', 'default', {
                            'ad_storage': 'denied',
                            'analytics_storage': 'denied',
                            'ad_user_data': 'denied',
                            'ad_personalization': 'denied'
                        });

                        gtag('js', new Date());
                        
                        // Load GA4 but it will respect the denied state (cookieless pings only if allowed)
                        gtag('config', '${GA_MEASUREMENT_ID}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
            <Script
                id="google-analytics-script"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
        </>
    );
}
