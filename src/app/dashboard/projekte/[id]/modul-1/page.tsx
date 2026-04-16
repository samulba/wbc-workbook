import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

/**
 * Legacy redirect: /projekte/[id]/modul-1 → /projekte/[id]/raum/[roomId]/modul-1
 * Kept for backwards compat (bookmarks, old links).
 */
export default async function Modul1RedirectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, rooms(id)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type RoomRow = { id: string };
  const firstRoom = (project.rooms as RoomRow[])?.[0];
  if (!firstRoom) notFound();

  const editSuffix = searchParams.edit === "true" ? "?edit=true" : "";
  redirect(`/dashboard/projekte/${params.id}/raum/${firstRoom.id}/modul-1${editSuffix}`);
}
