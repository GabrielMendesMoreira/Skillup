"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { 
  User, 
  Layers, 
  Library, 
  ShieldCheck, 
  Bell, 
  ArrowLeft, 
  GraduationCap 
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
// Importando o ThemeToggle
import { ThemeToggle } from "@/components/theme/theme-toggle"

const settingsNavItems = [
  { title: "Perfil", href: "/settings", icon: User },
  { title: "Gerenciar Setores", href: "/settings/sectors", icon: Layers },
  { title: "Gerenciar Cursos", href: "/settings/courses", icon: Library },
  { title: "Notificações", href: "/settings/notifications", icon: Bell },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      
      {/* Header Global */}
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            
            {/* 1. SkillUp agora é um Link para a Main */}
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
                <GraduationCap className="h-6 w-6" />
                SkillUp
            </Link>

            <div className="flex items-center gap-4">
                {/* 2. Botão de Tema Adicionado */}
                <ThemeToggle />

                <Link 
                    href="/dashboard" 
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 hidden md:flex")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>
            </div>
        </div>
      </header>

      {/* Container Principal */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        <div className="space-y-1 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie suas preferências de conta e do sistema.
          </p>
        </div>

        <Separator className="my-6" />

        {/* Layout Flex: Sidebar + Conteúdo */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FIXA */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2">
              {settingsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    pathname === item.href
                      ? "bg-muted hover:bg-muted font-medium text-primary"
                      : "hover:bg-transparent hover:underline text-muted-foreground",
                    "justify-start whitespace-nowrap"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* CONTEÚDO */}
          <div className="flex-1 min-w-0">
              {children}
          </div>
        </div>
      </div>
    </div>
  )
}