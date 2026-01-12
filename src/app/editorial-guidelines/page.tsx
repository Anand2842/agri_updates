import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editorial Guidelines | Agri Updates',
    description: 'Our commitment to accuracy, independence, and integrity in agricultural reporting.',
};

export default function EditorialPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Editorial Guidelines</h1>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="lead text-xl text-stone-600 mb-8">
                        At Agri Updates, our mission is to provide Indian farmers, researchers, and students with accurate, actionable, and timely information. We hold ourselves to the highest standards of journalistic integrity.
                    </p>

                    <h3>1. Accuracy & Verification</h3>
                    <p>
                        We prioritize accuracy over speed. All news, whether about crop prices, government schemes, or research breakthroughs, is verified against official sources (ICAR, Govt of India notifications, reputable research journals) before publication.
                    </p>

                    <h3>2. Independence</h3>
                    <p>
                        Our editorial content is independent of our advertising and partnership teams. Sponsored content is clearly marked as &quot;Sponsored&quot; or &quot;Partner Content&quot; to maintain transparency with our readers.
                    </p>

                    <h3>3. AI & Automation</h3>
                    <p>
                        While we use advanced technology to aggregate and organize data, every piece of content is reviewed by a human editor to ensure nuance, context, and cultural relevance for our Indian audience.
                    </p>

                    <h3>4. Sourcing</h3>
                    <p>
                        We believe in giving credit where it is due. We always link back to original research papers, company press releases, or government notifications whenever possible.
                    </p>
                </div>
            </div>
        </div>
    );
}
