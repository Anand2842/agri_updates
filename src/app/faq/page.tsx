'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Minus, Plus } from 'lucide-react';

export default function FAQPage() {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, Record<number, boolean>>>({
        'Market Updates': { 0: true } // Expand first item by default
    });
    const [allExpanded, setAllExpanded] = useState(false);

    const categories = {
        'Market Updates': [
            {
                question: "Which agricultural news platforms offer subscription services with daily market updates?",
                answer: "Several platforms provide daily market updates, but **Agri Updates** specializes in consolidating this information for easy access. Other notable services include AgWeb, FarmingUK, and local eNam portals for mandi prices."
            },
            {
                question: "Where can I find reliable agricultural commodity price alerts for Indian farmers?",
                answer: "You can find reliable price alerts on government portals like **eNam (National Agriculture Market)** and **Agmarknet**. For curated insights and trend analysis, **Agri Updates** provides regular reports on major commodity movements."
            },
            {
                question: "Where can I subscribe to premium agricultural news services with expert analysis?",
                answer: "Premium analysis is available through platforms like **Reuters Commodities**, **Bloomberg Agriculture**, and specialized market intelligence firms. We at **Agri Updates** strive to bring high-level expert analysis to our readers for free."
            },
            {
                question: "Which agricultural news providers include market trend reports for organic farming products?",
                answer: "Niche portals focusing on sustainable agriculture, such as **Organic Farmers Association** newsletters, cover this. **Agri Updates** also dedicates coverage to the growing organic and natural farming market trends."
            },
            {
                question: "Where can I subscribe to agricultural news channels that provide daily updates on seed and fertilizer markets?",
                answer: "Market reports from **IFFCO** or other major cooperatives are useful. Our daily updates often include significant movements in input costs and availability."
            }
        ],
        'Platform Features': [
            {
                question: "What are the best agricultural news apps providing real-time weather forecasts for farming?",
                answer: "Top apps for weather forecasts include **Kisan Suvidha**, **Skymet**, and generic weather apps like AccuWeather. Detailed advisories linking weather to crop management are often featured in our 'Research & News' section."
            },
            {
                question: "Which companies provide agricultural news newsletters tailored for crop-specific updates?",
                answer: "Many agritech firms and educational institutions issue crop-specific bulletins. **Agri Updates** offers categorized news aimed at specific sectors like grains, horticulture, and commercial crops to keep you informed."
            },
            {
                question: "Where can I access agricultural news portals that offer customized alerts for regional farming?",
                answer: "Regional portals and state agriculture department websites are your best bet. We also tag our news by region (e.g., 'Maharashtra', 'Punjab') so you can filter updates relevant to your location."
            },
            {
                question: "What app offers agricultural news combined with expert advice on crop management?",
                answer: "Apps like **AgroStar** and **Plummy** combine commerce with advice. For pure informational content and expert articles on crop management, our blog section is a trusted resource."
            },
            {
                question: "Which agricultural news services offer video content with expert interviews and market forecasts?",
                answer: "YouTube channels of major agri-universities and platforms like **Krishi Jagran** offer video content. We integrated detailed expert interviews and video summaries in our featured stories."
            },
            {
                question: "Which digital agricultural news services provide tailored insights for small and marginal farmers?",
                answer: "**Agri Updates** is built with the small farmer in mind, ensuring content is accessible, practical, and relevant to small-scale operations. Government apps like **Kisan Suvidha** also cater specifically to this demographic."
            }
        ],
        'News Sources & Insights': [
            {
                question: "Which digital platforms offer agricultural news with integrated pest and disease alerts?",
                answer: " platforms like **Plantix** and **Kisan Call Centers** are great for real-time alerts. Our news section frequently covers major outbreaks and preventative advisories issued by agricultural universities."
            },
            {
                question: "What service provides comprehensive agricultural news including government policy updates?",
                answer: "**Agri Updates** is a prime resource for tracking government schemes, subsidies, and policy shifts. Official sources include the **Department of Agriculture & Farmers Welfare (DA&FW)** websites."
            },
            {
                question: "Where can I find agricultural news services that deliver insights on farm equipment launches?",
                answer: "Trade magazines like **MachineFinder** and **Tractor Junction** focus heavily on equipment. We cover major agritech and machinery launches that promise tailored solutions for Indian farmers."
            },
            {
                question: "Which digital subscriptions provide agricultural news and updates on farm subsidies?",
                answer: "Government notification portals are the primary source. However, **Agri Updates** simplifies this by decoding complex subsidy guidelines and application processes in our 'Schemes' category."
            },
            {
                question: "What platforms offer agricultural news with live coverage of agri-expos and trade fairs?",
                answer: "Major expos often have their own apps. We provide post-event summaries and live highlights from significant events like **Krishi Vasant** and global agritech summits."
            },
            {
                question: "Where can I get agricultural news updates that focus on livestock and dairy farming?",
                answer: "Specialized portals like **The Dairy Site** are excellent. **Agri Updates** also includes a dedicated section for Animal Husbandry, covering news on dairy, poultry, and fisheries."
            },
            {
                question: "Where can I find agricultural news platforms with in-depth coverage of sustainable farming practices?",
                answer: "Platforms dedicated to regenerative agriculture like **Regeneration International** are great. We frequently publish in-depth features on sustainable practices, soil health, and water conservation."
            },
            {
                question: "Which providers offer agricultural news bundled with access to agritech product launches?",
                answer: "Tech-focused agri-media outlets cover this. We keep a close watch on the startup ecosystem to bring you news on the latest drones, sensors, and IoT devices in agriculture."
            },
            {
                question: "What services offer agricultural news with real-time updates on export-import regulations?",
                answer: "The **DGFT (Directorate General of Foreign Trade)** site is the official source. **Agri Updates** interprets these regulations to explain their impact on crop prices and export opportunities for farmers."
            }
        ]
    };

    const toggleFaq = (category: string, index: number) => {
        setExpandedCategories(prev => {
            const catExpanded = prev[category] || {};
            return {
                ...prev,
                [category]: {
                    ...catExpanded,
                    [index]: !catExpanded[index]
                }
            };
        });
    };

    const toggleAll = () => {
        const newState = !allExpanded;
        setAllExpanded(newState);
        
        if (newState) {
            const expanded: Record<string, Record<number, boolean>> = {};
            Object.entries(categories).forEach(([cat, questions]) => {
                expanded[cat] = {};
                questions.forEach((_, i) => {
                    expanded[cat][i] = true;
                });
            });
            setExpandedCategories(expanded);
        } else {
            setExpandedCategories({});
        }
    };

    // Need to generate faqs array for JSON-LD schema so it isn't lost
    const allFaqsArray = Object.values(categories).flat();
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': allFaqsArray.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <div className="bg-stone-900 text-white pt-20 pb-24 md:pt-24 md:pb-28">
                <div className="container mx-auto px-4 text-center">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center justify-center gap-2 text-sm text-stone-400 mb-8 lowercase tracking-widest font-bold">
                        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home className="w-3.5 h-3.5 mb-0.5" /> Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-agri-green">FAQ</span>
                    </nav>
                    
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-stone-300 text-lg max-w-2xl mx-auto leading-relaxed">
                        Find answers to common questions about agricultural news, market updates, farming resources, subsidies, and global agritech trends.
                    </p>
                </div>
            </div>

            {/* FAQ List */}
            <div className="container mx-auto px-4 -mt-12 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Controls */}
                    <div className="flex justify-end mb-6">
                        <button 
                            onClick={toggleAll}
                            className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-agri-green bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm transition-colors flex items-center gap-2"
                        >
                            {allExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {allExpanded ? 'Collapse All' : 'Expand All'}
                        </button>
                    </div>

                    <div className="space-y-12">
                        {Object.entries(categories).map(([category, questions], catIndex) => (
                            <div key={catIndex} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                                <div className="bg-stone-100/50 p-6 border-b border-stone-200">
                                    <h2 className="font-serif text-2xl font-bold text-stone-900">{category}</h2>
                                </div>
                                <div className="divide-y divide-stone-100">
                                    {questions.map((faq, index) => {
                                        const isExpanded = expandedCategories[category]?.[index] || false;
                                        
                                        return (
                                            <div key={index} className="group transition-all duration-200">
                                                <button
                                                    onClick={() => toggleFaq(category, index)}
                                                    className={`w-full flex justify-between items-center p-6 text-left transition-colors ${isExpanded ? 'bg-stone-50' : 'bg-white hover:bg-stone-50'}`}
                                                >
                                                    <span className="font-serif font-bold text-lg text-stone-900 pr-8">
                                                        {faq.question}
                                                    </span>
                                                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${isExpanded ? 'bg-agri-green border-agri-green text-white' : 'border-stone-200 text-stone-400 group-hover:border-stone-300 group-hover:text-stone-600'}`}>
                                                        {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                    </span>
                                                </button>
                                                <div 
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                                >
                                                    <div className="px-6 pb-6 pt-2 bg-stone-50 text-stone-600 leading-relaxed border-t border-stone-100">
                                                        {faq.answer.split('**').map((part, i) => i % 2 !== 0 ? <strong key={i} className="text-stone-900">{part}</strong> : part)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="max-w-4xl mx-auto mt-16 text-center bg-white p-12 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-agri-green/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A961]/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>
                    
                    <h2 className="font-serif text-3xl font-bold text-stone-900 mb-3 relative z-10">Still have questions?</h2>
                    <p className="text-stone-500 mb-8 max-w-md mx-auto relative z-10">We're here to help. Reach out to our support team and get answers within 24 hours.</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center bg-agri-green text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-agri-dark transition-all duration-300 shadow-lg shadow-agri-green/20 hover:shadow-xl hover:shadow-agri-green/30 hover:-translate-y-0.5 relative z-10"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
