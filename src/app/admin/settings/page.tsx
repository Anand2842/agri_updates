import { createClient } from '@/utils/supabase/server';

export default async function AdminSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-stone-900">Settings</h1>
                <p className="text-stone-500">Manage your account and preferences.</p>
            </header>

            <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Profile Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Email Address</label>
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-800 font-mono text-sm">
                            {user?.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">User ID</label>
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-500 font-mono text-xs">
                            {user?.id}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Last Sign In</label>
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-800 text-sm">
                            {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Role</label>
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-800 text-sm capitalize">
                            {user?.role || 'User'}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100">
                    <p className="text-stone-400 text-sm italic">
                        More settings (notifications, password change) coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
}
