"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type UserData = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
  sector_id: number | null
  // Adicione outros campos que você usa sempre aqui
}

type UserContextType = {
  user: UserData | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setUser(null)
        return
      }

      // Busca dados do Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          name: profile.name,
          avatar_url: profile.avatar_url,
          role: profile.role,
          sector_id: profile.sector_id
        })
      }
    } catch (error) {
      console.error("Erro ao carregar usuário global", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

// O Hook Mágico 🪄
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}