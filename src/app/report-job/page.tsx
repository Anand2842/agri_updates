import { Metadata } from 'next';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Report a Job | Agri Updates',
    description: 'Report an issue with a job posting or provide feedback to help us improve.',
};

export default function ReportJobPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Report an Issue</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        "Help us maintain a high-quality job board"
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <div className="bg-white border border-stone-200 p-8 rounded-xl shadow-sm">
                    <h2 className="font-serif text-2xl font-bold mb-6">What would you like to report?</h2>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="type" className="block text-sm font-bold text-stone-700 mb-2">
                                Issue Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                required
                                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                            >
                                <option value="">Select an issue type</option>
                                <option value="expired">Job is expired</option>
                                <option value="fake">Fake or scam job</option>
                                <option value="incorrect">Incorrect information</option>
                                <option value="broken">Broken link</option>
                                <option value="other">Other feedback</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="url" className="block text-sm font-bold text-stone-700 mb-2">
                                Job URL (Optional)
                            </label>
                            <input
                                type="url"
                                id="url"
                                name="url"
                                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                placeholder="https://agriupdates.com/jobs/..."
                            />
                        </div>

                        <div>
                            <label htmlFor="details" className="block text-sm font-bold text-stone-700 mb-2">
                                Details *
                            </label>
                            <textarea
                                id="details"
                                name="details"
                                required
                                rows={5}
                                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                placeholder="Please provide more details about the issue..."
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-2">
                                Your Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                        >
                            Submit Report
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-stone-500">
                    For general inquiries, please visit our <a href="/contact" className="text-agri-green hover:underline">Contact Page</a>.
                </p>
            </div>
        </div>
    );
}
