import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ProgressContent } from "@/components/progress/progress-content"
import type { Profile } from "@/lib/types"

export default async function ProgressPage() {
    const supabase = await getSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (!profile) {
        redirect("/onboarding")
    }

    // Fetch training sessions
    const { data: trainingSessions } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    // Fetch practice sessions (from adventure mode)
    const { data: practiceSessions } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <ProgressContent
            profile={profile as Profile}
            trainingSessions={trainingSessions || []}
            practiceSessions={practiceSessions || []}
        />
    )
}
