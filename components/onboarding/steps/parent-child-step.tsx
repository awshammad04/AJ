"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OnboardingData } from "../onboarding-wizard"

interface ParentChildStepProps {
  parentName: string
  childName: string
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export function ParentChildStep({ parentName, childName, onUpdate, onNext }: ParentChildStepProps) {
  
  // Simple validation to ensure fields aren't empty
  const isFormValid = parentName.trim() !== "" && childName.trim() !== ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[#2D7A6D] mb-1">
          Welcome to Loudit!
        </h2>
        <p className="text-gray-600 text-sm">
          Let's set up your family's profile
        </p>
      </div>

      {/* Parent Name Input */}
      <div className="space-y-1.5">
        <Label htmlFor="parentName" className="text-gray-700 font-semibold ml-1">
          Parent&apos;s Name
        </Label>
        <Input
          id="parentName"
          value={parentName}
          onChange={(e) => onUpdate({ parentName: e.target.value })}
          placeholder="e.g. Sarah"
          className="rounded-xl h-12 bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Child Name Input */}
      <div className="space-y-1.5">
        <Label htmlFor="childName" className="text-gray-700 font-semibold ml-1">
          Child&apos;s Name
        </Label>
        <Input
          id="childName"
          value={childName}
          onChange={(e) => onUpdate({ childName: e.target.value })}
          placeholder="e.g. Leo"
          className="rounded-xl h-12 bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* --- THE UPDATED BUTTON --- */}
      <Button
        type="submit"
        disabled={!isFormValid}
        className="w-full h-14 text-lg font-bold rounded-full mt-4 shadow-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#2E8B57" }}
      >
        Continue
      </Button>
    </form>
  )
}