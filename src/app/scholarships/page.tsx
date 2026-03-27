import { redirect } from 'next/navigation';

export default function ScholarshipsRedirect() {
    redirect('/updates?category=Scholarships');
}
