"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Mic, MicOff, ArrowLeft, Volume2, CheckCircle2, Loader2, PlayCircle, Map, BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

// --- IMPORT THE BRAIN ---
import { analyzeSpeech } from "@/app/actions/analyze-speech"
import { savePracticeSession } from "@/app/actions/save-session"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Profile } from "@/lib/types"

type Stage = "intro" | "watch" | "dog" | "feather" | "completion"

// --- PATH TO YOUR TRY AGAIN SOUND ---
const TRY_AGAIN_AUDIO = "/sounds/tryAgain.m4a"

// --- CONFIG WITH YOUR M4A FILES ---
const STAGE_CONFIG = {
  intro: {
    word: "كنز",
    message: "مرحبا يا بطل! جاهز للمغامرة؟ بدنا ندور على الكنز المفقود. يلا بصوت عالي نحكي 'كنز'!",
    imageKey: "treasure",
    audio: "/sounds/intro.m4a" // Your file
  },
  watch: {
    word: "ساعة",
    message: "يا سلام! شو لقينا هون؟ هاي ساعة عجيبة! بتعرف تحكي 'ساعة'؟",
    imageKey: "watch",
    audio: "/sounds/watch.m4a" // Your file
  },
  dog: {
    word: "كلب",
    message: "شوف هاد الكلب الحلو! شكلو بدو يلعب معنا. يلا ناديه وقول 'كلب'!",
    imageKey: "dog",
    audio: "/sounds/dog.m4a" // Your file
  },
  feather: {
    word: "ريشة",
    message: "ياي! لقينا ريشة ناعمة كثير. لونها بجنن! جرب احكي 'ريشة'!",
    imageKey: "feather",
    audio: "/sounds/feather.m4a" // Your file
  },
} as const

// --- TRAINING PLAN DATA ---
const TRAINING_PLAN = {
  KAF: { title: "حرف الكاف (ك)", desc: "تمارين لتقوية مخرج الكاف والتمييز بينه وبين التاء." },
  RA: { title: "حرف الراء (ر)", desc: "تدريبات اللسان لنطق الراء بشكل صحيح بدلاً من اللام." },
  SIN: { title: "حرف السين (س)", desc: "تمارين للتمييز بين السين والثاء (الصفير)." },
}

const getTutorAssets = (tutor: "tutorA" | "tutorB") => {
  const isAws = tutor === "tutorA"
  return {
    treasure: isAws ? "/images/treasureAws.png" : "/images/treasureJoud.png",
    watch: isAws ? "/images/watchAws.png" : "/images/watchJoud.png",
    dog: isAws ? "/images/dogWithAws.png" : "/images/dogWithJoud.png",
    feather: isAws ? "/images/featherAws.png" : "/images/featherJoud.png",
  }
}

interface AdventureEngineProps {
  profile: Profile
}

export function AdventureEngine({ profile }: AdventureEngineProps) {
  const router = useRouter()
  const tutorAssets = getTutorAssets(profile.selected_tutor)

  // State
  const [currentStage, setCurrentStage] = useState<Stage>("intro")
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Diagnostic State
  const [attempts, setAttempts] = useState(0)
  const [diagnosedLetters, setDiagnosedLetters] = useState<Set<string>>(new Set())
  const [showPlan, setShowPlan] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const stageOrder: Stage[] = ["intro", "watch", "dog", "feather", "completion"]
  const currentStageIndex = stageOrder.indexOf(currentStage)
  const progress = ((currentStageIndex + 1) / stageOrder.length) * 100

  // --- HELPER: PLAY AUDIO (FILE OR TTS) ---
  const playAudio = (textOrPath: string) => {
    // 1. Check if it's a file path (starts with /)
    if (textOrPath.startsWith("/")) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
        audioPlayerRef.current.currentTime = 0
      }
      const audio = new Audio(textOrPath)
      audioPlayerRef.current = audio
      audio.play().catch((err) => {
        console.error("Audio play failed", err)
        // Fallback to TTS if file fails
        speakText(STAGE_CONFIG[currentStage as keyof typeof STAGE_CONFIG].message)
      })
    } else {
      // 2. Use TTS (Fallback)
      speakText(textOrPath)
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ar-SA"
      utterance.rate = 0.9
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
    }
  }

  // --- AUTO-SPEAK ON STAGE CHANGE ---
  useEffect(() => {
    if (currentStage !== "completion") {
      setAttempts(0)
      const timer = setTimeout(() => {
        playAudio(STAGE_CONFIG[currentStage].audio)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [currentStage])

  // --- AUTO-SAVE SESSION ON COMPLETION ---
  useEffect(() => {
    if (currentStage === "completion") {
      // Convert Set to Array and save to database
      const letters = Array.from(diagnosedLetters)
      savePracticeSession(letters)
        .then(res => {
          if (res.success) {
            console.log("✅ Session saved successfully")
          } else {
            console.error("❌ Failed to save session:", res.error)
          }
        })
        .catch(err => console.error("❌ Save error:", err))
    }
  }, [currentStage, diagnosedLetters])

  // --- RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      alert("Please allow microphone access.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // --- SUBMIT & DIAGNOSE LOGIC ---
  const handleSuccess = async () => {
    if (!audioUrl) return
    setIsProcessing(true)

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const file = new File([blob], "recording.webm", { type: "audio/webm" })

      const formData = new FormData()
      formData.append("audio", file)
      const targetWord = STAGE_CONFIG[currentStage as keyof typeof STAGE_CONFIG]?.word || "Treasure"
      formData.append("targetWord", targetWord)

      const result = await analyzeSpeech(formData)
      setIsProcessing(false)

      if (result.success) {
        if (result.isCorrect) {
          // --- PERFECT MATCH ---
          winStage(true)
        } else {
          // --- MISTAKE DETECTED ---
          const newAttempts = attempts + 1
          setAttempts(newAttempts)

          if (result.detectedIssue) {
            if (newAttempts < 2) {
              // Attempt 1: Play "Try Again" Sound
              playAudio(TRY_AGAIN_AUDIO)
              // Show beautiful notification
              setShowNotification(true)
              setTimeout(() => setShowNotification(false), 3000)
              setAudioUrl(null)
            } else {
              // Attempt 2: Record Issue and Move On
              const issueCode = result.detectedIssue as string
              setDiagnosedLetters(prev => new Set(prev).add(issueCode))

              // We can play a generic "Good effort" sound here, or just move on
              // For now, let's treat it as a pass so they don't get stuck
              winStage(false)
            }
          } else {
            // General error -> Play "Try Again" Sound
            playAudio(TRY_AGAIN_AUDIO)
            setAudioUrl(null)
          }
        }
      } else {
        alert("Server Error")
      }
    } catch (err) {
      setIsProcessing(false)
      alert("Something went wrong.")
    }
  }

  const winStage = (perfect = true) => {
    setShowConfetti(true)
    setAudioUrl(null)
    if (perfect) {
      // You can add a success.m4a here later if you want
      // playAudio("/sounds/success.m4a") 
    }

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#fbbf24', '#ffffff']
    })

    setTimeout(() => {
      setShowConfetti(false)
      const nextIndex = currentStageIndex + 1
      if (nextIndex < stageOrder.length) {
        setCurrentStage(stageOrder[nextIndex])
      }
    }, 2500)
  }

  const handleTryAgain = () => {
    setAudioUrl(null)
  }

  // --- RENDER: COMPLETION ---
  if (currentStage === "completion") {
    return (
      <main className="relative min-h-screen w-full overflow-hidden">
        <div className="fixed inset-0 z-0">
          <Image src="/images/rainforest.png" alt="Rainforest" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.8 }} className="w-full">

            {!showPlan ? (
              // 1. STANDARD COMPLETION CARD
              <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 sm:p-12 text-center">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl mb-6">
                    🏆
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">خلصنا المغامرة!</h2>
                  <p className="text-xl text-gray-700 mb-8">أنت بطل رائع يا {profile.child_name}! 🎉</p>

                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowPlan(true)}
                      className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl bg-blue-600 hover:bg-blue-700"
                    >
                      <Map className="mr-2" /> Practice Park
                    </Button>

                    <Link href="/dashboard">
                      <Button size="lg" variant="outline" className="w-full h-16 text-xl font-bold rounded-2xl border-2">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // 2. PRACTICE PARK CARD
              <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2 text-gray-800">
                    <BookOpen className="text-blue-600" />
                    خطة التدريب
                  </h2>

                  {diagnosedLetters.size === 0 ? (
                    <div className="text-center py-6 bg-green-100 rounded-xl mb-4">
                      <p className="text-4xl mb-2">🌟</p>
                      <p className="font-bold text-green-800">لفظك ممتاز!</p>
                      <p className="text-sm text-green-700">ما عندك أحرف بدها تدريب حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      <p className="text-gray-600 text-center">لاحظنا شوية صعوبة في هاي الأحرف:</p>
                      {[...diagnosedLetters].map(issue => (
                        <div key={issue} className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg text-right" dir="rtl">
                          <h3 className="font-bold text-lg text-gray-800">
                            {TRAINING_PLAN[issue as keyof typeof TRAINING_PLAN]?.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {TRAINING_PLAN[issue as keyof typeof TRAINING_PLAN]?.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={() => setShowPlan(false)} variant="ghost" className="w-full">
                    إغلاق
                  </Button>
                </CardContent>
              </Card>
            )}

          </motion.div>
        </div>
      </main>
    )
  }

  // --- RENDER: GAMEPLAY ---
  const config = STAGE_CONFIG[currentStage]
  const currentImage = tutorAssets[config.imageKey as keyof typeof tutorAssets]

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Image src="/images/rainforest.png" alt="bg" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {showConfetti && <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center" />}

      {/* Beautiful Notification Modal */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <Card className="border-0 bg-gradient-to-br from-orange-500/95 to-amber-500/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-3">🎯</div>
                  <p className="text-2xl font-black text-white drop-shadow-lg" dir="rtl">
                    ممكن تعيدها كمان مرة؟
                  </p>
                  <p className="text-xl font-bold text-white/90 mt-2" dir="rtl">
                    ركز على الحرف!
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pt-safe">
        <header className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full w-11 h-11 bg-white/90 shadow-lg">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <div className="flex-1 mx-4">
            <div className="h-4 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden">
              <motion.div className="h-full bg-green-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
            <p className="text-sm font-bold text-gray-800">{currentStageIndex + 1}/{stageOrder.length}</p>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-full"
            >

              {/* Message Card */}
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
                <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-3xl relative overflow-hidden">
                  <CardContent className="p-6 text-center flex items-center justify-center gap-4">
                    <p className="text-lg sm:text-xl font-bold text-gray-800">{config.message}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 shrink-0"
                      onClick={() => playAudio(config.audio)}
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Image */}
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
                <Card className="border-0 bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 sm:p-12">
                    <div className="relative w-full aspect-square max-w-md mx-auto">
                      <Image src={currentImage} alt={config.word} fill className="object-contain drop-shadow-xl" />
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-primary/10 hover:bg-primary/20" onClick={() => playAudio(config.word)}>
                        <PlayCircle className="w-8 h-8 text-primary" />
                      </Button>
                      <h2 className="text-5xl font-black text-gray-800">{config.word}</h2>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recorder */}
              {!audioUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.div whileTap={{ scale: 0.95 }} className="relative">
                    {isRecording && (
                      <motion.div className="absolute inset-0 rounded-full bg-red-500/30" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                    )}
                    <Button
                      size="lg"
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl transition-all border-4 ${isRecording
                        ? "bg-red-500 hover:bg-red-600 border-red-200 animate-pulse"
                        : "bg-green-500 hover:bg-green-600 border-green-200"
                        }`}
                      onClick={(e) => {
                        e.preventDefault()
                        if (isRecording) stopRecording()
                        else startRecording()
                      }}
                    >
                      {isRecording ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                    </Button>
                  </motion.div>
                  <p className="text-white font-bold text-lg drop-shadow-lg">{isRecording ? "Listening..." : "Tap to Speak"}</p>
                </div>
              ) : (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-center gap-2">
                    <Volume2 className="text-slate-400" />
                    <audio src={audioUrl} controls className="h-8 w-full max-w-[200px]" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleTryAgain} variant="outline" className="flex-1 h-14 text-lg font-bold rounded-xl border-2">
                      Retry
                    </Button>
                    <Button
                      onClick={handleSuccess}
                      disabled={isProcessing}
                      className="flex-1 h-14 text-lg font-bold bg-green-500 hover:bg-green-600 rounded-xl shadow-lg transition-all"
                    >
                      {isProcessing ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Thinking...</>
                      ) : (
                        <><CheckCircle2 className="mr-2" /> Send</>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}