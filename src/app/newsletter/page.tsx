import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

export const metadata: Metadata = {
    title: 'Newsletter | Agri Updates',
    description: 'Subscribe to the Agri Updates newsletter for the latest in agricultural innovation and careers.',
};

export default function NewsletterPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Subscribe to Agri Updates</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        &quot;Stay ahead of the curve in agricultural innovation&quot;
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <div className="bg-white border border-stone-200 p-8 md:p-12 rounded-xl shadow-sm text-center">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-agri-green" />
                    </div>

                    <h2 className="font-serif text-2xl font-bold mb-4">Join 2,500+ Subscribers</h2>
                    <p className="text-stone-500 mb-8 leading-relaxed">
                        Get weekly updates on the latest agritech startups, research breakthroughs, and premium job listings delivered straight to your inbox. No spam, ever.
                    </p>

                    <NewsletterForm />
                </div>
            </div>
        </div>
    );
}
