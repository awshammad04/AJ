import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/background.png"
          alt="Sky Background"
          fill
          className="object-cover object-bottom"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-2xl mx-auto p-4 sm:p-6 pb-safe">
        {/* Top Section - Logo and Title */}
        <div className="flex-shrink-0 text-center pt-2 mb-2">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-lg"
            style={{
              color: "#2D7A6D",
              fontFamily: "cursive, sans-serif",
              textShadow: "3px 3px 0px rgba(255,255,255,0.7)",
            }}
          >
            Loudit
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-3">
            Let&apos;s practice talking<br />together!
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/95 font-semibold drop-shadow-md">
            We&apos;ll help you say words clearly
          </p>
        </div>

        {/* Middle Section - Character Card */}
        <div className="flex-1 flex flex-col items-center justify-start mb-2">
          <div className="relative w-full max-w-md">
            {/* Characters Image - Positioned ABOVE the card */}
            <div className="relative z-20 flex justify-center mb-[-180px]">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem]">
                <Image
                  src="/images/charss.png"
                  alt="Aws and Joud waving hello"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Glassmorphism Card */}
            <Card className="relative z-10 border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="pt-28 pb-8 px-6 sm:px-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Join thousands of families<br />practicing together! 🤩
                </h3>

                {/* 3D Green Get Started Button */}
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full h-16 sm:h-18 text-xl sm:text-2xl font-bold rounded-2xl shadow-xl border-b-4 border-green-800 bg-gradient-to-b from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:border-b-0 active:translate-y-1 transition-all mb-4"
                  >
                    Get Started
                  </Button>
                </Link>

                {/* Login Link */}
                <Link
                  href="/login"
                  className="inline-block text-base sm:text-lg font-bold text-green-700 hover:text-green-800 hover:underline transition-colors"
                >
                  I already have an account
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Spacer for safe area */}
        <div className="flex-shrink-0 h-8 safe-area-bottom" />
      </div>
    </main>
  )
}