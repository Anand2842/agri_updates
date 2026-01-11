import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Featured Listings | Agri Updates',
    description: 'Boost visibility for your opportunities with Featured Listings on Agri Updates. Ideal for incubation programs, universities, NGOs, and startups.',
};

export default function FeaturedListingsPage() {
    return (
        <div className="bg-stone-50 min-h-screen pb-20">
            {/* Header */}
            <section className="bg-white border-b border-stone-200 pt-16 pb-12 md:pt-24 md:pb-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="text-agri-green text-sm font-bold tracking-widest uppercase mb-4 block">For Organizations</span>
                    <h1 className="font-serif text-4xl md:text-5xl font-black text-stone-900 mb-6 leading-tight">
                        Featured Listings on Agri Updates
                    </h1>
                    <p className="font-serif text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Gain increased visibility among agri-startups, students, institutions, and ecosystem stakeholders.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">

                {/* Value Props */}
                <section className="bg-white p-8 md:p-12 border border-stone-200 shadow-sm mb-12">
                    <h2 className="font-serif text-2xl font-bold mb-8 flex items-center gap-3">
                        What You Get
                    </h2>

                    <div className="space-y-10">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-agri-green/10 flex items-center justify-center shrink-0 text-agri-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Increased Visibility</h3>
                                <ul className="list-disc list-inside text-stone-600 space-y-1 ml-1 marker:text-stone-300">
                                    <li>Highlighted on the Agri Updates homepage</li>
                                    <li>Appear in a dedicated <strong>Featured</strong> section</li>
                                    <li>Priority placement within category (Job / Opportunity / Scheme)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-agri-green/10 flex items-center justify-center shrink-0 text-agri-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Clear "Featured" Label</h3>
                                <ul className="list-disc list-inside text-stone-600 space-y-1 ml-1 marker:text-stone-300">
                                    <li>Visible <strong>FEATURED</strong> badge on every post</li>
                                    <li>Ensures transparency for readers</li>
                                    <li>Maintains trust and credibility</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-agri-green/10 flex items-center justify-center shrink-0 text-agri-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Better Discovery</h3>
                                <p className="text-stone-600 mb-2">Higher chances of being noticed by:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-stone-600 ml-1 marker:text-stone-300">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div> Agri-startups</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div> Students & Researchers</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div> Universities</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div> Ecosystem Professionals</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-agri-green/10 flex items-center justify-center shrink-0 text-agri-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">SEO-Friendly Presentation</h3>
                                <ul className="list-disc list-inside text-stone-600 space-y-1 ml-1 marker:text-stone-300">
                                    <li>Proper headings and structure</li>
                                    <li>Clean formatting for readability & indexing</li>
                                    <li>No keyword stuffing or misleading claims</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Pricing & CTA */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-stone-900 text-white p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Duration & Pricing</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-agri-green">₹199</span>
                                <span className="text-stone-400">/ listing</span>
                            </div>
                            <ul className="text-stone-300 space-y-2 mb-6 text-sm">
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-agri-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    7 Days Duration
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-agri-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    No long-term commitments
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-agri-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    No hidden charges
                                </li>
                            </ul>
                        </div>
                        <Link href="mailto:hello@agriupdates.com?subject=Featured Listing Inquiry" className="block w-full py-3 bg-agri-green text-white text-center font-bold hover:bg-white hover:text-agri-green transition-colors">
                            Get Started &rarr;
                        </Link>
                    </div>

                    <div className="bg-white border border-stone-200 p-8 flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-4">Who Should Use This?</h3>
                        <ul className="space-y-3 text-stone-600">
                            <li className="flex gap-3">
                                <span className="text-agri-green font-bold">01</span>
                                <span>Incubation programs & accelerators</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-agri-green font-bold">02</span>
                                <span>Universities & Academic Institutions</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-agri-green font-bold">03</span>
                                <span>NGOs and CSR organisations</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-agri-green font-bold">04</span>
                                <span>Startup programs & fellowships</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-agri-green font-bold">05</span>
                                <span>Verified hiring announcements</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Editorial Standards */}
                <section className="bg-stone-100 p-8 border-l-4 border-stone-400 mb-12">
                    <h3 className="font-bold text-lg mb-3">Editorial Standards (Transparency)</h3>
                    <p className="text-stone-600 mb-4 leading-relaxed">
                        Featured listings provide <strong>increased visibility only</strong>. They do not imply endorsement, recommendation, or guaranteed outcomes by Agri Updates.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-stone-500">
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            No bypassing verification rules
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            No guaranteed selection
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            No altered eligibility criteria
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Reviewed like regular posts
                        </li>
                    </ul>
                </section>

                <div className="text-center text-sm text-stone-400">
                    <p>Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation before submission.</p>
                </div>

            </div>
        </div>
    );
}
