import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Corrections Policy | Agri Updates',
    description: 'How we handle errors and updates to our content.',
};

export default function CorrectionsPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Corrections Policy</h1>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="lead text-xl text-stone-600 mb-8">
                        We are committed to correcting errors promptly and transparently. Trust is our most valuable asset.
                    </p>

                    <h3>Reporting an Error</h3>
                    <p>
                        If you believe you have found an error in one of our articles, please email us immediately at <a href="mailto:corrections@agriupdates.com">corrections@agriupdates.com</a> with the article link and the specific factual error.
                    </p>

                    <h3>How We Issue Corrections</h3>
                    <ul>
                        <li><strong>Minor Errors:</strong> Typos or minor inaccuracies that do not change the meaning of the story will be corrected in the text without a formal note, unless the error was significant.</li>
                        <li><strong>Factual Errors:</strong> If we get a fact wrong (e.g., wrong data figure, misspelled name), we will correct the text and add a <em>"Correction:"</em> note at the bottom of the article explaining what was changed and when.</li>
                        <li><strong>Retractions:</strong> In rare cases where a story is fundamentally flawed, we will retract it with an editor's note explaining the decision.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
