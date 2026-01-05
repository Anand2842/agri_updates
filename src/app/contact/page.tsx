import { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
    title: 'Contact Us | Agri Updates',
    description: 'Get in touch with Agri Updates. Reach out for partnerships, job postings, or any questions about agricultural careers.',
};

export default function ContactPage() {
    return <ContactForm />;
}
