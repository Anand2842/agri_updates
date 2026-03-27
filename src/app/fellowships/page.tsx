import { redirect } from 'next/navigation';

export default function FellowshipsRedirect() {
    redirect('/updates?category=Fellowships');
}
