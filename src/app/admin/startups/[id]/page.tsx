import { createClient } from '@/utils/supabase/server'
import StartupForm from '@/components/admin/StartupForm'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditStartupPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: startup } = await supabase
        .from('startups')
        .select('*')
        .eq('id', id)
        .single()

    if (!startup) {
        return notFound()
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold mb-2">Edit Startup</h1>
                <p className="text-stone-500">Update company details.</p>
            </div>
            <StartupForm initialData={startup} />
        </div>
    )
}
