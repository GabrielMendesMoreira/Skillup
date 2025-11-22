'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase' 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, GraduationCap, CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function SetNewPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Função para lidar com a troca de senha
  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        setLoading(false)
        return
    }

    try {
      // O Supabase usa a sessão que foi estabelecida pelo link de recuperação
      // para saber qual usuário atualizar.
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      // Após o sucesso, aguarda 2 segundos e redireciona para o Dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocorreu um erro ao atualizar a senha. Tente novamente ou peça um novo link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-slate-900 shadow-sm justify-between">
        <Link href="/" className="flex items-center justify-center text-xl font-bold text-primary">
          <GraduationCap className="h-6 w-6 mr-2" />
          SkillUp
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center">
              Defina sua nova senha para acessar sua conta SkillUp.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              // TELA DE SUCESSO
              <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-lg font-medium text-green-600 dark:text-green-400">
                  Senha atualizada com sucesso!
                </p>
                <p className="text-center text-sm text-muted-foreground">
                    Redirecionando para o Dashboard...
                </p>
              </div>
            ) : (
              // FORMULÁRIO
              <form onSubmit={handleSetNewPassword} className="grid gap-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 border border-red-200">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Atualizando...' : 'Alterar Senha'}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pt-2 border-t mt-2">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Voltar para o Login
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}