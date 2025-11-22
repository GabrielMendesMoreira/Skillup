import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CourseCard } from "@/components/skillup/CourseCard"
import { GraduationCap, BookX } from "lucide-react"
import Link from "next/link" 
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function MyCoursesPage() {
  const cookieStore = await (cookies() as any)
  
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Carregando...</div>

  // ✅ AQUI ESTÁ O SEGREDO: Buscando progress_percent
  const { data: myProgressData, error } = await supabase
    .from('user_progress')
    .select(`
      completed,
      progress_percent, 
      courses (
        *,
        sectors ( name ) 
      )
    `)
    .eq('user_id', user.id)
    .order('last_accessed_at', { ascending: false })
    
  if (error) console.error("Erro:", error)

  const myCourses = myProgressData?.map((item: any) => {
      const course = item.courses
      return {
          ...course,
          course_id: course.id, 
          // ✅ Se completou é 100, senão usa a porcentagem salva, senão 0
          progress_percent: item.completed ? 100 : (item.progress_percent || 0),
          sectors: course.sectors 
      }
  }) || []

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
                <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meus Cursos</h1>
                <p className="text-muted-foreground">Seus treinamentos em andamento.</p>
            </div>
        </div>

        {myCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 rounded-2xl border-2 border-dashed">
                <div className="p-4 bg-muted rounded-full">
                    <BookX className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Você ainda não começou nenhum curso</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Explore o catálogo para encontrar treinamentos.
                    </p>
                </div>
                <Link href="/dashboard/catalogo">
                    <Button>Ir para o Catálogo</Button>
                </Link>
            </div>
        )}
    </div>
  )
}