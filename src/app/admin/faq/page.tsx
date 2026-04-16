import type { Metadata } from "next";
import { FaqAdmin } from "./_components/FaqAdmin";

export const metadata: Metadata = { title: "FAQ – Admin" };
export const dynamic = "force-dynamic";

export default function AdminFaqPage() {
  return <FaqAdmin />;
}
