"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" 
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuShortcut,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

export function UserNav() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState('U')

  useEffect(() => {
    const getUserData = async () => {
      // 1. Pega o usuário da sessão
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setEmail(user.email || '')
        
        // 2. Busca os dados extras na tabela 'profiles'
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', user.id)
            .single()

        if (profile) {
            // Se tiver nome no perfil, usa. Se não, tenta metadados ou email.
            const displayName = profile.name || user.user_metadata?.name || user.email || 'U'
            setName(displayName)
            
            // Define iniciais
            setInitials(displayName.substring(0, 2).toUpperCase())
            
            // Define Avatar (se existir no banco)
            setAvatarUrl(profile.avatar_url)
        }
      }
    }
    getUserData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
            {/* Aqui ele tenta carregar a URL do banco. Se falhar, cai no Fallback */}
            <AvatarImage src={avatarUrl || ""} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Link corrigido para /settings */}
          <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}