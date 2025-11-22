// src/components/skillup/LegalDocument.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Componente genérico para exibir documentos legais (Termos de Uso, Política de Privacidade).
 * Usa o Card do Shadcn para um visual limpo.
 */
interface LegalDocumentProps {
  title: string;
  children: React.ReactNode;
}

export function LegalDocument({ title, children }: LegalDocumentProps) {
  return (
    <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm sm:text-base">
            <div className="prose max-w-none dark:prose-invert">
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}