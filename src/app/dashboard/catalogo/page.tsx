"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourseCard } from "@/components/skillup/CourseCard"
import { Search, Filter, X, Loader2 } from "lucide-react"

export default function CatalogoPage() {
  const supabase = createClientComponentClient()
  const [courses, setCourses] = useState<any[]>([])
  const [progressMap, setProgressMap] = useState<Record<number, number>>({})
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("todos")
  const [levelFilter, setLevelFilter] = useState("todos")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      // 1. Pega o usuário atual para buscar o progresso dele
      const { data: { user } } = await supabase.auth.getUser()

      // 2. Busca setores
      const { data: sData } = await supabase.from('sectors').select('*')
      if (sData) setSectors(sData)

      // 3. Busca TODOS os cursos
      const { data: cData } = await supabase
        .from('courses')
        .select('*, sectors(name)')
        .order('id', { ascending: false })
      
      if (cData) setCourses(cData)

      // 4. Busca o progresso DO USUÁRIO (se estiver logado)
      if (user) {
        const { data: pData } = await supabase
            .from('user_progress')
            .select('course_id, progress_percent')
            .eq('user_id', user.id)
        
        // Cria um mapa { id_curso: porcentagem } para acesso rápido
        const pMap: Record<number, number> = {}
        pData?.forEach((p: any) => {
            pMap[p.course_id] = p.progress_percent || 0
        })
        setProgressMap(pMap)
      }

      setLoading(false)
    }
    loadData()
  }, [supabase])

  // Lógica de Filtragem
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase())
    const matchesSector = sectorFilter === "todos" || String(course.sector_id) === sectorFilter
    const matchesLevel = levelFilter === "todos" || course.level === levelFilter

    return matchesSearch && matchesSector && matchesLevel
  })

  const clearFilters = () => {
    setSearch("")
    setSectorFilter("todos")
    setLevelFilter("todos")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Catálogo de Cursos</h1>
        <p className="text-muted-foreground">Explore todo o conteúdo disponível na plataforma.</p>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-card p-4 rounded-xl shadow-sm border space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Pesquisar por nome..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="w-full md:w-[200px]">
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Setor" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos os Setores</SelectItem>
                    {sectors.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="w-full md:w-[180px]">
             <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos Níveis</SelectItem>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {(search || sectorFilter !== "todos" || levelFilter !== "todos") && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0 text-muted-foreground hover:text-red-500">
                <X className="w-4 h-4" />
            </Button>
        )}
      </div>

      {loading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
         </div>
      ) : (
        <div>
            <div className="mb-4 text-sm text-muted-foreground">
                Encontrados <strong>{filteredCourses.length}</strong> cursos
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                    <CourseCard 
                        key={course.id} 
                        course={{
                            ...course,
                            // INJETA A PORCENTAGEM QUE BUSCAMOS NO BANCO
                            progress_percent: progressMap[course.id] || 0,
                            total_lessons: 1, 
                            completed_lessons: 0
                        }} 
                    />
                ))}
                
                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                        <p>Nenhum curso encontrado.</p>
                        <Button variant="link" onClick={clearFilters}>Limpar filtros</Button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  )
}