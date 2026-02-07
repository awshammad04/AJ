"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient() 
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: "", form: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newErrors = { email: "", password: "", form: "" }
    let hasError = false

    if (!formData.email) { newErrors.email = "Email is required."; hasError = true }
    if (!formData.password) { newErrors.password = "Password is required."; hasError = true }

    if (hasError) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setErrors((prev) => ({ ...prev, form: error.message }))
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }


  return (
    <main className="flex flex-col items-center justify-start min-h-screen w-full relative p-6 pt-8 overflow-x-hidden">
      <div className="fixed inset-0 w-full h-full -z-10">
        <Image src="/images/background.png" alt="Sky" fill priority className="object-cover object-bottom" quality={100} />
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <Link href="/">
             <h1 className="text-5xl font-bold tracking-tight mb-4 text-center" style={{ color: "#2D7A6D", fontFamily: "cursive, sans-serif", textShadow: "2px 2px 0px rgba(255,255,255,0.6)" }}>
              Loudit
            </h1>
          </Link>
          <div className="relative w-40 h-28 -mb-4 z-20">
            <Image src="/images/charss.png" alt="Characters" fill className="object-contain object-bottom" />
          </div>
        </div>

        <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 pt-10 z-10 border border-white/50">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-sm text-gray-500">Let&apos;s continue practicing</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-700 font-semibold ml-1">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="parent@example.com" className={`rounded-xl h-12 bg-white ${errors.email || errors.form ? "border-red-500" : "border-gray-200"}`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                <Link href="#" className="text-xs text-green-700 hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={`rounded-xl h-12 bg-white ${errors.password || errors.form ? "border-red-500" : "border-gray-200"}`} />
            </div>

            {errors.form && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">{errors.form}</div>}

            <Button disabled={loading} className="w-full h-14 text-lg font-bold rounded-full mt-4 shadow-lg active:scale-95 transition-all" style={{ backgroundColor: "#2E8B57" }}>
              {loading ? <Loader2 className="animate-spin" /> : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? <Link href="/signup" className="font-bold text-green-700 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}