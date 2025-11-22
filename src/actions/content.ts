'use server';


import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase'
import { Course } from '@/types';

type SimpleCertificateData = {
  participantName: string;
  courseTitle: string;
  completionDate: string;
  courseDuration: string; // Ex: "10 horas"
  certificateId: string; // O ID único que você usa
};


export async function getCourses(): Promise<Course[]> {
    const base = supabase


    const {data,error} = await base
        .from('courses')
        .select('*')
        .order('created at',{ascending:false});
    
        if(error){
            console.log(error.message)
            return []
        }
        return (data as Course[]) || [];
}

export async function getSimpleCertificateData(certificateId: string): Promise<SimpleCertificateData> {
  const base = supabase;

  // 1. Busca o registro do certificado e faz JOIN com o curso
  const { data: certificate, error: certError } = await base
    .from('certificates') // Use o nome exato da sua tabela
    .select(`
      id,
      issued_at,
      user_id,
      course:course_id(title, duration_hours)
    `) 
    .eq('id', certificateId) // Use 'id' se for o UUID que você está passando
    .single();

  if (certError || !certificate || !certificate.course) {
    console.error('Erro ao buscar certificado:', certError?.message);
    notFound();
  }

  // 2. Busca o nome/email do usuário (para o nome do participante)
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(certificate.user_id);

  if (userError || !userData.user) {
    console.error('Erro ao buscar usuário:', userError?.message);
    // Para o Hackathon, usamos um nome genérico se o usuário não for encontrado
    // Em produção, você deve ter uma tabela 'profiles' para o nome completo.
  }
  
  // Extração básica do nome do email: "joao.silva@corp.com" -> "JOAO SILVA"
  const emailPart = userData.user?.email || 'participante@skillup.com';
  const participantName = emailPart.split('@')[0].replace(/[.\-_]/g, ' ').toUpperCase();


  // 3. Formatação
  const completionDate = new Date(certificate.issued_at).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const courseDuration = `${(certificate.course as unknown as { duration_hours: number }).duration_hours || 0} horas`;

  return {
    participantName,
    courseTitle: (certificate.course as unknown as { title: string }).title,
    completionDate: completionDate,
    courseDuration: courseDuration,
    certificateId: certificate.id, // O UUID do registro
  };
}