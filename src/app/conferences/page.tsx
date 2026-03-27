import { redirect } from 'next/navigation';

export default function ConferencesRedirect() {
    redirect('/updates?category=Events');
}
