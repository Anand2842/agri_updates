import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer | Agri Updates',
    description: 'Important disclaimers for job postings, career advice, and information on Agri Updates. Please read carefully before using our services.',
};

export default function DisclaimerPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        "Transparency and accuracy in all our communications"
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="text-sm text-stone-500 mb-8">
                        Last updated: January 1, 2026
                    </p>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8">
                        <h3 className="text-amber-800 font-bold mb-2">⚠️ Important Notice</h3>
                        <p className="text-amber-700">
                            Please read this disclaimer carefully before using Agri Updates. By using our platform, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
                        </p>
                    </div>

                    <h2>1. General Information Disclaimer</h2>
                    <p>
                        The information provided on Agri Updates is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website for any purpose.
                    </p>

                    <h2>2. Job Posting Disclaimer</h2>

                    <h3>2.1 No Employment Guarantee</h3>
                    <p>
                        Agri Updates provides a platform for employers to post job opportunities and for job seekers to find potential employment. We do not guarantee job placement, employment outcomes, or that any job posting will result in employment. The ultimate hiring decisions are made solely by the employers.
                    </p>

                    <h3>2.2 Job Posting Accuracy</h3>
                    <p>
                        While we review job postings for compliance with our terms, we cannot verify the accuracy of all information provided by employers, including job descriptions, requirements, salary information, benefits, or company details. Users should independently verify all information before applying for positions.
                    </p>

                    <h3>2.3 Third-Party Job Postings</h3>
                    <p>
                        Some job postings may be sourced from third-party websites or services. We are not responsible for the content, accuracy, or availability of third-party job listings. Users should exercise caution and verify information directly with employers.
                    </p>

                    <h2>3. Career Advice Disclaimer</h2>
                    <p>
                        Any career advice, interview tips, resume guidance, or professional development content provided on Agri Updates is for informational purposes only. This information does not constitute professional career counseling or advice. We recommend consulting with qualified career professionals for personalized guidance.
                    </p>

                    <h2>4. Research and Industry Information</h2>

                    <h3>4.1 Research Updates</h3>
                    <p>
                        Research updates, scientific articles, and industry news shared on our platform are sourced from various publications and researchers. We do not conduct original research and cannot guarantee the accuracy, completeness, or current validity of all information presented.
                    </p>

                    <h3>4.2 Industry Trends</h3>
                    <p>
                        Market analysis, trend reports, and industry insights are based on available data at the time of publication. The agricultural industry changes rapidly, and information may become outdated. Users should conduct their own research and due diligence.
                    </p>

                    <h2>5. Startup and Funding Information</h2>

                    <h3>5.1 Startup Profiles</h3>
                    <p>
                        Startup company profiles, funding announcements, and business information are provided as a service to the community. We do not endorse or guarantee the legitimacy, financial stability, or business practices of any startup featured on our platform.
                    </p>

                    <h3>5.2 Funding Data</h3>
                    <p>
                        Funding amounts, valuations, and investment information are based on publicly available data and company disclosures. This information may not be current or accurate. We recommend verifying funding information through official sources.
                    </p>

                    <h2>6. User-Generated Content</h2>
                    <p>
                        Comments, reviews, forum posts, and other user-generated content on Agri Updates reflect the opinions of individual users and do not necessarily represent the views of Agri Updates. We do not endorse or guarantee the accuracy of user-generated content.
                    </p>

                    <h2>7. External Links and Third-Party Content</h2>
                    <p>
                        Agri Updates may contain links to external websites or services. We are not responsible for the availability, content, privacy policies, or practices of these external sites. The inclusion of any link does not imply endorsement by Agri Updates.
                    </p>

                    <h2>8. Service Availability</h2>
                    <p>
                        We strive to maintain the availability and functionality of our platform, but we do not guarantee uninterrupted access. Service outages, technical issues, or maintenance may occur without notice.
                    </p>

                    <h2>9. Professional Advice</h2>
                    <p>
                        Information provided on Agri Updates is not intended to constitute legal, financial, tax, investment, medical, or other professional advice. Users should consult with qualified professionals for advice specific to their situation.
                    </p>

                    <h2>10. Limitation of Liability</h2>
                    <p>
                        In no event shall Agri Updates, its directors, employees, or agents be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use of, or inability to use, our platform or services.
                    </p>

                    <h2>11. Updates to This Disclaimer</h2>
                    <p>
                        We may update this disclaimer from time to time. The most current version will always be available on this page. Continued use of our platform after changes constitutes acceptance of the updated disclaimer.
                    </p>

                    <h2>12. Contact Information</h2>
                    <p>
                        If you have questions about this disclaimer or concerns about content on our platform, please contact us:
                    </p>
                    <div className="bg-stone-50 p-6 mt-4">
                        <p className="font-bold">Agri Updates</p>
                        <p>Email: disclaimer@agriupdates.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                        <p>Address: 123 Innovation Drive, Agriculture Valley, CA 94043</p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mt-8">
                        <h3 className="text-blue-800 font-bold mb-2">📞 Need Help?</h3>
                        <p className="text-blue-700">
                            If you're unsure about any information on our platform or need clarification about a job posting, please don't hesitate to contact us. We're here to help ensure you have accurate and reliable information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
