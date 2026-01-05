import StartupForm from '@/components/admin/StartupForm'

export default function NewStartupPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold mb-2">Add New Startup</h1>
                <p className="text-stone-500">Feature a new innovative company.</p>
            </div>
            <StartupForm />
        </div>
    )
}
