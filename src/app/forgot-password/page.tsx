'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase' // Seu cliente configurado
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false) // Estado para controlar a tela de sucesso

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // O redirecionamento é importante para o usuário voltar logado ou para a tela de nova senha
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password/next=/dashboard/recover`, 
      })

      if (error) {
        throw error
      }

      setSuccess(true) // Troca o formulário pela mensagem de sucesso
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao enviar e-mail de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* HEADER IGUAL AO LOGIN */}
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
            <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
            <CardDescription className="text-center">
              {success 
                ? "Verifique sua caixa de entrada." 
                : "Digite seu e-mail para receber o link."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              // TELA DE SUCESSO (Renderização Condicional)
              <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Enviamos um link de recuperação para <strong>{email}</strong>.
                </p>
              </div>
            ) : (
              // FORMULÁRIO DE ENVIO
              <form onSubmit={handleReset} className="grid gap-4">
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
                    disabled={loading}
                  />
                </div>

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Link
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pt-2 border-t mt-2">
            <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}