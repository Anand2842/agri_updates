import HubForm from '@/components/admin/HubForm';

export default function NewHubPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold mb-2">Create New Hub</h1>
                <p className="text-stone-500">
                    Create a new landing page for a specific job category or location.
                </p>
            </div>
            <HubForm />
        </div>
    );
}
