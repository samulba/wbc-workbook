import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = { title: "Analytics – Admin" };
export const dynamic = "force-dynamic";

// No SSR – recharts uses browser APIs
const AnalyticsDashboard = dynamic(
  () => import("./_components/AnalyticsDashboard").then(m => ({ default: m.AnalyticsDashboard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-forest/40 animate-spin" strokeWidth={1.5} />
      </div>
    ),
  }
);

export default function AdminAnalyticsPage() {
  return <AnalyticsDashboard />;
}
