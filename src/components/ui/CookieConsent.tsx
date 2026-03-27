'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, ChevronDown, Check, Cookie } from 'lucide-react';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    // Consent State (Default: all denied except necessary)
    // We only access localStorage on mount to avoid hydration mismatch
    const [consent, setConsent] = useState({
        necessary: true, // Always true
        analytics: false,
        marketing: false
    });

    useEffect(() => {
        // Check if user has already made a choice
        const storedConsent = localStorage.getItem('cookie_consent_preferences');
        if (!storedConsent) {
            setShowBanner(true);
        } else {
            // Restore previous settings (optional, mostly for the 'manage' UI if we add one in footer)
            setConsent(JSON.parse(storedConsent));

            // Re-apply consent update to ensure GA picks it up on page load
            // (Wait a tick to ensures gtag is ready from the other script)
            const preferences = JSON.parse(storedConsent);
            updateGtagConsent(preferences);
        }
    }, []);

    const updateGtagConsent = (preferences: typeof consent) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            const state = preferences.analytics ? 'granted' : 'denied';
            const marketingState = preferences.marketing ? 'granted' : 'denied';

            (window as any).gtag('consent', 'update', {
                'analytics_storage': state,
                'ad_storage': marketingState,
                'ad_user_data': marketingState,
                'ad_personalization': marketingState
            });
            console.log('Consent Updated:', { analytics: state, marketing: marketingState });
        }
    };

    const handleAcceptAll = () => {
        const fullConsent = { necessary: true, analytics: true, marketing: true };
        saveConsent(fullConsent);
    };

    const handleRejectAll = () => {
        const minConsent = { necessary: true, analytics: false, marketing: false };
        saveConsent(minConsent);
    };

    const handleSavePreferences = () => {
        saveConsent(consent);
    };

    const saveConsent = (preferences: typeof consent) => {
        setConsent(preferences);
        localStorage.setItem('cookie_consent_preferences', JSON.stringify(preferences));
        updateGtagConsent(preferences);
        setShowBanner(false);
        setShowPreferences(false);
    };

    if (!showBanner && !showPreferences) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end pointer-events-none">

            {/* Main Banner */}
            {showBanner && !showPreferences && (
                <div className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] md:w-[400px] bg-white border border-stone-200 rounded-xl shadow-xl p-5 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
                    <button 
                        onClick={handleRejectAll}
                        className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors"
                        aria-label="Dismiss and Reject All"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2 pr-6">
                            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                                <Cookie className="w-4 h-4 text-agri-green" />
                                Cookie Consent
                            </h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                We use cookies to enhance your experience. 
                                Read our <Link href="/privacy" className="underline hover:text-agri-green">Privacy Policy</Link>.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full pt-1">
                            <button
                                onClick={handleAcceptAll}
                                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-agri-green hover:bg-agri-dark rounded-lg transition-colors"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={() => setShowPreferences(true)}
                                className="flex-1 py-2 px-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
                            >
                                Customize
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preferences Modal (Overlay) */}
            {showPreferences && (
                <div className="fixed inset-0 z-[101] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-agri-green" />
                                Cookie Preferences
                            </h3>
                            <button onClick={() => setShowPreferences(false)} className="text-stone-400 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            <p className="text-sm text-stone-600">
                                You can choose which cookies you want to accept. Standard "strictly necessary" cookies cannot be turned off as they are required for the website to function properly.
                            </p>

                            {/* Section: Necessary */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 opacity-75">
                                <div className="flex-1">
                                    <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-2">
                                        Strictly Necessary
                                        <span className="text-[10px] uppercase bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold">Required</span>
                                    </h4>
                                    <p className="text-xs text-stone-500">
                                        Essential for the website to function (e.g., security, navigation, logging in).
                                    </p>
                                </div>
                                <div className="mt-1">
                                    <div className="w-12 h-6 bg-agri-green rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Analytics */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 hover:border-agri-green/30 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-bold text-stone-900 mb-1">Analytics & Performance</h4>
                                    <p className="text-xs text-stone-500">
                                        Helps us understand how you use the site so we can improve it. Data is anonymized.
                                    </p>
                                </div>
                                <div className="mt-1">
                                    <button
                                        onClick={() => setConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
                                        className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${consent.analytics ? 'bg-agri-green justify-end' : 'bg-stone-300 justify-start'}`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </button>
                                </div>
                            </div>

                            {/* Section: Marketing */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 hover:border-agri-green/30 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-bold text-stone-900 mb-1">Marketing & Ads</h4>
                                    <p className="text-xs text-stone-500">
                                        Used to deliver relevant advertisements and measure ad performance.
                                    </p>
                                </div>
                                <div className="mt-1">
                                    <button
                                        onClick={() => setConsent(prev => ({ ...prev, marketing: !prev.marketing }))}
                                        className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${consent.marketing ? 'bg-agri-green justify-end' : 'bg-stone-300 justify-start'}`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                            <button
                                onClick={handleRejectAll}
                                className="px-6 py-2 text-sm font-bold text-stone-600 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg"
                            >
                                Reject All
                            </button>
                            <button
                                onClick={handleSavePreferences}
                                className="px-8 py-2 text-sm font-bold text-white bg-agri-green hover:bg-agri-dark rounded-lg shadow-sm"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
