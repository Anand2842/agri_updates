import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export default async function AdminRestrictedLayout({ children }: { children: React.ReactNode }) {
    await requireAdmin(await createClient());
    return <>{children}</>;
}
