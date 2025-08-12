"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { GraduationCap, Mail, Lock, UserCircle } from "lucide-react"

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("selectedRole", role)
        router.push("/dashboard")
      } else {
        alert(data.message || "Login failed")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred during login")
    }
  }

  // Splash Screen JSX
  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-purple-700 text-white animate-fade-in">
        <div className="flex flex-col items-center">
          <p className="text-xl font-light">Powered by</p>
          <img src="/images/CITBIF_logo.png" alt="Logo" className="w-24 h-24" />
        </div>
      </div>
    )
  }

  // Main Login Page JSX
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>

      <Card className="w-full max-w-md glass-effect border-white/20 animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/100 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/images/CIT_logo.jpg" alt="Logo"/>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">CIT CSMS Portal</CardTitle>
            <CardDescription className="text-white/80">Access your academic dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white/90 flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Role
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superuser">Super User</SelectItem>
                  <SelectItem value="hod">Head of Department</SelectItem>
                  <SelectItem value="faculty">Faculty Member</SelectItem>
                  <SelectItem value="subject-expert">Subject Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-3">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

