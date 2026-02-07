"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Volume2, Mic, MicOff, CheckCircle2, PlayCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TRAINING_MODULES, getTutorImage } from "@/lib/training-data"
import type { Profile } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

// --- IMPORT THE BRAIN ---
import { analyzeSpeech } from "@/app/actions/analyze-speech"
import { saveTrainingSession } from "@/app/actions/save-training-session"

interface TrainingContentProps {
    letter: "kaf" | "sin" | "ra"
    profile: Profile
    userId: string
}

type Stage = "intro" | "training" | "complete"

// --- TRY AGAIN SOUND ---
const TRY_AGAIN_AUDIO = "/sounds/tryAgain.m4a"

export function TrainingContent({ letter, profile, userId }: TrainingContentProps) {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const startTimeRef = useRef<number>(Date.now())

    // Get training module data
    const moduleKey = letter.toUpperCase() as keyof typeof TRAINING_MODULES
    const module = TRAINING_MODULES[moduleKey]

    // State
    const [stage, setStage] = useState<Stage>("intro")
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [completedWords, setCompletedWords] = useState<boolean[]>(new Array(module.stages.length).fill(false))
    const [wordAttempts, setWordAttempts] = useState<number[]>(new Array(module.stages.length).fill(0))
    const [trainingResults, setTrainingResults] = useState<Array<{ word: string, isCorrect: boolean, attempts: number }>>([])

    const currentWord = module.stages[currentWordIndex]
    const progress = ((completedWords.filter(Boolean).length) / module.stages.length) * 100

    // Get tutor image
    const tutorImage = profile.selected_tutor === "tutorA"
        ? "/images/charss.png"
        : "/images/charss.png"

    // Play audio
    const playAudio = (audioPath: string) => {
        if (audioRef.current) {
            audioRef.current.pause()
        }

        const audio = new Audio(audioPath)
        audioRef.current = audio

        setIsPlaying(true)
        audio.play()

        audio.onended = () => {
            setIsPlaying(false)
        }

        audio.onerror = () => {
            setIsPlaying(false)
            console.error("Error playing audio:", audioPath)
        }
    }

    // Start training from intro
    const handleStartTraining = () => {
        setStage("training")
    }

    // Play intro audio on mount
    useEffect(() => {
        if (stage === "intro") {
            // Small delay before playing intro
            const timer = setTimeout(() => {
                playAudio(module.introAudio)
            }, 800)

            return () => clearTimeout(timer)
        }
    }, [stage, module.introAudio])

    // Auto-play word audio when training stage starts or word changes
    useEffect(() => {
        if (stage === "training" && currentWord) {
            // Small delay before playing word audio
            const timer = setTimeout(() => {
                playAudio(currentWord.audio)
            }, 800)

            return () => clearTimeout(timer)
        }
    }, [stage, currentWordIndex, currentWord])

    // Handle word audio
    const handlePlayWord = () => {
        if (currentWord && !isPlaying) {
            playAudio(currentWord.audio)
        }
    }

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

    // --- SUBMIT & ANALYZE SPEECH ---
    const handleSubmitRecording = async () => {
        if (!audioUrl) return
        setIsProcessing(true)

        try {
            const response = await fetch(audioUrl)
            const blob = await response.blob()
            const file = new File([blob], "recording.webm", { type: "audio/webm" })

            const formData = new FormData()
            formData.append("audio", file)
            formData.append("targetWord", currentWord.word)

            const result = await analyzeSpeech(formData)
            setIsProcessing(false)

            const currentAttempt = wordAttempts[currentWordIndex] + 1
            const newAttempts = [...wordAttempts]
            newAttempts[currentWordIndex] = currentAttempt
            setWordAttempts(newAttempts)

            if (result.success) {
                if (result.isCorrect) {
                    // --- PERFECT MATCH ---
                    handleWordSuccess(true, currentAttempt)
                } else {
                    // --- MISTAKE DETECTED ---
                    if (currentAttempt < 2) {
                        // Attempt 1: Play "Try Again" Sound
                        playAudio(TRY_AGAIN_AUDIO)
                        alert(` "".. ممكن تعيدها كمان مرة؟ ركز على الحرف!`)
                        setAudioUrl(null)
                    } else {
                        // Attempt 2: Move on (still count as completed for progress)
                        handleWordSuccess(false, currentAttempt)
                    }
                }
            } else {
                alert("Server Error")
                setAudioUrl(null)
            }
        } catch (err) {
            setIsProcessing(false)
            alert("Something went wrong.")
            setAudioUrl(null)
        }
    }

    const handleWordSuccess = (perfect: boolean, attempts: number) => {
        // Mark as completed
        const newCompleted = [...completedWords]
        newCompleted[currentWordIndex] = true
        setCompletedWords(newCompleted)

        // Store result
        const newResults = [...trainingResults]
        newResults.push({
            word: currentWord.word,
            isCorrect: perfect,
            attempts: attempts
        })
        setTrainingResults(newResults)

        // Play success sound and confetti
        if (perfect) {
            playAudio("/sounds/good_job.m4a")
        }

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [module.color.replace('bg-', '#')]
        })

        setAudioUrl(null)

        // Wait then move to next word or complete
        setTimeout(() => {
            if (currentWordIndex < module.stages.length - 1) {
                setCurrentWordIndex(prev => prev + 1)
            } else {
                // Save training session
                const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
                saveTrainingSession(letter, newResults, durationSeconds)
                    .then(res => {
                        if (res.success) {
                            console.log("✅ Training session saved")
                        } else {
                            console.error("❌ Failed to save training:", res.error)
                        }
                    })
                setStage("complete")
            }
        }, 2000)
    }

    const handleTryAgain = () => {
        setAudioUrl(null)
    }

    // Go back
    const handleBack = () => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        router.push("/dashboard")
    }

    // Finish and return to dashboard
    const handleFinish = () => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        router.push("/dashboard")
    }

    // Intro Stage
    if (stage === "intro") {
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
                <div className="relative z-10 flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pt-safe">
                    {/* Header */}
                    <header className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Button>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            className="w-full"
                        >
                            <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                                <CardContent className="p-8 sm:p-12 text-center">
                                    {/* Tutor Image */}
                                    <div className="relative w-40 h-40 mx-auto mb-6">
                                        <Image
                                            src={tutorImage}
                                            alt="Tutor"
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                        />
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4" dir="rtl">
                                        {module.title}
                                    </h1>

                                    <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-md mx-auto" dir="rtl">
                                        خلينا نتدرب على نطق هذا الحرف بطريقة صحيحة!
                                    </p>

                                    {/* Audio indicator */}
                                    {isPlaying && (
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <Volume2 className={`w-6 h-6 animate-pulse ${module.color.replace('bg-', 'text-')}`} />
                                            <p className={`font-bold ${module.color.replace('bg-', 'text-')}`}>استمع للتعليمات...</p>
                                        </div>
                                    )}

                                    {/* Start Button */}
                                    <Button
                                        onClick={handleStartTraining}
                                        disabled={isPlaying}
                                        size="lg"
                                        className={`w-full h-16 sm:h-18 text-xl sm:text-2xl font-bold rounded-2xl shadow-xl border-b-4 border-black/20 transition-all hover:scale-105 active:scale-95 ${module.color} hover:opacity-90 text-white`}
                                    >
                                        ابدأ التدريب! 🚀
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        )
    }

    // Training Stage
    if (stage === "training") {
        const isCompleted = completedWords[currentWordIndex]

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
                <div className="relative z-10 flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pt-safe">
                    {/* Header */}
                    <header className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Button>

                        {/* Progress Bar */}
                        <div className="flex-1 mx-4">
                            <div className="h-4 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${module.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                            <p className="text-sm font-bold text-gray-800">
                                {completedWords.filter(Boolean).length} / {module.stages.length}
                            </p>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentWordIndex}
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                className="w-full"
                            >
                                {/* Instruction Message */}
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-6"
                                >
                                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-3xl relative overflow-hidden">
                                        <CardContent className="p-6 text-center flex items-center justify-center gap-4">
                                            <p className="text-lg sm:text-xl font-bold text-gray-800" dir="rtl">
                                                {isRecording
                                                    ? "ممتاز! استمر..."
                                                    : isCompleted
                                                        ? "أحسنت! 🎉"
                                                        : "قل الكلمة بصوت واضح"}
                                            </p>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className={`rounded-full ${module.color.replace('bg-', 'bg-')}/10 hover:${module.color.replace('bg-', 'bg-')}/20 ${module.color.replace('bg-', 'text-')} shrink-0`}
                                                onClick={handlePlayWord}
                                                disabled={isPlaying || isRecording}
                                            >
                                                <Volume2 className="w-6 h-6" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Word Card */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-6"
                                >
                                    <Card className="border-0 bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden">
                                        <CardContent className="p-8 sm:p-12">
                                            {/* Word Image */}
                                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                                <Image
                                                    src={getTutorImage(currentWord.imageKey, profile.selected_tutor)}
                                                    alt={currentWord.word}
                                                    fill
                                                    className="object-contain drop-shadow-xl"
                                                />
                                            </div>

                                            {/* Word Text and Audio Button */}
                                            <div className="mt-6 flex items-center justify-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handlePlayWord}
                                                    disabled={isPlaying || isRecording}
                                                    className={`rounded-full w-12 h-12 ${module.color.replace('bg-', 'bg-')}/10 hover:${module.color.replace('bg-', 'bg-')}/20`}
                                                >
                                                    <PlayCircle className={`w-8 h-8 ${module.color.replace('bg-', 'text-')}`} />
                                                </Button>
                                                <h2 className="text-5xl font-black text-gray-800" dir="rtl">
                                                    {currentWord.word}
                                                </h2>
                                            </div>

                                            {/* Completed Checkmark */}
                                            {isCompleted && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-4 right-4"
                                                >
                                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Recording Section */}
                                {!audioUrl ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <motion.div whileTap={{ scale: 0.95 }} className="relative">
                                            {isRecording && (
                                                <motion.div
                                                    className={`absolute inset-0 rounded-full ${module.color}/30`}
                                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                />
                                            )}
                                            <Button
                                                size="lg"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (isRecording) stopRecording()
                                                    else startRecording()
                                                }}
                                                disabled={isCompleted}
                                                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl transition-all border-4 ${isRecording
                                                    ? `bg-red-500 hover:bg-red-600 border-red-200 animate-pulse`
                                                    : `${module.color} hover:opacity-90 border-white/30`
                                                    }`}
                                            >
                                                {isRecording ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                                            </Button>
                                        </motion.div>
                                        <p className="text-white font-bold text-lg drop-shadow-lg">
                                            {isRecording ? "Listening..." : "Tap to Speak"}
                                        </p>
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
                                                onClick={handleSubmitRecording}
                                                disabled={isProcessing}
                                                className={`flex-1 h-14 text-lg font-bold rounded-xl shadow-lg transition-all ${module.color} hover:opacity-90 text-white`}
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

    // Complete Stage
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
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="w-full"
                >
                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                        <CardContent className="p-8 sm:p-12 text-center">
                            {/* Trophy Animation */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-8xl mb-6"
                            >
                                🏆
                            </motion.div>

                            {/* Congratulations */}
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4" dir="rtl">
                                خلصنا التدريب!
                            </h2>

                            <p className="text-xl text-gray-700 mb-8" dir="rtl">
                                أنت بطل رائع يا {profile.child_name}! 🎉
                            </p>

                            <div className="space-y-4">
                                <Link href="/dashboard">
                                    <Button
                                        size="lg"
                                        className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl border-b-4 border-green-700 bg-green-600 hover:bg-green-700 active:border-b-0 active:translate-y-1 transition-all"
                                    >
                                        العودة للوحة التحكم
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    )
}
