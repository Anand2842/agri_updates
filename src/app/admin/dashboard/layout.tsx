import { requireStaff } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export default async function StaffRestrictedLayout({ children }: { children: React.ReactNode }) {
    await requireStaff(await createClient());
    return <>{children}</>;
}
