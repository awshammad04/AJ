"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Schedule } from "@/lib/types"
import type { OnboardingData } from "../onboarding-wizard"
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from "lucide-react"

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

export function ScheduleStep({ 
  examDate, 
  schedule, 
  onUpdate, 
  onBack, 
  onComplete, 
  loading, 
  error 
}: ScheduleStepProps) {
  
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
    <div className="flex flex-col w-full h-full font-sans">
      
      {/* Header - Compact spacing */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#2D7A6D] mb-1">
          Set Up Schedule
        </h2>
        <p className="text-gray-600 text-sm font-medium">
          When would you like to practice?
        </p>
      </div>

      <div className="space-y-6 mb-8">
        
        {/* Exam Date Input */}
        <div className="space-y-2">
          <Label htmlFor="examDate" className="text-gray-700 font-semibold ml-1">
            Target Exam Date (Optional)
          </Label>
          <div className="relative">
            <Input
              id="examDate"
              type="date"
              value={examDate || ""}
              onChange={(e) => onUpdate({ examDate: e.target.value || null })}
              className="h-12 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent pl-4"
            />
            {/* Optional Icon decoration if input type='date' doesn't show one nicely on all browsers */}
            {!examDate && (
              <CalendarIcon className="absolute right-4 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
            )}
          </div>
          <p className="text-xs text-gray-500 ml-1">
            Set a goal date to track your progress
          </p>
        </div>

        {/* Days Selection Grid */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-semibold ml-1">
            Practice Days
          </Label>
          <div className="grid grid-cols-4 gap-2"> 
            {/* Using grid-cols-4 makes them stack nicely */}
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                className={`h-12 rounded-xl font-bold text-sm transition-all shadow-sm border-b-2 active:border-b-0 active:translate-y-0.5 ${
                  schedule[key]
                    ? "bg-[#2E8B57] text-white border-green-800 shadow-green-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-100 font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="mt-auto flex items-center gap-3">
        {/* Back Button - Rounded Circle */}
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="h-14 w-14 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 shrink-0 p-0 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
        </Button>

        {/* Start Practicing Button - Loudit Style */}
        <Button
          onClick={onComplete}
          disabled={loading || !hasSelectedDays}
          className="flex-1 h-14 text-lg font-bold rounded-full shadow-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#2E8B57" }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Setting up...
            </>
          ) : (
            "Start Practicing!"
          )}
        </Button>
      </div>
    </div>
  )
}