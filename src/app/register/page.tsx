'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs' 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select' // Novo Import
import { Alert, AlertDescription } from '@/components/ui/alert' 

// Tipagem básica para os setores
type Sector = {
  id: number;
  name: string;
}


export default function RegisterPage() {
  const router = useRouter()
  // Usamos createClientComponentClient() para evitar problemas de hidratação/cache
  const supabase = createClientComponentClient() 

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sectorId, setSectorId] = useState<string>('') // ID do setor selecionado
  const [sectors, setSectors] = useState<Sector[]>([]) // Lista de setores do BD

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 🔄 Efeito para carregar os setores disponíveis do BD
  useEffect(() => {
    async function fetchSectors() {
      const { data, error } = await supabase.from('sectors').select('id, name').order('name', { ascending: true });
      if (error) {
        console.error("Erro ao carregar setores:", error);
        setError("Não foi possível carregar os setores.");
      } else if (data) {
        setSectors(data);
      }
    }
    fetchSectors();
  }, [supabase]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!sectorId) {
        setError("Por favor, selecione seu Setor/Departamento.")
        setLoading(false)
        return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Mapeamento dos metadados para o Trigger que criamos no BD
            name: name, // O trigger antigo usava full_name. Mudei para name para simplificar
            sector_id: sectorId, // <--- CAMPO ESSENCIAL PARA O BD
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name.split(' ').join('+')}` // Avatar simples
          },
        },
      })

      if (error) throw error

      setSuccess(true)
      // Se não houver confirmação por email, pode redirecionar direto para dashboard aqui.
      // Neste código, optamos por mostrar a tela de sucesso.
      
    } catch (err: any) {
      console.error(err)
      // Corrigindo para erro de banco/auth
      setError(err.message || "Erro desconhecido ao cadastrar.")
    } finally {
      setLoading(false)
    }
  }

  // Se o registro foi um sucesso, redireciona para o login após 2 segundos
  useEffect(() => {
      if (success) {
          const timer = setTimeout(() => {
              router.push('/login');
          }, 2000); // 2 segundos para o usuário ler a mensagem
          return () => clearTimeout(timer);
      }
  }, [success, router]);


  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* HEADER REGISTER - Com ThemeToggle */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-slate-900 shadow-sm">
        <Link href="/" className="flex items-center justify-center text-xl font-bold text-primary">
          <GraduationCap className="h-6 w-6 mr-2" />
          SkillUp
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
           <ThemeToggle />
           <nav className="hidden sm:flex">
           <Link href="/login">
             <Button variant="ghost">Já tenho conta</Button>
           </Link>
           </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        
        {/* Tela de Sucesso */}
        {success ? (
          <Card className="w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Conta criada com sucesso!</CardTitle>
              <CardDescription>
                Seu perfil foi criado. Você será redirecionado para o login em breve.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
                Redirecionando...
              </Button>
            </CardFooter>
          </Card>

        ) : (
          <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Crie sua conta</CardTitle>
              <CardDescription className="text-center">
                Preencha os dados abaixo para acessar a plataforma.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Gabriel Mendes Moreira" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Corporativo</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="gabriel.mendes@skillup.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                
                {/* 🎯 CAMPO NOVO: SETOR */}
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor / Departamento</Label>
                  <Select onValueChange={setSectorId} required disabled={sectors.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={sectors.length === 0 ? "Carregando setores..." : "Selecione seu setor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={String(sector.id)}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* FIM CAMPO NOVO */}
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 6 caracteres"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4 pt-6">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Já tem uma conta? <Link href="/login" className="underline hover:text-primary">Fazer Login</Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>

      <footer className="py-6 w-full text-center border-t bg-white dark:bg-slate-900">
        <p className="text-xs text-muted-foreground">
          &copy; 2025 SkillUp. Plataforma de Treinamento.
        </p>
      </footer>
    </div>
  )
}