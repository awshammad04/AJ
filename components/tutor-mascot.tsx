"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { TUTORS, type Tutor } from "@/lib/types"

type TutorMood = "idle" | "success" | "tryAgain"

interface TutorMascotProps {
  tutorId: Tutor
  mood?: TutorMood
  size?: "sm" | "md" | "lg"
  className?: string
  onAnimationEnd?: () => void
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
}

export function TutorMascot({ tutorId, mood = "idle", size = "md", className = "", onAnimationEnd }: TutorMascotProps) {
  const tutor = TUTORS[tutorId]
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationClass, setAnimationClass] = useState("tutor-idle")

  useEffect(() => {
    if (mood === "success") {
      setAnimationClass("tutor-success")
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        setAnimationClass("tutor-idle")
        onAnimationEnd?.()
      }, 1500)
      return () => clearTimeout(timer)
    } else if (mood === "tryAgain") {
      setAnimationClass("tutor-shake")
      const timer = setTimeout(() => {
        setAnimationClass("tutor-idle")
        onAnimationEnd?.()
      }, 600)
      return () => clearTimeout(timer)
    } else {
      setAnimationClass("tutor-idle")
    }
  }, [mood, onAnimationEnd])

  const getImage = () => {
    if (mood === "tryAgain") {
      return tutor.images.tryAgain
    }
    return tutor.images.base
  }

  return (
    <div className={`relative ${className}`}>
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="confetti-piece" />
          ))}
        </div>
      )}
      <div className={`relative ${sizeClasses[size]} ${animationClass}`}>
        <Image
          src={getImage() || "/placeholder.svg"}
          alt={`Tutor ${tutor.name}`}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  )
}
