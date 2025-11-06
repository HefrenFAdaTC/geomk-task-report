import { useRef } from "react";
import { Task } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface JsonImporterProps {
  onImport: (tasks: Omit<Task, "id">[]) => void;
}

const taskSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  ticket: z.string().min(1, "Ticket é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  tempoEstimado: z.number().min(1, "Tempo estimado deve ser no mínimo 1"),
  pontoFuncao: z.number().min(1, "Ponto de função deve ser no mínimo 1"),
  status: z.enum(["Backlog", "Em Desenvolvimento", "Bloqueada"]),
  tipo: z.string().min(1, "Tipo é obrigatório"),
});

const jsonSchema = z.array(taskSchema);

const JsonImporter = ({ onImport }: JsonImporterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo JSON válido",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data
      const validatedTasks = jsonSchema.parse(data) as Omit<Task, "id">[];

      onImport(validatedTasks);

      toast({
        title: "Sucesso!",
        description: `${validatedTasks.length} atividade(s) importada(s) com sucesso`,
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing JSON:", error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de Validação",
          description: `Dados inválidos: ${error.errors[0].message}`,
          variant: "destructive",
        });
      } else if (error instanceof SyntaxError) {
        toast({
          title: "Erro",
          description: "Arquivo JSON inválido ou malformado",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao importar arquivo JSON",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Importar Atividades
        </CardTitle>
        <CardDescription>
          Carregue um arquivo JSON com as atividades para preencher o formulário automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Selecionar Arquivo JSON
        </Button>
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Formato esperado:</p>
          <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
{`[
  {
    "titulo": "Nome da atividade",
    "ticket": "#164269",
    "descricao": "Descrição detalhada",
    "tempoEstimado": 5,
    "pontoFuncao": 3,
    "status": "Backlog",
    "tipo": "Bug"
  }
]`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonImporter;
