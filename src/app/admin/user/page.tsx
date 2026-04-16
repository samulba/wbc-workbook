import type { Metadata } from "next";
import { UserManagement } from "./_components/UserManagement";

export const metadata: Metadata = { title: "Benutzer – Admin" };
export const dynamic = "force-dynamic";

export default function AdminUserPage() {
  return <UserManagement />;
}
