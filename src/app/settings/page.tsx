"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Loader2, Camera, Lock, Mail, User, Layers, Pencil, X, Check
} from 'lucide-react'

// Tipagem
type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  sector_id: string | null;
  sector_name?: string;
  total_xp: number;
  level: number;
  next_level_xp: number;
}

type Sector = {
  id: number;
  name: string;
}

const MY_BADGES = [
  { id: 1, name: "Pioneiro", icon: "🚀", color: "bg-blue-500/20 text-blue-500 border-blue-500/50" },
  { id: 2, name: "Estudioso", icon: "📚", color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50" },
  { id: 3, name: "On Fire", icon: "🔥", color: "bg-orange-500/20 text-orange-500 border-orange-500/50" },
]

export default function ProfilePage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Estado de Edição
  const [isEditing, setIsEditing] = useState(false)
  
  // Formulário
  const [formData, setFormData] = useState({ name: '', sector_id: '', email: '' })

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // Redirecionamento suave
        if (userError || !user) {
           console.log("Usuário não encontrado, redirecionando...")
           console.log(userError)
           //if (isMounted) router.push('/login') 
           return
        }

        const { data: sectorsData } = await supabase.from('sectors').select('*')
        if (isMounted && sectorsData) setSectors(sectorsData)

        const { data: profileData, error: dbError } = await supabase
          .from('profiles')
          .select(`*, sectors ( name )`)
          .eq('id', user.id)
          .single()

        if (dbError) {
            console.error("Erro ao buscar perfil:", dbError)
            // Não lança erro fatal, tenta carregar o básico
        }

        const { data: statsData } = await supabase
            .from('view_user_stats')
            .select('total_xp')
            .eq('user_id', user.id)
            .maybeSingle()

        const xp = statsData?.total_xp || 0
        const currentLevel = Math.floor(xp / 1000) + 1
        
        const userProfile: UserProfile = {
            id: user.id,
            name: profileData?.name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            avatar_url: profileData?.avatar_url,
            sector_id: profileData?.sector_id ? String(profileData.sector_id) : null,
            sector_name: profileData?.sectors?.name || "Sem Setor",
            total_xp: xp,
            level: currentLevel,
            next_level_xp: currentLevel * 1000
        }

        if (isMounted) {
            setProfile(userProfile)
            setFormData({ 
                name: userProfile.name, 
                sector_id: userProfile.sector_id || '',
                email: userProfile.email 
            })
        }

      } catch (error: any) {
        console.error("Erro fatal no loadData:", error)
        toast.error("Erro ao carregar perfil.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    loadData()

    return () => { isMounted = false }
  }, [supabase, router])

  // --- AÇÕES ---

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return; // Só permite upload se estiver editando

    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const cleanFileName = `${profile?.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(cleanFileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(cleanFileName)

      // Atualiza apenas o estado local visualmente por enquanto (ou salva direto se preferir)
      // Aqui optei por salvar direto pois upload de arquivo é uma operação distinta
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile?.id)

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      toast.success("Foto atualizada!")

    } catch (error: any) {
      toast.error("Erro no upload", { description: error.message })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                name: formData.name, 
                sector_id: formData.sector_id ? Number(formData.sector_id) : null 
            })
            .eq('id', profile?.id)

        if (profileError) throw profileError
        
        await supabase.auth.updateUser({ data: { name: formData.name } })

        let emailMessage = ""
        if (formData.email !== profile?.email) {
            const { error: emailError } = await supabase.auth.updateUser({ email: formData.email })
            if (emailError) {
                toast.error(`Erro ao atualizar email: ${emailError.message}`)
            } else {
                emailMessage = " Verifique seu NOVO email para confirmar."
            }
        }
        
        toast.success(`Perfil salvo!${emailMessage}`)
        
        const sectorName = sectors.find(s => String(s.id) === formData.sector_id)?.name
        setProfile(prev => prev ? { 
            ...prev, 
            name: formData.name, 
            sector_name: sectorName,
        } : null)
        
        setIsEditing(false) // Sai do modo de edição

    } catch (error) {
        toast.error("Erro ao salvar.")
    } finally {
        setSaving(false)
    }
  }

  const toggleEdit = (e: React.MouseEvent) => {
      e.preventDefault(); // Previne submit acidental
      if (isEditing) {
          // Cancelar: Restaura valores
          setFormData({
              name: profile?.name || '',
              sector_id: profile?.sector_id || '',
              email: profile?.email || ''
          })
      }
      setIsEditing(!isEditing)
  }

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
  if (!profile) return null

  const xpInCurrentLevel = profile.total_xp - ((profile.level - 1) * 1000)
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / 1000) * 100))

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 w-full max-w-5xl">
      
      {/* 🎮 HEADER DO PERFIL */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-1 shadow-lg w-full">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        <div className="relative bg-slate-950/30 backdrop-blur-sm p-8 flex flex-col md:flex-row items-center gap-8 text-white">
            
            {/* Avatar */}
            <div className={`relative group flex-shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Avatar 
                    className={`w-32 h-32 border-4 border-slate-900 relative shadow-xl ${isEditing ? 'hover:scale-105 transition-transform' : ''}`} 
                    onClick={() => isEditing && fileInputRef.current?.click()}
                >
                    <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-slate-800 text-white font-bold">
                        {profile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    
                    {/* Overlay apenas se estiver editando */}
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    )}
                </Avatar>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={!isEditing || uploading} />
                {uploading && <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 animate-spin text-white" />}
            </div>

            {/* Informações */}
            <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                        Nível {profile.level}
                    </Badge>
                </div>
                <p className="text-indigo-100 flex items-center justify-center md:justify-start gap-2">
                    <Layers className="w-4 h-4" /> 
                    {profile.sector_name || "Sem Setor"}
                </p>
                
                {/* Barra de XP */}
                <div className="max-w-md mt-4 space-y-1 mx-auto md:mx-0">
                    <div className="flex justify-between text-xs font-medium text-indigo-200">
                        <span>{profile.total_xp} XP</span>
                        <span>Próximo: {profile.next_level_xp} XP</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-slate-900/50" />
                </div>
            </div>

            {/* Badges */}
            <div className="hidden md:flex gap-2 flex-shrink-0">
                {MY_BADGES.map(badge => (
                    <div key={badge.id} title={badge.name} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${badge.color} bg-background/10 backdrop-blur`}>
                        <span className="text-xl">{badge.icon}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* 📝 CONTEÚDO: FORMULÁRIO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <Card className="xl:col-span-2 border-none shadow-md bg-card h-fit">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Dados Pessoais
                    </CardTitle>
                    <CardDescription>Suas informações visíveis na plataforma.</CardDescription>
                </div>
                
                {/* BOTÃO DE EDITAR / CANCELAR */}
                <Button 
                    variant={isEditing ? "secondary" : "outline"} 
                    size="sm"
                    onClick={toggleEdit}
                >
                    {isEditing ? (
                        <><X className="w-4 h-4 mr-2" /> Cancelar</>
                    ) : (
                        <><Pencil className="w-4 h-4 mr-2" /> Editar Perfil</>
                    )}
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-5">
                    
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            disabled={!isEditing} // BLOQUEADO SE NÃO ESTIVER EDITANDO
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Setor / Departamento</Label>
                            <Select 
                                value={formData.sector_id} 
                                onValueChange={(val) => setFormData({...formData, sector_id: val})}
                                disabled={!isEditing} // BLOQUEADO
                            >
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {sectors.map((sector) => (
                                        <SelectItem key={sector.id} value={String(sector.id)}>{sector.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="relative">
                                <Input 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="pl-10" 
                                    disabled={!isEditing} // BLOQUEADO
                                />
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                    
                    {/* BOTÃO SALVAR SÓ APARECE EDITANDO */}
                    {isEditing && (
                        <div className="flex justify-end pt-2 animate-in fade-in">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} 
                                Salvar Alterações
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="border-none shadow-md h-fit">
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Esqueceu sua senha? Clique abaixo para redefinir.
                    </p>
                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => router.push('/forgot-password')}
                    >
                        Redefinir Senha
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}