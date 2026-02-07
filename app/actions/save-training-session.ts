"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface TrainingResult {
    word: string
    isCorrect: boolean
    attempts: number
}

export async function saveTrainingSession(
    letter: string,
    results: TrainingResult[],
    durationSeconds: number
) {
    const supabase = await getSupabaseServerClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    // 2. Calculate stats
    const totalWords = results.length
    const correctCount = results.filter(r => r.isCorrect).length
    const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0)
    const score = Math.round((correctCount / totalWords) * 100)

    // 3. Insert Training Session
    const { error } = await supabase.from("training_sessions").insert({
        user_id: user.id,
        letter: letter.toUpperCase(),
        duration_seconds: durationSeconds,
        words_practiced: totalWords,
        correct_count: correctCount,
        total_attempts: totalAttempts,
        score: score,
        results: results,
    })

    if (error) {
        console.error("Error saving training session:", error)
        return { success: false, error: error.message }
    }

    // 4. Refresh Dashboard
    revalidatePath("/dashboard")
    revalidatePath("/progress")
    return { success: true }
}
