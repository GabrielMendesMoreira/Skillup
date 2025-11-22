import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Users, BookOpen, Zap, Clock, Trophy, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CourseCard } from "@/components/skillup/CourseCard"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = await (cookies() as any)
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // 1. Pega Usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Carregando...</div>

  // 2. Pega Perfil (para saber o setor)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Pega Progresso (Para calcular stats)
  const { data: myProgress } = await supabase
    .from('user_progress')
    .select('*, courses(xp_reward)')
    .eq('user_id', user.id)
    .eq('completed', true)

  // --- CÁLCULOS DOS STATS ---
  const completedCount = myProgress?.length || 0
  // Soma o XP de todos os cursos concluídos
  const totalXP = myProgress?.reduce((acc, curr: any) => acc + (curr.courses?.xp_reward || 0), 0) || 0
  // Estimativa: Cada curso ~30min (0.5h)
  const studyHours = (completedCount * 0.5).toFixed(1)
  // Ranking Simulado (Pega o total de users e vê onde seu XP se encaixa - simplificado para MVP)
  const rankingPosition = totalXP > 0 ? Math.max(1, 15 - Math.floor(totalXP / 100)) : "-"

  // 4. RECOMENDAÇÕES (Lógica: Mesmo Setor + Não Completado)
  let query = supabase.from('courses').select('*, sectors(name)').limit(3)
  
  // Se tiver setor, filtra por ele
  if (profile?.sector_id) {
    query = query.eq('sector_id', profile.sector_id)
  }
  
  // Pega os dados
  const { data: recommendedRaw } = await query

  // Filtra no JS para tirar os que já fiz (pra garantir)
  const completedIds = myProgress?.map((p:any) => p.course_id) || []
  const recommendedCourses = recommendedRaw?.filter(c => !completedIds.includes(c.id)) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Card de Boas Vindas e Stats */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Users className="w-6 h-6 text-sky-400" />
                    Olá, {profile?.name?.split(' ')[0] || 'Aluno'}!
                </CardTitle>
                <CardDescription className="text-slate-300">
                    Aqui está o resumo do seu progresso no setor de <span className="font-bold text-white">{profile?.job_title || 'Geral'}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard title="XP Total" value={totalXP.toString()} icon={Zap} color="text-amber-400" />
                    <StatCard title="Concluídos" value={completedCount.toString()} icon={BookOpen} color="text-blue-400" />
                    <StatCard title="Horas" value={studyHours} icon={Clock} color="text-emerald-400" />
                    <StatCard title="Ranking" value={`#${rankingPosition}`} icon={Trophy} color="text-purple-400" />
                </div>

                <div className="pt-4 border-t border-white/10 mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <Label>Notificar novos cursos de {profile?.job_title || "TI"}</Label>
                        <Switch defaultChecked />
                    </div>
                    <Link href="/dashboard/catalogo" className="text-xs text-sky-300 hover:text-white flex items-center gap-1 transition-colors">
                        Ver catálogo completo <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </CardContent>
        </Card>

        {/* Seção de Recomendados */}
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> 
                Recomendados para você
            </h2>
            
            {recommendedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/30">
                    <p>Você está em dia! Nenhum curso novo no seu setor por enquanto.</p>
                    <Link href="/dashboard/catalogo" className="text-primary hover:underline mt-2 inline-block">
                        Explorar outros setores
                    </Link>
                </div>
            )}
        </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: string, color: string }) {
    return (
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm flex items-center gap-4 hover:bg-white/10 transition-colors">
            <div className={`p-2 rounded-full bg-white/5 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
}