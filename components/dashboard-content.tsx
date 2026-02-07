"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type Profile, type PracticeSession } from "@/lib/types"
import { LogOut, Play, Lock, Trophy, Settings, BookOpen, Map, BarChart3 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

// --- TRAINING PLAN DATA (Same as adventure-engine) ---
const TRAINING_PLAN = {
  KAF: { title: "حرف الكاف (ك)", desc: "تمارين لتقوية مخرج الكاف والتمييز بينه وبين التاء." },
  RA: { title: "حرف الراء (ر)", desc: "تدريبات اللسان لنطق الراء بشكل صحيح بدلاً من اللام." },
  SIN: { title: "حرف السين (س)", desc: "تمارين للتمييز بين السين والثاء (الصفير)." },
}

interface DashboardContentProps {
  profile: Profile
  sessions: PracticeSession[]
}

// Asset mapping based on tutor
const getTutorAssets = (tutor: "tutorA" | "tutorB") => {
  if (tutor === "tutorA") {
    return {
      hi: "/images/HiAws.png",
      treasure: "/images/treasureAws.png",
      watch: "/images/watchAws.png",
      dog: "/images/dogWithAws.png",
      feather: "/images/featherAws.png",
    }
  }
  return {
    hi: "/images/HiJoud.png",
    treasure: "/images/treasureJoud.png",
    watch: "/images/watchJoud.png",
    dog: "/images/dogWithJoud.png",
    feather: "/images/featherJoud.png",
  }
}

export function DashboardContent({ profile, sessions }: DashboardContentProps) {
  const router = useRouter()
  const tutorAssets = getTutorAssets(profile.selected_tutor)
  const hasAssessment = sessions.length > 0

  // Get latest session's diagnosed letters
  const latestSession = sessions[0]
  const diagnosedLetters: string[] = latestSession?.letters || []

  // State for Practice Park modal
  const [showPracticePark, setShowPracticePark] = useState(false)

  // Check which tutor is selected to adjust sizing
  const isAws = profile.selected_tutor === "tutorA"

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/rainforest.png"
          alt="Rainforest Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pb-safe">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 pt-safe">
          <div className="flex items-center gap-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
              <p className="text-sm font-bold text-gray-800">
                ⭐ {profile.stars || 0} Stars
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
              <p className="text-sm font-bold text-orange-600">
                🔥 {profile.streak_days || 0} Day Streak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/progress">
              <Button variant="ghost" size="icon" className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <span className="sr-only">Progress</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
                <Settings className="w-5 h-5 text-gray-700" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 text-gray-700" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </header>

        {/* Hero Card with Character */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <div className="relative w-full max-w-md">

            {/* Character Image - CONDITIONAL SIZING */}
            {/* If Aws: Margin -180px. If Joud: Margin -150px (less aggressive overlap) */}
            <div className={`relative z-20 flex justify-center ${isAws ? "mb-[-220px]" : "mb-[-130px]"}`}>

              {/* If Aws: Extra Big (w-64/w-80). If Joud: Normal/Smaller (w-48/w-64) */}
              <div className={`relative ${isAws ? "w-72 h-72 sm:w-88 sm:h-88" : "w-32 h-32 sm:w-48 sm:h-48"}`}>
                <Image
                  src={tutorAssets.hi}
                  alt="Tutor with treasure"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  quality={100}
                />
              </div>
            </div>

            {/* Glassmorphism Card */}
            <Card className="relative z-10 border-0 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
              {/* Padding top is larger for Aws (pt-32) because he is taller, smaller for Joud (pt-24) */}
              <CardContent className={`${isAws ? "pt-32" : "pt-24"} pb-8 px-6 sm:px-8 text-center`}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                  Hi, {profile.child_name}! 👋
                </h2>
                <p className="text-lg sm:text-xl text-gray-700 mb-6 font-medium">
                  Ready to help me find the treasure?
                </p>

                {/* 3D Green Button */}
                <Link href="/assessment/play">
                  <Button
                    size="lg"
                    className="w-full h-16 sm:h-18 text-xl sm:text-2xl font-bold rounded-2xl shadow-xl border-b-4 border-green-700 bg-green-600 hover:bg-green-700 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Start Adventure!
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Grid - Two Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Practice Park Card */}
          <button
            onClick={() => hasAssessment && setShowPracticePark(true)}
            disabled={!hasAssessment}
            className={`w-full ${!hasAssessment ? "pointer-events-none" : ""}`}
          >
            <Card className={`border-0 rounded-3xl shadow-xl transition-all hover:scale-105 ${hasAssessment
              ? "bg-gradient-to-br from-blue-500 to-blue-600"
              : "bg-gray-400/90 backdrop-blur-sm"
              }`}>
              <CardContent className="p-6 text-center relative">
                {!hasAssessment && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-6 h-6 text-white/80" />
                  </div>
                )}
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-white font-bold text-lg mb-1">
                  Practice Park
                </h3>
                <p className="text-white/90 text-xs">
                  {hasAssessment ? "Keep practicing!" : "Complete adventure first"}
                </p>
              </CardContent>
            </Card>
          </button>

          {/* Trophy Chest Card */}
          <Link href="/quantum-chest">
            <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-yellow-500 to-yellow-600 transition-all hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">
                  <Trophy className="w-12 h-12 mx-auto text-white drop-shadow-lg" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  Trophy Chest
                </h3>
                <p className="text-white/90 text-xs">
                  {profile.progress}% Complete
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Practice Park Modal */}
      <AnimatePresence>
        {showPracticePark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPracticePark(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-gray-800">
                    <BookOpen className="text-blue-600" />
                    خطة التدريب
                  </h2>

                  {diagnosedLetters.length === 0 ? (
                    <div className="text-center py-8 bg-green-100 rounded-xl mb-4">
                      <p className="text-5xl mb-3">🌟</p>
                      <p className="text-xl font-bold text-green-800 mb-2">لفظك ممتاز!</p>
                      <p className="text-sm text-green-700">ما عندك أحرف بدها تدريب حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      <p className="text-gray-600 text-center text-lg mb-4">لاحظنا شوية صعوبة في هاي الأحرف:</p>
                      {diagnosedLetters.map((issue) => {
                        const letterData = TRAINING_PLAN[issue as keyof typeof TRAINING_PLAN]
                        const colorClass = issue === "KAF" ? "bg-orange-500" : issue === "SIN" ? "bg-blue-500" : "bg-green-500"
                        const borderClass = issue === "KAF" ? "border-orange-500" : issue === "SIN" ? "border-blue-500" : "border-green-500"

                        return (
                          <div key={issue} className={`bg-white border-r-4 ${borderClass} p-5 rounded-lg shadow-md`} dir="rtl">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 text-right">
                                <h3 className="font-bold text-xl text-gray-800 mb-2">
                                  {letterData?.title || issue}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {letterData?.desc || "تمارين لتحسين النطق."}
                                </p>
                              </div>
                              <Link href={`/training/${issue.toLowerCase()}`}>
                                <Button
                                  className={`${colorClass} hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105`}
                                >
                                  ابدأ التدريب
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={() => setShowPracticePark(false)} variant="outline" className="w-full h-12 text-lg font-bold rounded-xl border-2">
                      إغلاق
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}