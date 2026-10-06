import { isAdmin } from "@/lib/adminAuth";
import { adminConfigured } from "@/lib/adminSession";
import AdminApp from "@/components/admin/AdminApp";
import Login, { Setup } from "@/components/admin/Login";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) return <Setup />;
  return (await isAdmin()) ? <AdminApp /> : <Login />;
}
