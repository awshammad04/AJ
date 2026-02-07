"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Schedule } from "@/lib/types"
import type { OnboardingData } from "./onboarding-wizard"
import { ArrowLeft, Loader2 } from "lucide-react"

interface ScheduleStepProps {
  examDate: string | null
  schedule: Schedule
  onUpdate: (data: Partial<OnboardingData>) => void
  onBack: () => void
  onComplete: () => void
  loading: boolean
  error: string | null
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

export function ScheduleStep({ examDate, schedule, onUpdate, onBack, onComplete, loading, error }: ScheduleStepProps) {
  const toggleDay = (day: keyof Schedule) => {
    onUpdate({
      schedule: {
        ...schedule,
        [day]: !schedule[day],
      },
    })
  }

  const hasSelectedDays = Object.values(schedule).some(Boolean)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set Up Schedule</CardTitle>
        <CardDescription>When would you like to practice?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exam date (optional) */}
        <div className="space-y-2">
          <Label htmlFor="examDate">Target Exam Date (Optional)</Label>
          <Input
            id="examDate"
            type="date"
            value={examDate || ""}
            onChange={(e) => onUpdate({ examDate: e.target.value || null })}
            className="h-12 rounded-xl"
          />
          <p className="text-xs text-muted-foreground">Set a goal date to track your progress</p>
        </div>

        {/* Days selection */}
        <div className="space-y-2">
          <Label>Practice Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                className={`w-12 h-12 rounded-xl font-medium text-sm transition-all ${schedule[key]
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-12 rounded-xl px-4 bg-transparent"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            onClick={onComplete}
            className="flex-1 h-12 rounded-xl text-base"
            disabled={loading || !hasSelectedDays}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Start Practicing!"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
