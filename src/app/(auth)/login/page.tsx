import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
