import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/profile";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getMyProfile();

  return (
    <section>
      <h1>Settings</h1>
      <SettingsForm initialName={profile?.displayName ?? ""} email={user.email ?? ""} />
    </section>
  );
}
