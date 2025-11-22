"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ChevronLeft, Loader2, Award, Zap, PlayCircle, Save } from "lucide-react"
import { toast } from "sonner"
import { getYouTubeId } from "@/lib/youtube"

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [watchProgress, setWatchProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchCourseAndEnroll() {
      // 1. Busca dados do curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', params.id)
        .single()

      if (courseError || !courseData) {
          toast.error("Curso não encontrado")
          setLoading(false)
          return
      }

      setCourse(courseData)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
          // 2. Tenta buscar progresso existente
          const { data: existingProgress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('course_id', courseData.id)
            .eq('user_id', user.id)
            .maybeSingle()

          if (existingProgress) {
              setCompleted(existingProgress.completed)
              setWatchProgress(existingProgress.completed ? 100 : (existingProgress.progress_percent || 0))
          } else {
              // 3. AUTO-MATRÍCULA SEGURA (Upsert)
              // "ignoreDuplicates" evita o erro 409 se o React tentar rodar 2x
              const { error: enrollError } = await supabase
                  .from('user_progress')
                  .upsert(
                      { 
                          user_id: user.id, 
                          course_id: courseData.id, 
                          progress_percent: 0,
                          completed: false
                      },
                      { onConflict: 'user_id, course_id', ignoreDuplicates: true }
                  )
              
              if (enrollError) console.error("Erro ao matricular:", enrollError)
          }
      }
      setLoading(false)
    }
    
    fetchCourseAndEnroll()
  }, [params.id, supabase])

  const handleSaveProgress = async () => {
    if (!course) return
    setIsSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isFinishing = watchProgress === 100

    const { error } = await supabase
        .from('user_progress')
        .update({ 
            progress_percent: watchProgress,
            completed: isFinishing,
            completed_at: isFinishing ? new Date().toISOString() : null,
            last_accessed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('course_id', course.id)

    setIsSaving(false)

    if (!error) {
        if (isFinishing) {
            setCompleted(true)
            toast.success(`Parabéns! +${course.xp_reward} XP`)
            router.refresh()
            setTimeout(() => router.push('/dashboard/cursos'), 1500)
        } else {
            toast.success("Progresso salvo!")
        }
    } else {
        toast.error("Erro ao salvar")
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatchProgress(Number(e.target.value))
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!course) return <div className="p-8 text-center">Curso não encontrado.</div>

  const youtubeId = getYouTubeId(course.video_url)

  return (
    <div className="flex flex-col h-full p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        <Button variant="ghost" className="w-fit pl-0 hover:pl-2 transition-all" onClick={() => router.push('/dashboard/cursos')}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar aos Meus Cursos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PLAYER DE VÍDEO */}
            <div className="lg:col-span-2 space-y-6">
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 relative">
                    {youtubeId ? (
                        <iframe 
                            width="100%" height="100%" 
                            src={`https://www.youtube.com/embed/${youtubeId}`} 
                            title={course.title}
                            frameBorder="0" allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900">
                            <PlayCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p>Vídeo indisponível</p>
                            <p className="text-xs mt-2">Link não cadastrado no banco.</p>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm px-3 py-1 capitalize">{course.level}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                </div>
            </div>

            {/* CONTROLES */}
            <div className="space-y-6">
                <Card className="p-6 border-none bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-l-4 border-l-indigo-500 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Zap className="w-4 h-4" /> Recompensa
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                                    {course.xp_reward || 50}
                                </span>
                                <span className="text-sm font-bold text-muted-foreground">XP</span>
                            </div>
                        </div>
                        <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                            <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Seu Progresso</h3>
                        <p className="text-sm text-muted-foreground">Arraste para atualizar onde você parou.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Status</span>
                            <span className={watchProgress === 100 ? "text-green-600 font-bold" : "text-primary"}>
                                {watchProgress}%
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="100" step="5"
                            value={watchProgress}
                            onChange={handleSliderChange}
                            className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <Button 
                        size="lg" className="w-full h-12 text-lg transition-all" 
                        onClick={handleSaveProgress}
                        disabled={isSaving}
                        variant={watchProgress === 100 ? "default" : "secondary"}
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : (watchProgress === 100 ? "Concluir Aula" : "Salvar Progresso")}
                    </Button>
                </Card>
            </div>
        </div>
    </div>
  )
}