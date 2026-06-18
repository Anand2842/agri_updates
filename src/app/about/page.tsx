import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us | Agri Updates',
    description: 'Agri Updates is a curated digital platform sharing verified agricultural jobs, opportunities, programs, and ecosystem updates across India.',
    alternates: {
        canonical: '/about',
    },
};

export default function AboutPage() {
    return (
        <div className="bg-stone-50 min-h-screen pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-stone-200 py-20">
                <div className="editorial-shell text-center">
                    <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-stone-900">About Agri Updates</h1>
                    <p className="text-stone-600 max-w-3xl mx-auto text-lg leading-relaxed font-medium">
                        Building Access to Agricultural Opportunities
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-8"></div>
                </div>
            </div>

            <div className="editorial-shell py-16">
                {/* Introduction */}
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <p className="text-xl md:text-2xl text-stone-800 leading-relaxed font-serif">
                        Agri Updates is a curated digital platform focused on sharing verified agricultural jobs, opportunities, programs, and ecosystem updates across India.
                    </p>
                    <p className="mt-6 text-stone-600 leading-relaxed text-lg">
                        We aim to make information accessible, structured, and reliable for students, professionals, startups, and institutions working in agriculture and allied sectors.
                    </p>
                </div>

                {/* Our Purpose */}
                <section className="mb-20 max-w-3xl mx-auto">
                    <div className="paper-panel p-8 md:p-12 shadow-sm">
                        <h2 className="font-serif text-3xl font-bold mb-6 text-stone-900">Our Purpose</h2>
                        <p className="text-stone-600 mb-6 text-lg">
                            Agriculture is evolving rapidly — but access to timely, trustworthy information remains fragmented.
                        </p>
                        <p className="text-stone-600 mb-6 font-medium">
                            Agri Updates exists to:
                        </p>
                        <ul className="space-y-4 text-stone-700">
                            {[
                                "Centralize agricultural opportunities",
                                "Reduce information gaps for students and professionals",
                                "Improve visibility for credible programs and initiatives",
                                "Support the agri-innovation ecosystem through structured updates"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <span className="w-2 h-2 bg-agri-green rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 max-w-4xl mx-auto">
                    {/* What We Do */}
                    <section className="paper-panel p-6 shadow-sm">
                        <h2 className="font-serif text-2xl font-bold mb-6 text-stone-900 border-l-4 border-agri-green pl-4">What We Do</h2>
                        <p className="text-stone-600 mb-4">We curate and publish:</p>
                        <ul className="space-y-3 text-stone-700 bg-stone-50/50 p-6 rounded-xl border border-stone-200">
                            {[
                                "Agricultural job openings",
                                "Internship and research opportunities",
                                "Startup and innovation updates",
                                "Government schemes and programs",
                                "Events, fellowships, and calls for applications"
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full flex-shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-sm text-stone-500 italic px-2">
                            All content follows clear editorial and verification guidelines.
                        </p>
                    </section>

                    {/* How Agri Updates Works */}
                    <section className="paper-panel p-6 shadow-sm">
                        <h2 className="font-serif text-2xl font-bold mb-6 text-stone-900 border-l-4 border-agri-green pl-4">How It Works</h2>
                        <ul className="space-y-6">
                            {[
                                "Opportunities are sourced from trusted networks and official channels",
                                "Content is reviewed and structured for clarity and accuracy",
                                "Listings are published with transparent disclaimers",
                                "Selected posts may be highlighted through Featured Listings for increased visibility"
                            ].map((item, index) => (
                                <li key={index} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-agri-green/10 text-agri-green flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <p className="text-stone-700 leading-snug pt-1">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Transparency & Independence */}
                <section className="mb-20 bg-stone-900 text-white rounded-[1.5rem] p-8 md:p-12 overflow-hidden relative max-w-4xl mx-auto shadow-lg">
                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl font-bold mb-6">Transparency & Independence</h2>
                        <p className="text-stone-300 text-lg mb-6 leading-relaxed">
                            Agri Updates is an independent, remote-first platform.
                        </p>
                        <div className="border-t border-stone-700 pt-6">
                            <p className="text-stone-400">
                                We do not guarantee outcomes, selections, or placements.
                                <br />
                                Our role is to improve visibility and access to information.
                            </p>
                        </div>
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-agri-green opacity-10 rounded-full blur-3xl"></div>
                </section>

                {/* Looking Ahead */}
                <section className="mb-16 text-center max-w-2xl mx-auto">
                    <h2 className="font-serif text-3xl font-bold mb-6 text-stone-900">Looking Ahead</h2>
                    <p className="text-stone-600 mb-6 text-lg">
                        Agri Updates is evolving into a comprehensive discovery layer for:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <span className="px-5 py-2 bg-white border border-stone-200 text-stone-700 rounded-full font-medium shadow-sm">Agricultural careers</span>
                        <span className="px-5 py-2 bg-white border border-stone-200 text-stone-700 rounded-full font-medium shadow-sm">Research and innovation</span>
                        <span className="px-5 py-2 bg-white border border-stone-200 text-stone-700 rounded-full font-medium shadow-sm">Startup and ecosystem activity</span>
                    </div>
                    <p className="text-stone-500 italic">
                        We are building gradually, with a focus on trust, consistency, and long-term value.
                    </p>
                </section>

                {/* Contact CTA */}
                <div className="paper-panel p-8 text-center max-w-xl mx-auto shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-stone-900">Contact Us</h3>
                    <p className="text-stone-600 mb-4">
                        For inquiries, partnerships, or Featured Listings:
                    </p>
                    <a
                        href="mailto:hello@agriupdates.online"
                        className="inline-block bg-white text-stone-900 border border-stone-300 px-6 py-3 rounded-full font-mono font-medium hover:border-agri-green hover:text-agri-green transition-colors shadow-sm"
                    >
                        📧 hello@agriupdates.online
                    </a>
                    <div className="mt-6">
                        <Link href="/contact" className="text-sm text-agri-green font-bold uppercase tracking-wider hover:underline">
                            Use Contact Form &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
