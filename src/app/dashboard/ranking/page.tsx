"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Filter, Star, Crown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type RankingUser = {
  user_id: string
  name: string
  avatar_url: string | null
  sector_name: string | null
  total_xp: number
  modules_completed: number
}

const podiumColors = {
  1: "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", 
  2: "border-zinc-400/50 bg-zinc-400/10 text-zinc-600 dark:text-zinc-300",         
  3: "border-amber-700/50 bg-amber-700/10 text-amber-700 dark:text-amber-500",
}
 
export default function RankingPage() {
  const supabase = createClientComponentClient()
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [filteredRanking, setFilteredRanking] = useState<RankingUser[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: rankingData, error } = await supabase
        .from("view_ranking_global")
        .select("*")
        .order("total_xp", { ascending: false })

      if (!error && rankingData) {
        setRanking(rankingData)
        setFilteredRanking(rankingData)
        
        const uniqueSectors = Array.from(new Set(rankingData.map((u) => u.sector_name).filter(Boolean))) as string[]
        setSectors(uniqueSectors)
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  useEffect(() => {
    if (selectedSector === "all") {
      setFilteredRanking(ranking)
    } else {
      setFilteredRanking(ranking.filter((u) => u.sector_name === selectedSector))
    }
  }, [selectedSector, ranking])

  const top3 = filteredRanking.slice(0, 3)
  const restOfList = filteredRanking.slice(3)

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranking Global
          </h2>
          <p className="text-muted-foreground">
            Acompanhe quem está liderando o aprendizado na empresa.
          </p>
        </div>

        <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por Setor" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos os Setores</SelectItem>
                {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                    {sector}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>

      {/* 🥇 PÓDIO (Top 3) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
          {/* 🥈 2º Lugar */}
          <div className="order-2 md:order-1">
            {top3[1] && <PodiumCard user={top3[1]} position={2} />}
          </div>
          
          {/* 🥇 1º Lugar */}
          <div className="order-1 md:order-2 -mt-10">
            {top3[0] && <PodiumCard user={top3[0]} position={1} isWinner />}
          </div>
          
          {/* 🥉 3º Lugar */}
          <div className="order-3 md:order-3">
            {top3[2] && <PodiumCard user={top3[2]} position={3} />}
          </div>
        </div>
      )}

      {/* 📋 LISTA GERAL (Resto) */}
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Classificação Geral</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">Posição</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden md:table-cell">Setor</TableHead>
                <TableHead className="text-right">XP Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {restOfList.map((user, index) => (
                <TableRow key={user.user_id}>
                    <TableCell className="font-medium text-muted-foreground">
                        #{index + 4}
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{user.sector_name}</span>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="font-normal">
                            {user.sector_name || "Geral"}
                        </Badge>
                    </TableCell>
                    
                    {/* ✨ AQUI ESTÁ A MELHORIA VISUAL DO XP ✨ */}
                    <TableCell className="text-right">
                        <div className="flex justify-end">
                            <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5">
                                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                                {user.total_xp} XP
                            </Badge>
                        </div>
                    </TableCell>

                </TableRow>
                ))}
                
                {restOfList.length === 0 && top3.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            Nenhum registro encontrado no ranking.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function PodiumCard({ user, position, isWinner = false }: { user: RankingUser, position: number, isWinner?: boolean }) {
    const colorClass = podiumColors[position as keyof typeof podiumColors]
    
    return (
        <Card className={cn(
            "relative overflow-hidden transition-all hover:scale-105 border-2 flex flex-col justify-end", 
            colorClass,
            isWinner ? "h-72 shadow-xl border-primary/50 z-10" : "h-60 opacity-90"
        )}>
            {isWinner && (
                <div className="absolute top-0 right-0 p-4 opacity-20 text-yellow-500">
                    <Crown className="w-20 h-20 rotate-12" />
                </div>
            )}
            
            <CardContent className="flex flex-col items-center justify-end h-full gap-3 pb-6 relative z-10">
                <div className="relative">
                    <Avatar className={cn("border-4", isWinner ? "w-24 h-24 border-yellow-500 shadow-lg" : "w-16 h-16 border-current")}>
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        "absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-sm font-bold bg-background border shadow-sm",
                        isWinner ? "text-yellow-500 border-yellow-500" : "text-current border-current"
                    )}>
                        #{position}
                    </div>
                </div>

                <div className="text-center mt-2">
                    <h3 className="font-bold text-lg truncate max-w-[150px] mx-auto">{user.name}</h3>
                    <p className="text-xs opacity-80 mb-2 uppercase tracking-wider">{user.sector_name}</p>
                    <Badge variant={isWinner ? "default" : "secondary"} className="mt-1 text-md px-3 py-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {user.total_xp} XP
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}