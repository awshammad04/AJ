"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image" // <--- Added for Characters
import Link from "next/link"   // <--- Added for Logo
import { ParentChildStep } from "./steps/parent-child-step"
import { TutorSelectionStep } from "./steps/tutor-selection-step"
import { ScheduleStep } from "./steps/schedule-step"
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
    <div className="w-full max-w-md flex flex-col items-center">
      
      {/* --- HEADER: LOGO & CHARACTERS --- */}
      <div className="flex flex-col items-center mb-6">
        <Link href="/">
          <h1
            className="text-5xl font-bold tracking-tight mb-4 text-center"
            style={{
              color: "#2D7A6D",
              fontFamily: "cursive, sans-serif",
              textShadow: "2px 2px 0px rgba(255,255,255,0.6)",
            }}
          >
            Loudit
          </h1>
        </Link>

        {/* Characters Peeking Over */}
        <div className="relative w-40 h-28 -mb-4 z-20">
          <Image 
            src="/images/charss.png" 
            alt="Characters" 
            fill 
            className="object-contain object-bottom" 
          />
        </div>
      </div>

      {/* --- GLASS CARD CONTAINER --- */}
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 pt-10 z-10 border border-white/50">
        
        {/* Progress Indicator (Green Dots) */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-[#2E8B57]" : i < step ? "w-8 bg-[#2E8B57]/40" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Wizard Steps */}
        <div className="min-h-[300px] flex flex-col">
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

      </div>
    </div>
  )
}