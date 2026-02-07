"use server"

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdventureEngine } from "@/components/assessment/adventure-engine"

export default async function AdventurePage() {
   const supabase = await getSupabaseServerClient()

   // 1. Auth Check
   const {
      data: { user },
   } = await supabase.auth.getUser()

   if (!user) {
      redirect("/login")
   }

   // 2. Profile Fetch
   const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

   if (!profile) {
      redirect("/onboarding")
   }

   // 3. Render Game Engine
   return <AdventureEngine profile={profile} />
}