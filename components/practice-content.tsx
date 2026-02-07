"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TutorMascot } from "@/components/tutor-mascot"
import { TUTORS, type Profile } from "@/lib/types"
import { ArrowLeft, Volume2, Mic, MicOff, Check, RotateCcw, ChevronRight } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

interface PracticeContentProps {
  profile: Profile
  userId: string
}

// Sample practice words - in a real app, these would come from a database
const PRACTICE_WORDS = [
  { word: "Apple", phonetic: "AP-uhl" },
  { word: "Banana", phonetic: "buh-NAN-uh" },
  { word: "Elephant", phonetic: "EL-uh-fuhnt" },
  { word: "Butterfly", phonetic: "BUHT-er-fly" },
  { word: "Rainbow", phonetic: "RAYN-boh" },
  { word: "Chocolate", phonetic: "CHOK-lit" },
  { word: "Dinosaur", phonetic: "DY-nuh-sor" },
  { word: "Umbrella", phonetic: "uhm-BREL-uh" },
]

type TutorMood = "idle" | "success" | "tryAgain"

export function PracticeContent({ profile, userId }: PracticeContentProps) {
  const router = useRouter()
  const tutor = TUTORS[profile.selected_tutor]

  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [tutorMood, setTutorMood] = useState<TutorMood>("idle")
  const [attempts, setAttempts] = useState<{ word: string; correct: boolean }[]>([])
  const [sessionStartTime] = useState(Date.now())
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording } = useAudioRecorder()

  const currentWord = PRACTICE_WORDS[currentWordIndex]
  const correctCount = attempts.filter((a) => a.correct).length

  const speakWord = useCallback(() => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.rate = 0.8
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
    }
  }, [currentWord.word])

  const handleCorrect = () => {
    setTutorMood("success")
    setAttempts((prev) => [...prev, { word: currentWord.word, correct: true }])
    clearRecording()
  }

  const handleAnimationEnd = () => {
    if (tutorMood === "success") {
      if (currentWordIndex < PRACTICE_WORDS.length - 1) {
        setCurrentWordIndex((prev) => prev + 1)
      } else {
        setIsComplete(true)
      }
    }
    setTutorMood("idle")
  }

  const handleTryAgain = () => {
    setTutorMood("tryAgain")
    setAttempts((prev) => [...prev, { word: currentWord.word, correct: false }])
    clearRecording()
  }

  const handleSkip = () => {
    clearRecording()
    if (currentWordIndex < PRACTICE_WORDS.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
      setTutorMood("idle")
    } else {
      setIsComplete(true)
    }
  }

  const saveSession = async () => {
    setIsSaving(true)
    const supabase = getSupabaseBrowserClient()

    const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)
    const totalAttempts = attempts.length
    const score = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

    // Create practice session
    const { data: session, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: userId,
        duration_seconds: durationSeconds,
        words_practiced: PRACTICE_WORDS.length,
        correct_count: correctCount,
        total_attempts: totalAttempts,
        score,
      })
      .select()
      .single()

    if (!error && session) {
      // Save word attempts
      const wordAttempts = attempts.map((attempt) => ({
        session_id: session.id,
        word: attempt.word,
        is_correct: attempt.correct,
      }))

      await supabase.from("word_attempts").insert(wordAttempts)

      // Update profile progress
      const newProgress = Math.min(100, profile.progress + Math.floor(score / 10))
      await supabase.from("profiles").update({ progress: newProgress }).eq("id", userId)
    }

    setIsSaving(false)
    router.push("/dashboard")
    router.refresh()
  }

  const getTutorMessage = () => {
    switch (tutorMood) {
      case "success":
        return "Great job! That was perfect!"
      case "tryAgain":
        return "Almost! Let's try that again."
      default:
        return `Say "${currentWord.word}" out loud!`
    }
  }

  // Session Complete Screen
  if (isComplete) {
    const totalAttempts = attempts.length
    const score = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

    return (
      <main className="flex flex-col items-center justify-center p-4 sm:p-6 min-h-screen w-full max-w-2xl mx-auto">
        <Card className="w-full border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8 text-center flex flex-col gap-6 items-center">
            <TutorMascot tutorId={profile.selected_tutor} mood="success" size="lg" />

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                {tutor.name} says: &quot;Amazing work, {profile.child_name}!&quot;
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="p-4 sm:p-5 rounded-xl bg-muted/50">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{PRACTICE_WORDS.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Words</p>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-muted/50">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{correctCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Correct</p>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-muted/50">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{score}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Score</p>
              </div>
            </div>

            <Button onClick={saveSession} className="w-full h-14 sm:h-16 rounded-xl text-lg sm:text-xl" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pt-safe">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 sm:w-11 sm:h-11">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back to dashboard</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-medium">
            {currentWordIndex + 1} / {PRACTICE_WORDS.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground text-sm sm:text-base">
          Skip
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / PRACTICE_WORDS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <TutorMascot
          tutorId={profile.selected_tutor}
          mood={tutorMood}
          size="lg"
          className="mb-4"
          onAnimationEnd={handleAnimationEnd}
        />

        <p className="text-center text-muted-foreground mb-6 min-h-[48px] text-base sm:text-lg px-4">{getTutorMessage()}</p>

        <Card className="w-full border-0 shadow-lg mb-6">
          <CardContent className="p-6 sm:p-8 text-center">
            <Button variant="ghost" size="icon" className="mb-4 w-12 h-12 sm:w-14 sm:h-14" onClick={speakWord}>
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              <span className="sr-only">Listen to word</span>
            </Button>
            <h2 className="text-4xl sm:text-5xl font-bold mb-2">{currentWord.word}</h2>
            <p className="text-muted-foreground text-base sm:text-lg">{currentWord.phonetic}</p>
          </CardContent>
        </Card>

        {audioUrl && (
          <div className="w-full mb-6">
            <Card className="border-0 shadow-md bg-muted/30">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3 text-center">Your recording:</p>
                <audio src={audioUrl} controls className="w-full h-10" />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            size="lg"
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg transition-all ${isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""
              }`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <MicOff className="w-8 h-8 sm:w-10 sm:h-10" /> : <Mic className="w-8 h-8 sm:w-10 sm:h-10" />}
            <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
          </Button>
          <p className="text-sm sm:text-base text-muted-foreground">{isRecording ? "Recording... Tap to stop" : "Tap to record"}</p>
        </div>

        {audioUrl && (
          <div className="flex gap-3 sm:gap-4 mt-6 w-full">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-xl h-14 sm:h-16 bg-transparent text-base sm:text-lg"
              onClick={handleTryAgain}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button size="lg" className="flex-1 rounded-xl h-14 sm:h-16 text-base sm:text-lg" onClick={handleCorrect}>
              <Check className="w-5 h-5 mr-2" />
              Got It!
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
