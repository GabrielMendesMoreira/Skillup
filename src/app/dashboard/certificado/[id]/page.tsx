// src/app/(dashboard)/certificado/[id]/page.tsx

import { getSimpleCertificateData } from '@/actions/content'; 
import { notFound } from 'next/navigation';
import { CertificateDisplayBasic } from './CertificateDisplayBasic'; // Novo nome

type CertificatePageProps = {
  params: {
    id: string; // O ID do certificado (UUID)
  };
};

/**
 * Componente de Servidor para buscar os dados e renderizar.
 */
export default async function CertificatePage({ params }: CertificatePageProps) {
  const { id } = params;

  try {
    // Chama a função que busca e formata todos os dados
    const certificateData = await getSimpleCertificateData(id);

    return <CertificateDisplayBasic data={certificateData} />;
  } catch (e) {
    // Se getSimpleCertificateData chamar notFound(), o Next.js lida com isso.
    console.error("Erro ao processar certificado:", e);
    return notFound(); 
  }
}