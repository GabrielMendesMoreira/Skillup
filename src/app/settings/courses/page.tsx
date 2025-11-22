"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Loader2, Library, GraduationCap, Video, Image as ImageIcon, ExternalLink } from "lucide-react" // ✨
import { toast } from "sonner"
import { getYouTubeThumbnail } from "../../../lib/youtube"

export default function CoursesSettingsPage() {
  const supabase = createClientComponentClient()
  
  // Estados
  const [courses, setCourses] = useState<any[]>([])
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formulário
  const [title, setTitle] = useState("")
  const [videoUrl, setVideoUrl] = useState("") 
  const [customThumb, setCustomThumb] = useState("")
  const [level, setLevel] = useState<string>("iniciante")
  const [sectorId, setSectorId] = useState<string>("")
  
  // ✨ Estado derivado para Preview
  const previewImage = customThumb || getYouTubeThumbnail(videoUrl) || (title ? `https://placehold.co/600x400/png?text=${title.substring(0,3)}` : null)

  const XP_RULES: Record<string, number> = {
    iniciante: 50,
    intermediario: 100,
    expert: 200
  }

  const fetchData = async () => {
    setLoading(true)
    const { data: sectorsData } = await supabase.from("sectors").select("*")
    if (sectorsData) setSectors(sectorsData)

    const { data: coursesData } = await supabase
      .from("courses")
      .select(`*, sectors ( name )`)
      .order("id", { ascending: false })
    
    if (coursesData) setCourses(coursesData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !sectorId || !videoUrl) {
        toast.warning("Preencha todos os campos!")
        return
    }

    setIsSubmitting(true)
    
    // Lógica inteligente de Thumb
    let finalThumb = customThumb;
    if (!finalThumb) {
        finalThumb = getYouTubeThumbnail(videoUrl) || `https://placehold.co/600x400/png?text=${title.substring(0,3)}`
    }

    const xpToGive = XP_RULES[level] || 50;

    try {
        const { error } = await supabase.from("courses").insert([{
            title,
            level,
            sector_id: Number(sectorId),
            thumbnail_url: finalThumb,
            video_url: videoUrl,
            xp_reward: xpToGive
        }])

        if (error) throw error

        toast.success(`Curso criado!`)
        setTitle("")
        setVideoUrl("")
        setCustomThumb("")
        fetchData()

    } catch (error: any) {
        toast.error("Erro: " + error.message)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if(!window.confirm("Apagar curso?")) return
    const { error } = await supabase.from("courses").delete().eq("id", id)
    if (!error) {
        toast.success("Curso removido")
        setCourses(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 justify-center mb-8">
        <div className="p-2 bg-primary/10 rounded-full">
            <Library className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Gerenciar Cursos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <Card className="border-none shadow-md bg-muted/30 lg:col-span-2">
            <CardHeader>
            <CardTitle>Novo Curso</CardTitle>
            <CardDescription>O XP será calculado automaticamente pelo nível.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2 md:col-span-2">
                    <Label>Título</Label>
                    <Input placeholder="Ex: Liderança Ágil" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Setor</Label>
                    <Select value={sectorId} onValueChange={setSectorId}>
                        <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
                        <SelectContent>
                            {sectors.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Nível</Label>
                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="iniciante">Iniciante (50 XP)</SelectItem>
                            <SelectItem value="intermediario">Intermediário (100 XP)</SelectItem>
                            <SelectItem value="expert">Expert (200 XP)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Vídeo (YouTube)</Label>
                    <Input placeholder="https://..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Thumb Personalizada (Opcional)</Label>
                    <Input placeholder="https://..." value={customThumb} onChange={e => setCustomThumb(e.target.value)} />
                </div>
                <Button className="md:col-span-2 w-full mt-2" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Salvar
                </Button>
            </form>
            </CardContent>
        </Card>

        {/* ✨ COLUNA DIREITA: PREVIEW (NOVIDADE) */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pré-visualização</h3>
            <Card className="overflow-hidden">
                <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
                    {previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                            <span>Aguardando link...</span>
                        </div>
                    )}
                    {/* Badge de Nível em cima da imagem */}
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="opacity-90">{level}</Badge>
                    </div>
                </div>
                <CardContent className="p-4">
                    <h4 className="font-bold truncate">{title || "Título do Curso..."}</h4>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                         <Video className="w-3 h-3" /> {videoUrl ? "Vídeo Detectado" : "Sem vídeo"}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
            {loading ? <div className="p-8 text-center">Carregando...</div> : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Nível / XP</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                {/* Miniatura na lista */}
                                <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                </div>
                                {course.title}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{course.level} ({course.xp_reward} XP)</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  )
}