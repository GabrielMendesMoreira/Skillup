import { NextResponse } from 'next/server'
// Importa a função que cria o cliente Supabase para o servidor (com cookies)
import { createClient } from '@/lib/supabase/server' 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // next=/set-new-password ou next=/dashboard, conforme enviado no emailRedirectTo
  const next = searchParams.get('next') || '/dashboard' 

  if (code) {
    // ⚠️ CRÍTICO: Cria o cliente SERVER-SIDE para interagir com a sessão (cookies)
    const supabase = createClient()
    
    // Troca o código temporário por uma sessão de usuário real (confirma email ou recupera senha)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sucesso! O usuário está logado. Redireciona para o destino final (next).
      return NextResponse.redirect(new URL(next, request.url))
    }
    
    // Em caso de erro na troca de código (token expirado ou inválido)
    console.error("Erro na troca de código Supabase:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Link inválido ou expirado.')}`, request.url))
  }

  // Se houver erro ou falta de código, redireciona para a página de login
  return NextResponse.redirect(new URL('/login', request.url))
}

import { supabase } from '@/lib/supabase' 
// ...
const base = supabase // base é o cliente de browser
// ...
const { error } = await base.auth.exchangeCodeForSession(code)