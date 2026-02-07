"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mic, Volume2, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Profile } from "@/lib/types"

// --- MOCK DATA FOR PRACTICE ---
const PRACTICE_WORDS = [
  { id: 1, word: "Apple", phonetic: "AP-uhl" },
  { id: 2, word: "Banana", phonetic: "buh-NAN-uh" },
  { id: 3, word: "Cat", phonetic: "kat" },
  { id: 4, word: "Dog", phonetic: "dawg" },
  { id: 5, word: "Elephant", phonetic: "EL-uh-funt" },
]

interface PracticeContentProps {
  profile: Profile
  userId: string
}

export function PracticeContent({ profile, userId }: PracticeContentProps) {
  const router = useRouter()

  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [feedback, setFeedback] = useState<"idle" | "listening" | "success">("idle")

  const currentWord = PRACTICE_WORDS[currentIndex]
  const progress = ((currentIndex + 1) / PRACTICE_WORDS.length) * 100

  // Determine Tutor Image
  const tutorImage = profile.selected_tutor === "tutorA"
    ? "/images/charss.png" // Placeholder for Aws
    : "/images/charss.png" // Placeholder for Joud

  // --- ACTIONS ---

  const handleBack = () => {
    // Confirm before leaving? For now just go back.
    router.push("/dashboard")
  }

  const handleSkip = () => {
    if (currentIndex < PRACTICE_WORDS.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      finishSession()
    }
  }

  const handleRecord = () => {
    if (isRecording) return

    // 1. Start Recording UI
    setIsRecording(true)
    setFeedback("listening")

    // 2. SIMULATE LISTENING (Wait 2 seconds)
    setTimeout(() => {
      setIsRecording(false)
      setFeedback("success")

      // 3. Auto-advance after success message (Wait 1.5 seconds)
      setTimeout(() => {
        setFeedback("idle")
        if (currentIndex < PRACTICE_WORDS.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          finishSession()
        }
      }, 1500)
    }, 2000)
  }

  const finishSession = () => {
    // Here you would save the session to Supabase
    alert("Great job! Session complete.")
    router.push("/dashboard")
  }

  // Play audio (Mock function)
  const playWordAudio = () => {
    // In a real app, use: new Audio('/path/to/apple.mp3').play()
    console.log(`Playing audio for: ${currentWord.word}`)
  }

  return (
    <main className="flex flex-col h-screen bg-[#F8FCFA] relative overflow-hidden font-sans">

      {/* --- HEADER --- */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 mx-4 max-w-[140px]">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2E8B57] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-400 mt-1">
            {currentIndex + 1} / {PRACTICE_WORDS.length}
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium"
        >
          Skip
        </Button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">

        {/* TUTOR SECTION */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-2">
            <Image
              src={tutorImage}
              alt="Tutor"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-gray-600 font-medium text-center">
            {feedback === "listening"
              ? "Listening..."
              : feedback === "success"
                ? "Perfect! ��"
                : `Say "${currentWord.word}" out loud!`}
          </p>
        </div>

        {/* WORD CARD */}
        <Card className="w-full max-w-xs bg-white rounded-[32px] shadow-xl border-0 p-8 flex flex-col items-center justify-center mb-10 min-h-[220px]">

          <button
            onClick={playWordAudio}
            className="mb-4 text-[#2E8B57] hover:bg-green-50 p-2 rounded-full transition-colors"
          >
            <Volume2 className="w-6 h-6" />
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {currentWord.word}
          </h1>

          <p className="text-gray-400 text-lg font-medium tracking-wide">
            {currentWord.phonetic}
          </p>

        </Card>

        {/* RECORDING BUTTON AREA */}
        <div className="flex flex-col items-center gap-3">

          <button
            onClick={handleRecord}
            disabled={isRecording || feedback === "success"}
            className={`
              relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
              ${feedback === "success" ? "bg-green-400 scale-110" : "bg-[#2E8B57] active:scale-95"}
              ${isRecording ? "ring-4 ring-green-200 animate-pulse" : ""}
            `}
          >
            {isRecording ? (
              // Recording State
              <div className="w-8 h-8 bg-white rounded-sm animate-pulse" />
            ) : (
              // Default Mic Icon
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          <p className="text-sm text-gray-500 font-medium">
            {isRecording ? "Recording..." : "Tap to record"}
          </p>

        </div>

      </div>

    </main>
  )
}