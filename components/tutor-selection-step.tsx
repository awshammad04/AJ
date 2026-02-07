"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TutorMascot } from "@/components/tutor-mascot"
import { TUTORS, type Tutor } from "@/lib/types"
import type { OnboardingData } from "./onboarding-wizard"
import { ArrowLeft, Check } from "lucide-react"

interface TutorSelectionStepProps {
  selectedTutor: Tutor
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function TutorSelectionStep({ selectedTutor, onUpdate, onNext, onBack }: TutorSelectionStepProps) {
  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Choose Your Tutor</CardTitle>
        <CardDescription>Pick a friendly tutor to guide the practice sessions</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          {Object.values(TUTORS).map((tutor) => (
            <button
              key={tutor.id}
              type="button"
              onClick={() => onUpdate({ selectedTutor: tutor.id as Tutor })}
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
              <TutorMascot tutorId={tutor.id as Tutor} mood="idle" size="sm" />
              <p className="font-semibold text-lg">{tutor.name}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl px-4 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={onNext} className="flex-1 h-12 rounded-xl text-base">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
