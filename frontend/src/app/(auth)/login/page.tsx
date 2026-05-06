'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "./actions"
import { useState } from "react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 md:p-10 text-slate-50 font-sans selection:bg-violet-500/30 relative overflow-hidden">
      {/* Background Gradients from Landing Page */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 font-bold text-2xl text-white">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                N
              </div>
              Nia App
            </div>
          </div>
          
          <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm text-slate-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Acessar Painel</CardTitle>
              <CardDescription className="text-gray-400">
                Faça login para gerenciar a sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="m@exemplo.com" 
                      required 
                      className="border-gray-800 bg-gray-950/50 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-300">Senha</Label>
                      <a href="#" className="text-sm text-violet-400 hover:text-violet-300 hover:underline">
                        Esqueceu a senha?
                      </a>
                    </div>
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      required 
                      className="border-gray-800 bg-gray-950/50 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-sm font-medium text-red-500 text-center bg-red-500/10 py-2 rounded">
                      {error}
                    </div>
                  )}

                  <Button type="submit" disabled={isPending} className="w-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50">
                    {isPending ? "Entrando..." : "Entrar"}
                  </Button>
                  <div className="text-center text-sm text-gray-400 mt-2">
                    Ainda não tem conta?{' '}
                    <a href="https://wa.me/5548988253605" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 hover:underline">
                      Fale com o suporte
                    </a>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
