"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { ArrowLeft, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type PrizeType = "LEGENDARY" | "COMMON"

interface QuantumPrize {
    type: PrizeType
    message: string
    reward?: string
}

export default function QuantumChestPage() {
    const router = useRouter()

    // State
    const [isChestOpen, setIsChestOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [prize, setPrize] = useState<QuantumPrize | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [canOpen, setCanOpen] = useState(true)

    // Sound effects
    const playSound = (soundPath: string) => {
        const audio = new Audio(soundPath)
        audio.play().catch(err => console.log("Audio play failed:", err))
    }

    // Legendary confetti effect
    const triggerLegendaryConfetti = () => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)

            // Gold and purple particles from multiple origins
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB', '#00CED1']
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB', '#00CED1']
            })
        }, 250)
    }

    // Common confetti effect
    const triggerCommonConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C0C0C0', '#A9A9A9', '#D3D3D3', '#B0C4DE']
        })
    }

    // Fetch prize from Quantum Server
    const openChest = async () => {
        if (!canOpen || isLoading) return

        setIsLoading(true)
        setError(null)
        setCanOpen(false)

        // Play chest opening sound
        playSound("/sounds/chest_open.mp3")

        try {
            const response = await fetch("http://localhost:5000/api/quantum-prize", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch prize from Quantum Server")
            }

            const data: QuantumPrize = await response.json()

            // Delay to sync with chest animation
            setTimeout(() => {
                setPrize(data)
                setIsChestOpen(true)
                setIsLoading(false)

                // Trigger effects based on prize type
                if (data.type === "LEGENDARY") {
                    playSound("/sounds/legendary.mp3")
                    triggerLegendaryConfetti()
                } else {
                    playSound("/sounds/common.mp3")
                    triggerCommonConfetti()
                }
            }, 1500)

        } catch (err) {
            setIsLoading(false)
            setError("⚠️ Quantum Server offline! Make sure your Python server is running on http://localhost:5000")
            setCanOpen(true)
            console.error("Quantum Server Error:", err)
        }
    }

    // Reset and try again
    const handleTryAgain = () => {
        setIsChestOpen(false)
        setPrize(null)
        setError(null)
        setCanOpen(true)
    }

    return (
        <main className="relative min-h-screen w-full overflow-hidden">

            {/* Space Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/images/space_bg.png"
                    alt="Space Background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
                {/* Animated stars overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20" />
            </div>

            {/* Floating particles effect */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-4xl mx-auto p-4 sm:p-6">

                {/* Header */}
                <header className="flex items-center justify-between mb-8 pt-safe">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard")}
                        className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 shadow-xl"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Button>

                    <motion.h1
                        className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        ⚛️ QUANTUM CHEST
                    </motion.h1>

                    <div className="w-12" /> {/* Spacer for centering */}
                </header>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center">

                    <AnimatePresence mode="wait">
                        {!prize && !error ? (
                            // Chest Closed State
                            <motion.div
                                key="chest-closed"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", duration: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                {/* Chest Image */}
                                <motion.div
                                    className="relative w-80 h-80 mb-8"
                                    animate={isLoading ? {
                                        scale: [1, 1.1, 1],
                                        rotateY: [0, 10, -10, 0],
                                    } : {
                                        y: [0, -10, 0],
                                    }}
                                    transition={isLoading ? {
                                        duration: 0.5,
                                        repeat: Infinity,
                                    } : {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Image
                                        src="/images/chest_closed.png"
                                        alt="Quantum Chest"
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                    />

                                    {/* Glowing aura */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-3xl"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.6, 0.3],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                    />
                                </motion.div>

                                {/* Open Button */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={openChest}
                                        disabled={!canOpen || isLoading}
                                        size="lg"
                                        className="relative h-16 px-12 text-2xl font-black rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white shadow-2xl border-4 border-white/30 overflow-hidden group"
                                    >
                                        {/* Shimmer effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{
                                                x: ['-100%', '200%'],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 1,
                                            }}
                                        />

                                        <span className="relative z-10 flex items-center gap-2">
                                            {isLoading ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Zap className="w-6 h-6" />
                                                    </motion.div>
                                                    Opening...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-6 h-6" />
                                                    OPEN CHEST
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                </motion.div>

                                {/* Instruction text */}
                                <motion.p
                                    className="mt-6 text-white/80 text-lg font-medium text-center max-w-md"
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Click to reveal your quantum prize...
                                </motion.p>
                            </motion.div>

                        ) : error ? (
                            // Error State
                            <motion.div
                                key="error"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-full max-w-lg"
                            >
                                <Card className="border-2 border-red-500/50 bg-red-950/80 backdrop-blur-xl shadow-2xl rounded-3xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="text-6xl mb-4">⚠️</div>
                                        <h2 className="text-2xl font-bold text-red-300 mb-4">Connection Failed</h2>
                                        <p className="text-red-200 mb-6">{error}</p>
                                        <Button
                                            onClick={handleTryAgain}
                                            className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                        >
                                            Try Again
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                        ) : prize && (
                            // Prize Reveal State
                            <motion.div
                                key="prize"
                                initial={{ scale: 0, rotateY: -180 }}
                                animate={{ scale: 1, rotateY: 0 }}
                                transition={{ type: "spring", duration: 1 }}
                                className="w-full max-w-2xl"
                            >
                                <Card className={`border-4 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ${prize.type === "LEGENDARY"
                                    ? "border-yellow-400 bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-purple-900/90"
                                    : "border-gray-400 bg-gradient-to-br from-gray-800/90 to-slate-900/90"
                                    }`}>
                                    <CardContent className="p-8 sm:p-12 text-center relative">

                                        {/* Legendary glow effect */}
                                        {prize.type === "LEGENDARY" && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-purple-500/20"
                                                animate={{
                                                    opacity: [0.3, 0.6, 0.3],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                            />
                                        )}

                                        {/* Trophy Image */}
                                        <motion.div
                                            className="relative w-48 h-48 mx-auto mb-6"
                                            animate={prize.type === "LEGENDARY" ? {
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0],
                                            } : {
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        >
                                            <Image
                                                src={prize.type === "LEGENDARY" ? "/images/trophy_gold.png" : "/images/trophy_silver.png"}
                                                alt={`${prize.type} Trophy`}
                                                fill
                                                className="object-contain drop-shadow-2xl"
                                            />
                                        </motion.div>

                                        {/* Prize Type Badge */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3, type: "spring" }}
                                            className={`inline-block px-6 py-2 rounded-full font-black text-xl mb-4 ${prize.type === "LEGENDARY"
                                                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900"
                                                : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800"
                                                }`}
                                        >
                                            {prize.type === "LEGENDARY" ? "⭐ LEGENDARY ⭐" : "✨ COMMON ✨"}
                                        </motion.div>

                                        {/* Prize Message */}
                                        <motion.h2
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className={`text-3xl sm:text-4xl font-bold mb-4 ${prize.type === "LEGENDARY" ? "text-yellow-200" : "text-gray-200"
                                                }`}
                                        >
                                            {prize.message}
                                        </motion.h2>

                                        {/* Reward (if any) */}
                                        {prize.reward && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.7 }}
                                                className={`text-xl mb-8 ${prize.type === "LEGENDARY" ? "text-yellow-100" : "text-gray-300"
                                                    }`}
                                            >
                                                {prize.reward}
                                            </motion.p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="relative z-50 flex flex-col sm:flex-row gap-4 mt-8">
                                            <Button
                                                onClick={handleTryAgain}
                                                className="flex-1 h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg"
                                            >
                                                Open Another Chest
                                            </Button>
                                            <Button
                                                onClick={() => router.push("/dashboard")}
                                                variant="outline"
                                                className="flex-1 h-14 text-lg font-bold border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                                            >
                                                Back to Dashboard
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

            </div>
        </main>
    )
}
