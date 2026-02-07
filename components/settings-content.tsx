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
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface SettingsContentProps {
  profile: Profile
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

export function SettingsContent({ profile }: SettingsContentProps) {
  const router = useRouter()
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

  return (
    <main className="flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pb-safe">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6 pt-safe">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 sm:w-11 sm:h-11">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back to dashboard</span>
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-5 sm:gap-6">
        {/* Profile Info */}
        <Card className="border-0 shadow-md">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5 pb-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="parentName" className="text-sm sm:text-base">Parent&apos;s Name</Label>
              <Input
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="h-12 sm:h-14 rounded-xl w-full text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="childName" className="text-sm sm:text-base">Child&apos;s Name</Label>
              <Input
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="h-12 sm:h-14 rounded-xl w-full text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-lg sm:text-xl">Tutor</CardTitle>
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
                      className="object-contain"
                    />
                  </div>
                  <p className="font-medium text-base sm:text-lg">{tutor.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="border-0 shadow-md">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-lg sm:text-xl">Schedule</CardTitle>
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
    </main>
  )
}
