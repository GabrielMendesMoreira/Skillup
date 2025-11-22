// src/app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, GraduationCap, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Array de funcionalidades para o bloco de destaque
const features = [
  {
    icon: Zap,
    title: "Acelere o Conhecimento",
    description: "Treinamentos práticos e diretos ao ponto para o seu time decolar.",
  },
  {
    icon: GraduationCap,
    title: "Trilhas Personalizadas",
    description: "Crie percursos de aprendizado adaptados às necessidades de cada setor.",
  },
  {
    icon: Users,
    title: "Gestão Simples",
    description: "Acompanhe o progresso e o engajamento dos colaboradores em tempo real.",
  },
];

export default function LandingPage() {
  return (

    
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar Simples */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center text-xl font-bold text-primary">
          <GraduationCap className="h-6 w-6 mr-2" />
          SkillUp
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button variant="ghost">Cadastrar</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Seção Hero */}
       
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 text-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                SkillUp: A Plataforma de Treinamento Corporativo
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Impulsione o crescimento da sua equipe com cursos personalizados e gestão de aprendizado simplificada.
              </p>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Comece Agora!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Funcionalidades */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 SkillUp. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/termos-de-uso" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Termos de Serviço
          </Link>
        </nav>
      </footer>
    </div>
  );
}