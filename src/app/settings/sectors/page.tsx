"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Loader2, Layers } from "lucide-react"
import { toast } from "sonner"

type Sector = {
  id: number
  name: string
}

export default function SectorsPage() {
  const supabase = createClientComponentClient()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [newSector, setNewSector] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Buscar Setores
  const fetchSectors = async () => {
    const { data, error } = await supabase.from("sectors").select("*").order("id", { ascending: true })
    if (error) toast.error("Erro ao carregar setores")
    else setSectors(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSectors()
  }, [])

  // 2. Adicionar Setor
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSector.trim()) return

    setIsSubmitting(true)
    const { error } = await supabase.from("sectors").insert([{ name: newSector }])

    if (error) {
      toast.error("Erro ao criar setor (verifique se já existe).")
    } else {
      toast.success("Setor adicionado!")
      setNewSector("")
      fetchSectors()
    }
    setIsSubmitting(false)
  }

  // 3. Deletar Setor
  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Tem certeza? Isso pode afetar usuários vinculados a este setor.")
    if (!confirm) return

    const { error } = await supabase.from("sectors").delete().eq("id", id)
    if (error) {
      toast.error("Erro ao deletar. O setor pode estar em uso.")
    } else {
      toast.success("Setor removido.")
      setSectors((prev) => prev.filter((s) => s.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Layers className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Gerenciar Setores</h2>
      </div>

      {/* Formulário de Adição */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Setor</CardTitle>
          <CardDescription>Crie departamentos para categorizar cursos e usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Input 
                placeholder="Ex: Marketing, TI, Vendas..." 
                value={newSector} 
                onChange={(e) => setNewSector(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !newSector}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Setores */}
      <Card>
        <CardHeader>
          <CardTitle>Setores Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum setor cadastrado.</TableCell>
                    </TableRow>
                ) : (
                    sectors.map((sector) => (
                    <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.id}</TableCell>
                        <TableCell>{sector.name}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sector.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}