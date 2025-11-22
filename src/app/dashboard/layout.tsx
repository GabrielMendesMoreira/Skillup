import { Sidebar } from "@/components/skillup/Sidebar"
import { UserNav } from "@/components/skillup/UserNav" // Verifique se o caminho está correto
import { ThemeToggle } from "@/components/theme/theme-toggle" // Verifique se o caminho está correto
import { Toaster } from "@/components/ui/sonner";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      {/* Sidebar Fixa (Desktop) */}
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>

      {/* Conteúdo Principal (Ao lado da sidebar) */}
      <main className="md:pl-64 h-full">
        
        {/* Header Superior */}
        <div className="flex items-center p-4 border-b h-16 shadow-sm bg-background">
            {/* Mobile trigger poderia vir aqui futuramente */}
            <div className="ml-auto flex items-center space-x-4">
                <ThemeToggle />
                <UserNav />
            </div>
        </div>

        {/* Páginas filhas (Dashboard, Ranking, etc) */}
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  )
}