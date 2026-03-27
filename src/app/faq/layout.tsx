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

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
