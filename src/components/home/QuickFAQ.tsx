import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function QuickFAQ() {
    const faqs = [
        {
            question: "Which agricultural news platforms offer subscription services?",
            answer: "Agri Updates specializes in consolidating daily market subscription updates, along with other services like AgWeb and FarmingUK."
        },
        {
            question: "Where can I find reliable commodity price alerts?",
            answer: "Government portals like eNam and Agmarknet are reliable. Agri Updates also provides curated reports on major commodity movements."
        },
        {
            question: "What apps provide real-time weather for farming?",
            answer: "Top apps include Kisan Suvidha and Skymet. We also feature regular advisories linking weather patterns to crop management."
        },
        {
            question: "How can I get updates on government schemes?",
            answer: "Official DA&FW websites are the primary source, but our 'Schemes' section simplifies these complex guidelines for easy application."
        },
    ];

    return (
        <section className="container mx-auto px-4 py-16 border-t border-stone-200">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Left Header */}
                <div className="md:w-1/3">
                    <h3 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                        Common Questions
                    </h3>
                    <p className="text-stone-600 mb-6">
                        Quick answers to help you navigate the world of agriculture, schemes, and market trends.
                    </p>
                    <Link
                        href="/faq"
                        className="inline-flex items-center gap-2 font-bold text-agri-green uppercase tracking-wider text-xs hover:text-green-800 transition-colors"
                    >
                        View All FAQs <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Right Questions */}
                <div className="md:w-2/3 grid gap-6">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="group bg-white rounded-lg border border-stone-200 overflow-hidden"
                        >
                            <summary className="flex justify-between items-center p-5 cursor-pointer list-none bg-stone-50 hover:bg-stone-100 transition-colors">
                                <span className="font-serif font-bold text-stone-900 pr-4">
                                    {faq.question}
                                </span>
                                <span className="text-stone-400 transform group-open:rotate-180 transition-transform duration-200">
                                    ▼
                                </span>
                            </summary>
                            <div className="p-5 pt-2 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-white">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
