import type { Metadata } from "next";
import { InspirationAdmin } from "./_components/InspirationAdmin";

export const metadata: Metadata = { title: "Inspiration – Admin" };
export const dynamic = "force-dynamic";

export default function AdminInspirationPage() {
  return <InspirationAdmin />;
}
