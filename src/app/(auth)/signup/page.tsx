import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registrieren",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
