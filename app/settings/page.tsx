import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SettingsContent } from "@/components/settings/settings-content"
import type { Profile } from "@/lib/types"

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  // Fetch latest assessment to get problem letters
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const problemLetters = assessment?.problem_letters || []

  return <SettingsContent profile={profile as Profile} problemLetters={problemLetters} />
}
