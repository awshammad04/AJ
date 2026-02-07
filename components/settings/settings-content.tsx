"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TUTORS, type Profile, type Tutor, type Schedule } from "@/lib/types"
import { ArrowLeft, Check, Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface SettingsContentProps {
  profile: Profile
  problemLetters: string[]
}

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const

export function SettingsContent({ profile, problemLetters }: SettingsContentProps) {
  const router = useRouter()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const [parentName, setParentName] = useState(profile.parent_name)
  const [childName, setChildName] = useState(profile.child_name)
  const [selectedTutor, setSelectedTutor] = useState<Tutor>(profile.selected_tutor)
  const [examDate, setExamDate] = useState(profile.exam_date || "")
  const [schedule, setSchedule] = useState<Schedule>(profile.schedule)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleDay = (day: keyof Schedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: !prev[day],
    }))
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - in production, this should be hashed and stored securely
    // For now, we'll use the parent's name as password (you can change this logic)
    if (password === profile.parent_name || password === "parent123") {
      setIsUnlocked(true)
      setPasswordError("")
    } else {
      setPasswordError("Incorrect password. Try your parent's name.")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        parent_name: parentName,
        child_name: childName,
        selected_tutor: selectedTutor,
        exam_date: examDate || null,
        schedule,
      })
      .eq("id", profile.id)

    setLoading(false)

    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      router.refresh()
    }
  }

  // Password Lock Screen
  if (!isUnlocked) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 z-0 bg-background" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto p-4 sm:p-6">
          <Card className="w-full border-0 shadow-2xl rounded-3xl bg-card">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Parent Settings</h2>
              <p className="text-muted-foreground mb-6">
                Enter password to access settings
              </p>

              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-14 rounded-xl text-base pr-12"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl text-lg font-bold"
                >
                  Unlock Settings
                </Button>
              </form>

              <Link href="/dashboard" className="block mt-6">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground mt-6">
                Hint: Try your parent's name or "parent123"
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Settings Content (Unlocked)
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pb-safe">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6 pt-safe">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 sm:w-11 sm:h-11">
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back to dashboard</span>
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Parent Settings</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUnlocked(false)}
            className="ml-auto text-muted-foreground"
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock
          </Button>
        </header>

        <form onSubmit={handleSave} className="flex flex-col gap-5 sm:gap-6">
          {/* Problem Letters Section */}
          {problemLetters.length > 0 && (
            <Card className="border-2 border-orange-500/50 shadow-lg rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Letters to Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-sm text-muted-foreground mb-4">
                  Based on the assessment, {profile.child_name} needs practice with these letters:
                </p>
                <div className="flex flex-wrap gap-3">
                  {problemLetters.map((letter) => (
                    <div
                      key={letter}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg"
                    >
                      {letter.toUpperCase()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Info */}
          <Card className="border-0 shadow-md rounded-3xl">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="parentName" className="text-sm sm:text-base">Parent's Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="h-12 sm:h-14 rounded-xl w-full text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="childName" className="text-sm sm:text-base">Child's Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="h-12 sm:h-14 rounded-xl w-full text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tutor Selection */}
          <Card className="border-0 shadow-md rounded-3xl">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-lg sm:text-xl">Select Tutor</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-col gap-3">
                {Object.values(TUTORS).map((tutor) => (
                  <button
                    key={tutor.id}
                    type="button"
                    onClick={() => setSelectedTutor(tutor.id as Tutor)}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex items-center gap-4 w-full ${selectedTutor === tutor.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 bg-card"
                      }`}
                  >
                    {selectedTutor === tutor.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0">
                      <Image
                        src={tutor.images.base || "/placeholder.svg"}
                        alt={`Tutor ${tutor.name}`}
                        fill
                        className="object-contain rounded-full"
                      />
                    </div>
                    <p className="font-medium text-base sm:text-lg">{tutor.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="border-0 shadow-md rounded-3xl">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-lg sm:text-xl">Practice Schedule</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="examDate" className="text-sm sm:text-base">Exam Date (Optional)</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="h-12 sm:h-14 rounded-xl w-full text-base"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm sm:text-base">Practice Days</Label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {DAYS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleDay(key)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-medium text-sm sm:text-base transition-all ${schedule[key]
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button type="submit" className="w-full h-14 sm:h-16 rounded-xl text-lg sm:text-xl" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}