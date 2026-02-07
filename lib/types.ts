export type Tutor = "tutorA" | "tutorB"

export interface Profile {
  id: string
  parent_name: string
  child_name: string
  selected_tutor: Tutor
  start_date: string
  exam_date: string | null
  schedule: Schedule
  progress: number
  created_at: string
  updated_at: string
  stars: number;
  streak_days: number;
}

export interface Schedule {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface PracticeSession {
  id: string
  user_id: string
  session_date: string
  duration_seconds: number
  words_practiced: number
  words_count: number
  correct_count: number
  total_attempts: number
  score: number
  notes: string | null
  letters: string[] | null  // Diagnosed letter issues (e.g., ["KAF", "RA"])
  created_at: string
}

export interface TrainingSession {
  id: string
  user_id: string
  letter: string
  duration_seconds: number
  words_practiced: number
  correct_count: number
  total_attempts: number
  score: number
  results: Array<{ word: string; isCorrect: boolean; attempts: number }>
  created_at: string
}

export interface WordAttempt {
  id: string
  session_id: string
  word: string
  is_correct: boolean
  attempt_count: number
  audio_url: string | null
  created_at: string
}

export const TUTORS = {
  tutorA: {
    id: "tutorA",
    name: "Aws",
    gender: "male",
    images: {
      base: "/images/publictutorstutora-base.jpeg",
      happy: "/images/publictutorstutora-base.jpeg",
      tryAgain: "/images/publictutorstutora-tryagain.png",
    },
  },
  tutorB: {
    id: "tutorB",
    name: "Joud",
    gender: "female",
    images: {
      base: "/images/publictutorstutorb-base.jpeg",
      happy: "/images/publictutorstutorb-base.jpeg",
      tryAgain: "/images/publictutorstutorb-tryagain.jpeg",
    },
  },
} as const
