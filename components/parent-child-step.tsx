"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { OnboardingData } from "./onboarding-wizard"

interface ParentChildStepProps {
  parentName: string
  childName: string
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export function ParentChildStep({ parentName, childName, onUpdate, onNext }: ParentChildStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (parentName.trim() && childName.trim()) {
      onNext()
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Loudit!</CardTitle>
        <CardDescription>Let&apos;s set up your family&apos;s profile</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentName">Parent&apos;s Name</Label>
            <Input
              id="parentName"
              type="text"
              placeholder="Your name"
              value={parentName}
              onChange={(e) => onUpdate({ parentName: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="childName">Child&apos;s Name</Label>
            <Input
              id="childName"
              type="text"
              placeholder="Your child's name"
              value={childName}
              onChange={(e) => onUpdate({ childName: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base"
            disabled={!parentName.trim() || !childName.trim()}
          >
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
