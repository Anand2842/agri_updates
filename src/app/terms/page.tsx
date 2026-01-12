import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use | Agri Updates',
    description: 'Terms and conditions for using Agri Updates. Legal agreement governing your use of our agricultural careers platform.',
};

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Terms of Use</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        &quot;Building trust through transparency and responsibility&quot;
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="text-sm text-stone-500 mb-8">
                        Last updated: January 1, 2026
                    </p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Agri Updates (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Agri Updates is an online platform that connects agricultural professionals, students, and employers. Our services include job postings, career resources, research updates, and community features related to the agricultural sector.
                    </p>

                    <h2>3. User Accounts</h2>

                    <h3>3.1 Account Creation</h3>
                    <p>
                        To access certain features of our Service, you may be required to create an account. You must provide accurate, complete, and current information during the registration process and keep your account information updated.
                    </p>

                    <h3>3.2 Account Security</h3>
                    <p>
                        You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                    </p>

                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to use the Service:</p>
                    <ul>
                        <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                        <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                        <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                        <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                        <li>To submit false or misleading information</li>
                        <li>To interfere with or circumvent the security features of the Service</li>
                        <li>To use any automated system to access the Service without permission</li>
                    </ul>

                    <h2>5. Job Postings and Applications</h2>

                    <h3>5.1 Employer Responsibilities</h3>
                    <p>
                        Employers posting jobs on our platform must ensure that all information provided is accurate and that they have the legal right to hire for the positions advertised. Employers are responsible for complying with all applicable employment laws and regulations.
                    </p>

                    <h3>5.2 Job Seeker Responsibilities</h3>
                    <p>
                        Job seekers must provide accurate information in their applications and profiles. Misrepresentation may result in account suspension or termination.
                    </p>

                    <h3>5.3 No Guarantee</h3>
                    <p>
                        Agri Updates does not guarantee job placement or employment outcomes. We provide a platform for connecting employers and job seekers but are not responsible for the hiring process or employment decisions.
                    </p>

                    <h2>6. Content and Intellectual Property</h2>

                    <h3>6.1 User-Generated Content</h3>
                    <p>
                        By posting content on our Service, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, display, and distribute your content in connection with the Service.
                    </p>

                    <h3>6.2 Our Intellectual Property</h3>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Agri Updates and its licensors. The Service is protected by copyright, trademark, and other laws.
                    </p>

                    <h2>7. Privacy</h2>
                    <p>
                        Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                    </p>

                    <h2>8. Termination</h2>
                    <p>
                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                    </p>

                    <h2>9. Disclaimers</h2>

                    <h3>9.1 Service Availability</h3>
                    <p>
                        The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.
                    </p>

                    <h3>9.2 Accuracy of Information</h3>
                    <p>
                        While we strive to provide accurate information, we do not warrant the accuracy, completeness, or usefulness of any information on the Service. Users should verify information independently.
                    </p>

                    <h3>9.3 Third-Party Content</h3>
                    <p>
                        Our Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
                    </p>

                    <h2>10. Limitation of Liability</h2>
                    <p>
                        In no event shall Agri Updates, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                    </p>

                    <h2>11. Indemnification</h2>
                    <p>
                        You agree to defend, indemnify, and hold harmless Agri Updates and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney&apos;s fees).
                    </p>

                    <h2>12. Governing Law</h2>
                    <p>
                        These Terms shall be interpreted and governed by the laws of the State of California, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                    </p>

                    <h2>13. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                    </p>

                    <h2>14. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms of Use, please contact us at:
                    </p>
                    <div className="bg-stone-50 p-6 mt-4">
                        <p className="font-bold">Agri Updates</p>
                        <p>Email: legal@agriupdates.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                        <p>Address: 123 Innovation Drive, Agriculture Valley, CA 94043</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
