"use client"

import Image from "next/image"
import { Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OnboardingData } from "../onboarding-wizard"
import { Tutor } from "@/lib/types"

interface TutorSelectionStepProps {
  selectedTutor: Tutor
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function TutorSelectionStep({
  selectedTutor,
  onUpdate,
  onNext,
  onBack,
}: TutorSelectionStepProps) {
  
  // Assuming these are your tutor image paths based on previous context.
  // Make sure these match your actual files.
  const tutors = [
    {
      id: "tutorA",
      name: "Aws",
      image: "/images/charss.png", // Using charss.png as placeholder based on your other files
    },
    {
      id: "tutorB",
      name: "Joud",
      // You'll need the specific image for Joud here
      image: "/images/charss.png", 
    },
  ]

  return (
    <div className="flex flex-col w-full h-full font-sans">
      {/* Header - Compact spacing to move everything up */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#2D7A6D] mb-1">
          Choose Your Tutor
        </h2>
        <p className="text-gray-600 text-sm font-medium">
          Pick a friendly tutor to guide the practice sessions
        </p>
      </div>

      {/* Tutor Cards Grid */}
      <div className="flex flex-col gap-3 mb-8">
        {tutors.map((tutor) => {
          const isSelected = selectedTutor === tutor.id
          return (
            <Card
              key={tutor.id}
              // Added rounded-2xl for softer corners matching the container
              className={`relative cursor-pointer transition-all duration-200 border-2 rounded-2xl overflow-hidden ${
                isSelected
                  ? "border-green-500 bg-green-50/50 shadow-md"
                  : "border-gray-100 hover:border-green-200 hover:bg-gray-50"
              }`}
              onClick={() => onUpdate({ selectedTutor: tutor.id as Tutor })}
            >
              <div className="flex items-center p-3 gap-4">
                {/* Tutor Avatar */}
                <div className="relative w-16 h-16 bg-white rounded-2xl border border-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={tutor.image}
                    alt={tutor.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                {/* Tutor Name */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {tutor.name}
                  </h3>
                </div>

                {/* Checkmark Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? "bg-green-500 text-white" : "bg-gray-200 text-transparent"
                  }`}
                >
                  <Check className="w-4 h-4" strokeWidth={4} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Footer Buttons Area */}
      <div className="mt-auto flex items-center gap-3">
        {/* Back Button - Rounded Circle */}
        <Button
          variant="outline"
          onClick={onBack}
          className="h-14 w-14 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 shrink-0 p-0 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
        </Button>

        {/* Continue Button - Loudit Style */}
        <Button
          onClick={onNext}
          className="flex-1 h-14 text-lg font-bold rounded-full shadow-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
          style={{ backgroundColor: "#2E8B57" }}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}