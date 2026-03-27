import { redirect } from 'next/navigation';

export default function WarningsRedirect() {
    redirect('/updates?category=Warnings');
}
