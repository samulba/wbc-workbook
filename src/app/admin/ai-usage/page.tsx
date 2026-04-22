import type { Metadata } from "next";
import { AiUsageDashboard } from "./_components/AiUsageDashboard";

export const metadata: Metadata = { title: "AI-Usage" };

export default function AdminAiUsagePage() {
  return <AiUsageDashboard />;
}
