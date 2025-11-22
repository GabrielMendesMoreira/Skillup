// src/app/(dashboard)/certificado/[id]/CertificateDisplayBasic.tsx

'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, GraduationCap } from 'lucide-react';
// Importe o tipo que definimos
type SimpleCertificateData = {
  participantName: string;
  courseTitle: string;
  completionDate: string;
  courseDuration: string;
  certificateId: string;
};

type CertificateDisplayProps = {
  data: SimpleCertificateData;
};

/**
 * Componente de Cliente para renderizar e permitir a impressão do certificado SIMPLES.
 */
export function CertificateDisplayBasic({ data }: CertificateDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  // Estilo minimalista e pronto para impressão
  const CertificateArea = () => (
    <div className="bg-white p-16 shadow-2xl border-4 border-zinc-700 w-[1000px] h-[700px] flex flex-col justify-between max-w-full print:border-none print:shadow-none print:p-0 print:m-0">
      
      {/* Título Principal */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-zinc-900 tracking-wider font-sans">
          CERTIFICADO SKILLUP
        </h1>
        <p className="text-xl text-zinc-600 mt-2">Plataforma de Treinamento Corporativo</p>
      </div>

      {/* Corpo do Certificado */}
      <div className="text-center flex-grow flex flex-col items-center justify-center space-y-4">
        
        <p className="text-3xl text-zinc-800 mb-2 font-light">
          Certificamos que
        </p>
        
        {/* Nome do Participante */}
        <h2 className="text-6xl font-black text-blue-700 border-b-4 border-dotted border-blue-200 pb-2 mb-8">
          {data.participantName}
        </h2>

        <p className="text-3xl text-zinc-800">
          concluiu com sucesso o treinamento em:
        </p>
        
        {/* Nome do Curso */}
        <p className="text-4xl font-semibold text-zinc-800 mt-2 italic">
          "{data.courseTitle}"
        </p>
      </div>

      {/* Detalhes de Conclusão e Duração */}
      <div className="flex justify-between items-start text-lg text-zinc-700 border-t pt-4">
        
        {/* Data de Conclusão */}
        <div className="flex flex-col items-start">
          <p className="font-medium flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-zinc-500" /> Data de Conclusão:
          </p>
          <p className="font-bold text-xl">{data.completionDate}</p>
        </div>
        
        {/* Duração do Curso */}
        <div className="flex flex-col items-center">
          <p className="font-medium flex items-center">
            <Clock className="w-5 h-5 mr-2 text-zinc-500" /> Duração Média:
          </p>
          <p className="font-bold text-xl">{data.courseDuration}</p>
        </div>

        {/* ID do Certificado */}
        <div className="flex flex-col items-end text-right">
          <p className="font-medium">Código de Verificação:</p>
          <p className="font-mono text-xs text-zinc-500 mt-1">{data.certificateId}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      {/* Botão de impressão */}
      <div className="mb-6 flex space-x-4 print:hidden">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <CheckCircle className="w-5 h-5 mr-2" /> Imprimir ou Salvar como PDF
        </Button>
      </div>

      <CertificateArea />
    </div>
  );
}