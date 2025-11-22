'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
      router.refresh()

    } catch (err: any) {
      console.error(err)
      setError('Email ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
       {/* HEADER LOGIN - Adicionado ThemeToggle */}
       <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-slate-900 shadow-sm justify-between">
        <Link href="/" className="flex items-center justify-center text-xl font-bold text-primary">
          <GraduationCap className="h-6 w-6 mr-2" />
          SkillUp
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login SkillUp</CardTitle>
            <CardDescription className="text-center">
              Entre com seu e-mail corporativo para acessar os cursos.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 border border-red-200">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@exemplo.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>


                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-16"
                  />

          
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}