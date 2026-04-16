import type { Metadata } from "next";
import { FeedbackAdmin } from "./_components/FeedbackAdmin";

export const metadata: Metadata = { title: "Feedback – Admin" };
export const dynamic = "force-dynamic";

export default function AdminFeedbackPage() {
  return <FeedbackAdmin />;
}
