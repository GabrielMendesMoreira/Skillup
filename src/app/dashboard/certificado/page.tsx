'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Search } from 'lucide-react';

/**
 * Página Index do Certificado (Busca e Validação)
 */
export default function CertificateIndexPage() {
  const [certificateId, setCertificateId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!certificateId.trim()) {
      setError('Por favor, insira o Código de Verificação do Certificado.');
      return;
    }

    // Usando uma expressão regular básica para validar o formato UUID, 
    // já que o ID é gerado como UUID (ou similar) no Supabase.
    // Ajuste este regex se você usa um formato de ID diferente (ex: ID simples).
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Simplificado para o Hackathon: aceitar qualquer string não vazia.
    // if (!uuidRegex.test(certificateId.trim())) {
    //   setError('Formato do código inválido. Verifique o código no certificado.');
    //   return;
    // }

    // Redireciona para a rota dinâmica que renderiza o certificado
    router.push(`/certificado/${certificateId.trim()}`);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Search className="w-6 h-6 mr-2 text-zinc-700" /> 
            Validar Certificado SkillUp
          </CardTitle>
          <CardDescription>
            Insira o Código de Verificação do seu certificado para visualizar ou imprimi-lo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                id="certificateId"
                type="text"
                placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="font-mono text-base"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Buscar Certificado
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}