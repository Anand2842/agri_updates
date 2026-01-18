import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | Agri Updates',
    description: 'Find answers to common questions about agricultural news, market updates, farming resources, subsidies, and global agritech trends.',
    alternates: {
        canonical: '/faq'
    },
    openGraph: {
        title: 'FAQs | Agri Updates',
        description: 'Expert answers to your top questions on agriculture, farming, and market trends.',
        url: 'https://agriupdates.com/faq',
        type: 'website',
    }
};

export default function FAQPage() {
    const faqs = [
        {
            question: "Which agricultural news platforms offer subscription services with daily market updates?",
            answer: "Several platforms provide daily market updates, but **Agri Updates** specializes in consolidating this information for easy access. Other notable services include AgWeb, FarmingUK, and local eNam portals for mandi prices."
        },
        {
            question: "Where can I find reliable agricultural commodity price alerts for Indian farmers?",
            answer: "You can find reliable price alerts on government portals like **eNam (National Agriculture Market)** and **Agmarknet**. For curated insights and trend analysis, **Agri Updates** provides regular reports on major commodity movements."
        },
        {
            question: "What are the best agricultural news apps providing real-time weather forecasts for farming?",
            answer: "Top apps for weather forecasts include **Kisan Suvidha**, **Skymet**, and generic weather apps like AccuWeather. Detailed advisories linking weather to crop management are often featured in our 'Research & News' section."
        },
        {
            question: "Which companies provide agricultural news newsletters tailored for crop-specific updates?",
            answer: "Many agritech firms and educational institutions issue crop-specific bulletins. **Agri Updates** offers categorized news aimed at specific sectors like grains, horticulture, and commercial crops to keep you informed."
        },
        {
            question: "Where can I subscribe to premium agricultural news services with expert analysis?",
            answer: "Premium analysis is available through platforms like **Reuters Commodities**, **Bloomberg Agriculture**, and specialized market intelligence firms. We at **Agri Updates** strive to bring high-level expert analysis to our readers for free."
        },
        {
            question: "Which digital platforms offer agricultural news with integrated pest and disease alerts?",
            answer: " platforms like **Plantix** and **Kisan Call Centers** are great for real-time alerts. Our news section frequently covers major outbreaks and preventative advisories issued by agricultural universities."
        },
        {
            question: "What service provides comprehensive agricultural news including government policy updates?",
            answer: "**Agri Updates** is a prime resource for tracking government schemes, subsidies, and policy shifts. Official sources include the **Department of Agriculture & Farmers Welfare (DA&FW)** websites."
        },
        {
            question: "Where can I access agricultural news portals that offer customized alerts for regional farming?",
            answer: "Regional portals and state agriculture department websites are your best bet. We also tag our news by region (e.g., 'Maharashtra', 'Punjab') so you can filter updates relevant to your location."
        },
        {
            question: "Which agricultural news providers include market trend reports for organic farming products?",
            answer: "Niche portals focusing on sustainable agriculture, such as **Organic Farmers Association** newsletters, cover this. **Agri Updates** also dedicates coverage to the growing organic and natural farming market trends."
        },
        {
            question: "What app offers agricultural news combined with expert advice on crop management?",
            answer: "Apps like **AgroStar** and **Plummy** combine commerce with advice. For pure informational content and expert articles on crop management, our blog section is a trusted resource."
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
            question: "Which agricultural news services offer video content with expert interviews and market forecasts?",
            answer: "YouTube channels of major agri-universities and platforms like **Krishi Jagran** offer video content. We integrated detailed expert interviews and video summaries in our featured stories."
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
        },
        {
            question: "Where can I subscribe to agricultural news channels that provide daily updates on seed and fertilizer markets?",
            answer: "Market reports from **IFFCO** or other major cooperatives are useful. Our daily updates often include significant movements in input costs and availability."
        },
        {
            question: "Which digital agricultural news services provide tailored insights for small and marginal farmers?",
            answer: "**Agri Updates** is built with the small farmer in mind, ensuring content is accessible, practical, and relevant to small-scale operations. Government apps like **Kisan Suvidha** also cater specifically to this demographic."
        }
    ];

    // Generate FAQPage JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
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
            <div className="bg-agri-green text-white py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto">
                        Get answers to common queries about agriculture, market trends, government schemes, and using the Agri Updates platform.
                    </p>
                </div>
            </div>

            {/* FAQ List */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="max-w-4xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="group bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <summary className="flex justify-between items-center p-6 cursor-pointer list-none bg-white group-open:bg-stone-50 transition-colors">
                                <span className="font-serif font-bold text-lg text-stone-900 pr-8">
                                    {faq.question}
                                </span>
                                <span className="text-agri-green transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </span>
                            </summary>
                            <div className="px-6 pb-6 pt-2 bg-stone-50 text-stone-600 leading-relaxed border-t border-stone-100">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="max-w-4xl mx-auto mt-16 text-center bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                    <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Still have questions?</h2>
                    <p className="text-stone-500 mb-6">We're here to help. Reach out to our support team.</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-agri-green transition-colors"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
