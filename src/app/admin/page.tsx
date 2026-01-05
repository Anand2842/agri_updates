export default function AdminDashboard() {
    return (
        <div>
            <h1 className="font-serif text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Stats Placeholder */}
                <div className="bg-white p-6 shadow-sm border border-stone-200">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Total Jobs</h3>
                    <p className="text-4xl font-serif">--</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-stone-200">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Total Posts</h3>
                    <p className="text-4xl font-serif">--</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-stone-200">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Subscribers</h3>
                    <p className="text-4xl font-serif">--</p>
                </div>
            </div>

            <div className="mt-12 bg-white p-8 border border-stone-200">
                <h2 className="font-serif text-xl font-bold mb-4">Welcome to Agri Updates Admin</h2>
                <p className="text-stone-600">
                    Use the sidebar to manage Jobs, News Posts, and Startups.
                    Ensure you fill out all fields for SEO optimization.
                </p>
            </div>
        </div>
    )
}
