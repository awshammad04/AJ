import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TrainingContent } from "@/components/training/training-content"
import type { Profile } from "@/lib/types"

interface TrainingPageProps {
    params: Promise<{
        letter: string
    }>
}

export default async function TrainingPage({ params }: TrainingPageProps) {
    const { letter } = await params

    // Validate letter parameter
    const validLetters = ["kaf", "sin", "ra"]
    if (!validLetters.includes(letter.toLowerCase())) {
        redirect("/dashboard")
    }

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

    return (
        <TrainingContent
            letter={letter.toLowerCase() as "kaf" | "sin" | "ra"}
            profile={profile as Profile}
            userId={user.id}
        />
    )
}
