import { createClient } from '@/utils/supabase/server';
import HubForm from '@/components/admin/HubForm';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditHubPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: hub } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', id)
        .single();

    if (!hub) {
        notFound();
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold mb-2">Edit Hub</h1>
                <p className="text-stone-500">
                    Update the hub configuration for <strong>/{hub.slug}</strong>
                </p>
            </div>
            <HubForm initialData={hub} />
        </div>
    );
}
