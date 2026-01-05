import { createClient } from '@/utils/supabase/server'
import JobForm from '@/components/admin/JobForm'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

    if (!job) {
        notFound()
    }

    return <JobForm initialData={job} />
}
