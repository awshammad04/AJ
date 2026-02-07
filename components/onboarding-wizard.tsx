"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ParentChildStep } from "./parent-child-step"
import { TutorSelectionStep } from "./tutor-selection-step"
import { ScheduleStep } from "./schedule-step"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Tutor, Schedule } from "@/lib/types"

interface OnboardingWizardProps {
  userId: string
}

export type OnboardingData = {
  parentName: string
  childName: string
  selectedTutor: Tutor
  examDate: string | null
  schedule: Schedule
}

const initialData: OnboardingData = {
  parentName: "",
  childName: "",
  selectedTutor: "tutorA",
  examDate: null,
  schedule: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      parent_name: data.parentName,
      child_name: data.childName,
      selected_tutor: data.selectedTutor,
      exam_date: data.examDate,
      schedule: data.schedule,
      progress: 0,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-8 bg-primary/50" : "w-2 bg-muted"
              }`}
          />
        ))}
      </div>

      {/* Steps */}
      {step === 1 && (
        <ParentChildStep
          parentName={data.parentName}
          childName={data.childName}
          onUpdate={updateData}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <TutorSelectionStep
          selectedTutor={data.selectedTutor}
          onUpdate={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <ScheduleStep
          examDate={data.examDate}
          schedule={data.schedule}
          onUpdate={updateData}
          onBack={prevStep}
          onComplete={handleComplete}
          loading={loading}
          error={error}
        />
      )}
    </div>
  )
}
