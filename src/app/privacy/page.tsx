import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Agri Updates',
    description: 'Privacy Policy for Agri Updates - The Global Hub for Agricultural Careers and Innovation.',
};

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        "Transparent, Secure, and Respectful of Your Data"
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="text-sm text-stone-500 mb-8">
                        Last Updated: January 4, 2026
                    </p>

                    <h2>1. Who We Are</h2>
                    <p>
                        Agri Updates ("we," "our," or "us") is a digital media platform dedicated to agricultural news, career opportunities, and innovation. We aggregate job listings and publish news content for the agriculture sector. We respect your privacy and are committed to protecting your personal data.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>We collect minimal data necessary to improve your experience:</p>
                    <ul>
                        <li><strong>Usage Data:</strong> Information on how you access and use the website (IP address, browser type, pages visited).</li>
                        <li><strong>Contact Information:</strong> Name and email address if you voluntarily subscribe to our newsletter or contact us via forms.</li>
                        <li><strong>Cookies:</strong> Small data files used to ensure website functionality and analyze traffic patterns.</li>
                    </ul>

                    <h2>3. How We Use Your Data</h2>
                    <p>Your data is used solely for:</p>
                    <ul>
                        <li>Delivering the content and services you request (e.g., newsletters).</li>
                        <li>Responding to your inquiries or support requests.</li>
                        <li>Improving our website performance and user experience.</li>
                        <li>Monitoring aggregate usage metrics to understand our audience.</li>
                    </ul>

                    <h2>4. Job Listings & External Links</h2>
                    <p>
                        Our platform serves as a news aggregator for job opportunities. When you click "Apply," you may be directed to third-party websites (e.g., company career pages, LinkedIn). We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read their privacy policies before submitting any personal information.
                    </p>

                    <h2>5. Data Security</h2>
                    <p>
                        We implement standard industry security measures to protect your data. However, no transmission over the internet is completely secure, and we cannot guarantee absolute security.
                    </p>

                    <h2>6. Your Rights</h2>
                    <p>
                        You have the right to request access to, correction of, or deletion of your personal data held by us. To exercise these rights, please contact us at the email below.
                    </p>

                    <h2>7. Changes to This Policy</h2>
                    <p>
                        We may update this policy periodically. Changes will be posted on this page with an updated date.
                    </p>

                    <h2>8. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us:
                    </p>
                    <div className="bg-stone-50 p-6 mt-4 border border-stone-200">
                        <p className="font-bold text-lg">Agri Updates Privacy Team</p>
                        <p>Email: <a href="mailto:privacy@agriupdates.com" className="text-agri-green hover:underline">privacy@agriupdates.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
