"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, TrendingUp, Award, Target, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Profile, PracticeSession } from "@/lib/types"
import { motion } from "framer-motion"

interface TrainingSession {
    id: string
    user_id: string
    letter: string
    duration_seconds: number
    words_practiced: number
    correct_count: number
    total_attempts: number
    score: number
    results: Array<{ word: string; isCorrect: boolean; attempts: number }>
    created_at: string
}

interface ProgressContentProps {
    profile: Profile
    trainingSessions: TrainingSession[]
    practiceSessions: PracticeSession[]
}

const LETTER_COLORS = {
    KAF: { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
    SIN: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
    RA: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
}

export function ProgressContent({ profile, trainingSessions, practiceSessions }: ProgressContentProps) {
    const router = useRouter()
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

    // Calculate overall statistics
    const totalSessions = trainingSessions.length
    const averageScore = totalSessions > 0
        ? Math.round(trainingSessions.reduce((sum, s) => sum + s.score, 0) / totalSessions)
        : 0
    const totalPracticeTime = trainingSessions.reduce((sum, s) => sum + s.duration_seconds, 0)
    const totalWords = trainingSessions.reduce((sum, s) => sum + s.words_practiced, 0)

    // Group sessions by letter
    const sessionsByLetter = trainingSessions.reduce((acc, session) => {
        if (!acc[session.letter]) {
            acc[session.letter] = []
        }
        acc[session.letter].push(session)
        return acc
    }, {} as Record<string, TrainingSession[]>)

    // Calculate letter-specific stats
    const letterStats = Object.entries(sessionsByLetter).map(([letter, sessions]) => {
        const avgScore = Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
        const totalAttempts = sessions.reduce((sum, s) => sum + s.total_attempts, 0)
        const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_count, 0)
        const accuracy = Math.round((totalCorrect / totalAttempts) * 100)

        return {
            letter,
            sessions: sessions.length,
            avgScore,
            accuracy,
            lastPracticed: sessions[0].created_at,
        }
    })

    // Filter sessions if a letter is selected
    const filteredSessions = selectedLetter
        ? trainingSessions.filter(s => s.letter === selectedLetter)
        : trainingSessions

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <main className="relative min-h-screen w-full overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/images/rainforest.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-4xl mx-auto p-4 sm:p-6 pt-safe">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                        تقرير التقدم
                    </h1>
                    <div className="w-11" /> {/* Spacer */}
                </header>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <p className="text-2xl font-bold text-gray-800">{totalSessions}</p>
                            <p className="text-xs text-gray-600">جلسات</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                            <p className="text-2xl font-bold text-gray-800">{averageScore}%</p>
                            <p className="text-xs text-gray-600">متوسط النتيجة</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <p className="text-2xl font-bold text-gray-800">{Math.floor(totalPracticeTime / 60)}</p>
                            <p className="text-xs text-gray-600">دقائق</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <p className="text-2xl font-bold text-gray-800">{totalWords}</p>
                            <p className="text-xs text-gray-600">كلمات</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Letter Performance */}
                {letterStats.length > 0 && (
                    <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-3xl mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800 text-right" dir="rtl">
                                الأداء حسب الحرف
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {letterStats.map((stat) => {
                                const colors = LETTER_COLORS[stat.letter as keyof typeof LETTER_COLORS]
                                const isSelected = selectedLetter === stat.letter

                                return (
                                    <motion.button
                                        key={stat.letter}
                                        onClick={() => setSelectedLetter(isSelected ? null : stat.letter)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full p-4 rounded-xl transition-all ${isSelected ? colors.light + ' ring-2 ring-offset-2 ' + colors.bg.replace('bg-', 'ring-') : colors.light
                                            }`}
                                    >
                                        <div className="flex items-center justify-between" dir="rtl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-lg">
                                                        {stat.letter === 'KAF' ? 'ك' : stat.letter === 'SIN' ? 'س' : 'ر'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800">
                                                        {stat.letter === 'KAF' ? 'حرف الكاف' : stat.letter === 'SIN' ? 'حرف السين' : 'حرف الراء'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {stat.sessions} جلسة • دقة {stat.accuracy}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-3xl font-bold ${colors.text}`}>{stat.avgScore}%</p>
                                            </div>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Session History */}
                <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-3xl mb-6 flex-1">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 text-right flex items-center justify-between" dir="rtl">
                            <span>سجل الجلسات</span>
                            {selectedLetter && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLetter(null)}
                                    className="text-sm"
                                >
                                    عرض الكل
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                        {filteredSessions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>لا توجد جلسات بعد</p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => {
                                const colors = LETTER_COLORS[session.letter as keyof typeof LETTER_COLORS]

                                return (
                                    <div
                                        key={session.id}
                                        className={`p-4 rounded-xl ${colors.light} border-r-4 ${colors.bg.replace('bg-', 'border-')}`}
                                        dir="rtl"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-sm">
                                                        {session.letter === 'KAF' ? 'ك' : session.letter === 'SIN' ? 'س' : 'ر'}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-gray-800">
                                                    {session.letter === 'KAF' ? 'الكاف' : session.letter === 'SIN' ? 'السين' : 'الراء'}
                                                </span>
                                            </div>
                                            <span className={`text-2xl font-bold ${colors.text}`}>
                                                {session.score}%
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                <span>{session.correct_count}/{session.words_practiced}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDuration(session.duration_seconds)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-xs">{formatDate(session.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Word Results */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {session.results.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`px-2 py-1 rounded-lg text-xs font-medium ${result.isCorrect
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                        }`}
                                                >
                                                    {result.word} {result.isCorrect ? '✓' : `(${result.attempts})`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
