import type { Metadata } from "next";
import { PaletteAdmin } from "./_components/PaletteAdmin";

export const metadata: Metadata = { title: "Farbpaletten – Admin" };
export const dynamic = "force-dynamic";

export default function AdminFarbenPage() {
  return <PaletteAdmin />;
}
