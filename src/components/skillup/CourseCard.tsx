"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, CheckCircle, Award } from "lucide-react"

interface CourseCardProps {
  course: {
    id?: number // Supabase original
    course_id?: number // Mapeado
    title: string
    thumbnail_url: string | null
    level: string
    sector_name?: string // Mapeado
    sectors?: { name: string } // Supabase original
    total_lessons: number
    completed_lessons: number
  }
}

export function CourseCard({ course }: CourseCardProps) {
  // 1. Resolve o ID (pode vir como id ou course_id)
  const validId = course.course_id || course.id;

  // 2. Resolve o Nome do Setor
  const sectorDisplay = course.sector_name || course.sectors?.name || "Geral";

  const progress = course.total_lessons > 0 
    ? Math.round((course.completed_lessons / course.total_lessons) * 100) 
    : 0
  
  const isCompleted = progress === 100

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-all group h-full">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {course.thumbnail_url ? (
            <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
        ) : (
            <div className="flex items-center justify-center h-full bg-slate-200 dark:bg-slate-800">
                <PlayCircle className="w-12 h-12 text-muted-foreground/50" />
            </div>
        )}
        
        <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-md border-none">
                {course.level}
            </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center mb-2">
             {/* AQUI: Mostra o setor correto */}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {sectorDisplay}
            </span>
        </div>
        <h3 className="font-bold text-lg line-clamp-2 leading-tight min-h-[3rem]">
            {course.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1">
        <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 pb-4">
        {isCompleted ? (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 cursor-default">
                <Award className="w-4 h-4" />
                Concluído
            </Button>
        ) : (
            // AQUI: Link corrigido para /dashboard/cursos/ID
            <Link href={`/dashboard/cursos/${validId}`} className="w-full">
                <Button className="w-full gap-2" variant={progress > 0 ? "secondary" : "default"}>
                    {progress > 0 ? <PlayCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    {progress > 0 ? "Continuar" : "Assistir"}
                </Button>
            </Link>
        )}
      </CardFooter>
    </Card>
  )
}