// Helper function to get tutor-specific images
export const getTutorImage = (imageKey: string, tutor: "tutorA" | "tutorB") => {
  const isAws = tutor === "tutorA"

  const imageMap: Record<string, { aws: string; joud: string }> = {
    book: { aws: "/images/bookAws.png", joud: "/images/bookJoud.png" },
    chair: { aws: "/images/chairAws.png", joud: "/images/chairJoud.png" },
    ball: { aws: "/images/ballAws.png", joud: "/images/ballJoud.png" },
    car: { aws: "/images/carAws.png", joud: "/images/carJoud.png" },
    fish: { aws: "/images/fishAws.png", joud: "/images/fishJoud.png" },
    ladder: { aws: "/images/ladderAws.png", joud: "/images/ladderJoud.png" },
    pomegranate: { aws: "/images/pomegranateAws.png", joud: "/images/pomegranateJoud.png" },
    sand: { aws: "/images/sandAws.png", joud: "/images/sandJoud.png" },
    ronaldo: { aws: "/images/ronaldoAws.png", joud: "/images/ronaldoJoud.png" },
  }

  return isAws ? imageMap[imageKey]?.aws : imageMap[imageKey]?.joud
}

export const TRAINING_MODULES = {
  KAF: {
    title: "حرف الكاف (ك)",
    color: "bg-orange-500", // Theme color
    introAudio: "/sounds/train_kaf_intro.m4a",
    stages: [
      {
        word: "كتاب",
        imageKey: "book", // Image key for tutor-specific images
        audio: "/sounds/word_kitab.m4a"
      },
      {
        word: "كرسي",
        imageKey: "chair",
        audio: "/sounds/word_kursi.m4a"
      },
      {
        word: "كرة",
        imageKey: "ball",
        audio: "/sounds/word_kura.m4a"
      },
    ]
  },
  SIN: {
    title: "حرف السين (س)",
    color: "bg-blue-500",
    introAudio: "/sounds/train_sin_intro.m4a",
    stages: [
      {
        word: "سيارة",
        imageKey: "car",
        audio: "/sounds/word_sayyara.m4a"
      },
      {
        word: "سمكة",
        imageKey: "fish",
        audio: "/sounds/word_samaka.m4a"
      },
      {
        word: "سلم",
        imageKey: "ladder",
        audio: "/sounds/word_sullam.m4a"
      },
    ]
  },
  RA: {
    title: "حرف الراء (ر)",
    color: "bg-green-500",
    introAudio: "/sounds/train_ra_intro.m4a",
    stages: [
      {
        word: "رمان",
        imageKey: "pomegranate",
        audio: "/sounds/word_rumman.m4a"
      },
      {
        word: "رمل",
        imageKey: "sand",
        audio: "/sounds/word_raml.m4a"
      },
      {
        word: "رونالدو", // The Ronaldo Update!
        imageKey: "ronaldo",
        audio: "/sounds/word_ronaldo.m4a"
      },
    ]
  }
} as const