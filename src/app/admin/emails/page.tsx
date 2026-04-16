import type { Metadata } from "next";
import { EmailList } from "./_components/EmailList";

export const metadata: Metadata = { title: "Email-Liste – Admin" };
export const dynamic = "force-dynamic";

export default function AdminEmailsPage() {
  return <EmailList />;
}
