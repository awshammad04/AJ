import { redirect } from "next/navigation"
import Image from "next/image"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile) {
    redirect("/dashboard")
  }

  return (
    // Matches Signup/Login pages
    <main className="flex flex-col items-center justify-start min-h-screen w-full relative p-6 pt-8 overflow-x-hidden">
      
      {/* FIXED BACKGROUND */}
      <div className="fixed inset-0 w-full h-full -z-10">
        <Image
          src="/images/background.png"
          alt="Sky Background"
          fill
          priority
          className="object-cover object-bottom"
          quality={100}
        />
      </div>

      {/* WIZARD CONTENT */}
      {/* We pass the user ID to the wizard, which handles the card design */}
      <OnboardingWizard userId={user.id} />
      
    </main>
  )
}