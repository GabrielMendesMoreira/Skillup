// src/app/(legal)/termos-de-uso/page.tsx
import { LegalDocument } from "@/components/skillup/LegalDocument";

export const metadata = {
  title: "Termos de Uso | SkillUp",
  description: "Termos e Condições de Uso da Plataforma SkillUp."
};

/**
 * Página Server Component para os Termos de Uso.
 * Totalmente estática e otimizada pelo Next.js.
 */
export default function TermosDeUsoPage() {
  return (
    <LegalDocument title="Termos de Uso da Plataforma SkillUp">
      <p className="text-gray-500 dark:text-gray-400">
        **Última Atualização:** Novembro de 2025
      </p>

      {/* --- Seção 1: Aceitação --- */}
      <h2 className="text-xl font-semibold mt-6 mb-3">1. Aceitação dos Termos</h2>
      <p>
        Ao acessar ou utilizar a plataforma **SkillUp** ("Serviço"), você concorda em cumprir e
        estar sujeito a estes Termos de Uso. Caso não concorde com qualquer parte
        dos termos, você não deve utilizar o Serviço.
      </p>

      {/* --- Seção 2: O Serviço --- */}
      <h2 className="text-xl font-semibold mt-6 mb-3">2. O Serviço e Uso da Plataforma</h2>
      <p>
        O SkillUp é uma plataforma SaaS de Treinamento Corporativo (LMS). O acesso é
        concedido mediante assinatura da sua empresa e destina-se exclusivamente
        ao aprimoramento profissional do usuário.
      </p>
      <ul>
        <li>**Conta de Usuário:** Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram sob sua conta.</li>
        <li>**Conduta:** É proibido o uso do Serviço para fins ilícitos ou que violem estes Termos.</li>
      </ul>

      {/* --- Seção 3: Propriedade Intelectual --- */}
      <h2 className="text-xl font-semibold mt-6 mb-3">3. Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo disponibilizado no SkillUp (cursos, vídeos, textos, logotipos, etc.)
        é de propriedade exclusiva da SkillUp ou de seus licenciadores, sendo protegido pela
        legislação brasileira de **Direito Autoral** (Lei 9.610/98). A utilização do conteúdo
        é restrita ao ambiente da plataforma e para fins de aprendizado pessoal,
        sendo proibida a reprodução, distribuição ou exibição pública sem autorização.
      </p>

      {/* --- Seção 4: Legislação Aplicável (Marco Civil e LGPD) --- */}
      <h2 className="text-xl font-semibold mt-6 mb-3">4. Legislação Brasileira</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil.
      </p>
      <ul>
        <li>**Marco Civil da Internet (Lei 12.965/14):** A SkillUp atua em conformidade com as diretrizes de neutralidade de rede, privacidade e proteção de dados pessoais.</li>
        <li>**Lei Geral de Proteção de Dados (LGPD - Lei 13.709/18):** O tratamento dos seus dados pessoais é detalhado na nossa Política de Privacidade.</li>
      </ul>

      {/* --- Seção 5: Disposições Finais --- */}
      <h2 className="text-xl font-semibold mt-6 mb-3">5. Disposições Finais</h2>
      <p>
        Reservamos o direito de modificar estes Termos a qualquer momento.
        Seu uso continuado do Serviço após tais modificações constitui sua aceitação
        dos novos Termos.
      </p>
      <p className="text-center italic mt-8">
        Para dúvidas, entre em contato através dos canais de suporte corporativo.
      </p>
    </LegalDocument>
  );
}