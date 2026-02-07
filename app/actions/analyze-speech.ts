"use server"

const API_URL = process.env.OPENAI_API_URL || "https://api.groq.com/openai/v1/audio/transcriptions"
const API_KEY = process.env.OPENAI_API_KEY

export async function analyzeSpeech(formData: FormData) {
  try {
    if (!API_KEY) return { success: false, error: "Missing API Key" }

    const audioFile = formData.get("audio") as File
    const targetWord = formData.get("targetWord") as string
    
    if (!audioFile) return { success: false, error: "No audio detected" }

    // 1. CALL AI
    const apiFormData = new FormData()
    apiFormData.append("file", audioFile)
    apiFormData.append("model", "whisper-large-v3") 
    apiFormData.append("language", "ar")

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}` },
      body: apiFormData,
    })

    if (!response.ok) {
      const err = await response.text()
      return { success: false, error: `AI Error: ${err}` }
    }

    const data = await response.json()
    const detectedText = data.text || ""

    // 2. DIAGNOSE
    console.log(`🎯 Target: "${targetWord}" | 🎤 Heard: "${detectedText}"`)
    
    const diagnosis = diagnosePronunciation(detectedText, targetWord)

    return { 
      success: true, 
      isCorrect: diagnosis.isCorrect, 
      detectedText: detectedText,
      feedback: diagnosis.feedback,
      detectedIssue: diagnosis.detectedIssue // e.g., "KAF_ISSUE", "RA_ISSUE"
    }

  } catch (error: any) {
    console.error("Server Error:", error)
    return { success: false, error: "Server Crash" }
  }
}

// --- DIAGNOSTIC LOGIC ---
function diagnosePronunciation(spoken: string, target: string) {
  const s = normalizeArabic(spoken)
  const t = normalizeArabic(target)

  // 1. Correct
  if (s.includes(t)) return { isCorrect: true, feedback: "ممتاز! 🌟", detectedIssue: null }

  // 2. CHECK SPECIFIC SUBSTITUTIONS (The "Tanz" Logic)
  
  // Case: Kanz (كنز) -> Tanz (تنز) OR Kalb (كلب) -> Talb (تلب)
  // Target has 'ك', Spoken has 'ت' instead
  if (t.includes("ك") && s.includes("ت") && !s.includes("ك")) {
    return { 
      isCorrect: false, 
      feedback: "سمعت حرف 'ت' بدل 'ك'.",
      detectedIssue: "KAF" // Flag the letter Kaf
    }
  }

  // Case: Risha (ريشة) -> Lisha (ليشة)
  // Target has 'ر', Spoken has 'ل' instead
  if (t.includes("ر") && s.includes("ل") && !s.includes("ر")) {
    return { 
      isCorrect: false, 
      feedback: "سمعت حرف 'ل' بدل 'ر'.",
      detectedIssue: "RA" // Flag the letter Ra
    }
  }

  // Case: Sa'ah (ساعة) -> Tha'ah (ثاعة)
  // Target has 'س', Spoken has 'ث' instead
  if (t.includes("س") && s.includes("ث") && !s.includes("س")) {
    return { 
      isCorrect: false, 
      feedback: "سمعت حرف 'ث' بدل 'س'.",
      detectedIssue: "SIN" // Flag the letter Sin
    }
  }

  // 3. General Mistake (Try again)
  return { 
    isCorrect: false, 
    feedback: "جرب مرة ثانية!", 
    detectedIssue: null 
  }
}

function normalizeArabic(text: string) {
  return text.trim().toLowerCase()
    .replace(/[^\u0600-\u06FF]/g, '') 
    .replace(/[\u064B-\u065F]/g, '')  
    .replace(/[أإآ]/g, 'ا')           
    .replace(/ة/g, 'ه')               
    .replace(/ي/g, 'ى')               
}