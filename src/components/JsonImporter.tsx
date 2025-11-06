import { useRef } from "react";
import { Task, TaskStatus } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface JsonImporterProps {
  onImport: (tasks: Omit<Task, "id">[]) => void;
}

// Schema for the new JSON structure from uploaded files
const uploadedTaskSchema = z.object({
  ticket: z.union([z.number(), z.string(), z.null()]),
  sistema: z.union([z.string(), z.null()]).optional(),
  status: z.string(),
  title: z.string().min(1, "Título é obrigatório"),
  estimativa: z.union([z.number(), z.string(), z.null()]).optional(),
  contagem_apf: z.union([z.number(), z.string(), z.null()]).optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
});

// Schema for the original structure (backward compatibility)
const originalTaskSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  ticket: z.string().min(1, "Ticket é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  tempoEstimado: z.number().min(1, "Tempo estimado deve ser no mínimo 1"),
  pontoFuncao: z.number().min(1, "Ponto de função deve ser no mínimo 1"),
  status: z.enum(["Backlog", "Em Desenvolvimento", "Bloqueada"]),
  tipo: z.string().min(1, "Tipo é obrigatório"),
});

const jsonSchema = z.array(z.union([uploadedTaskSchema, originalTaskSchema]));

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
      const validatedData = jsonSchema.parse(data);

      // Helpers to normalize values
      const parseNumber = (val: any, def: number = 0): number => {
        if (val === undefined || val === null) return def;
        if (typeof val === "number") {
          if (isNaN(val)) return def;
          return Math.max(0, val); // Ensure non-negative
        }
        if (typeof val === "string") {
          const trimmed = val.trim().toLowerCase();
          if (trimmed === "" || trimmed === "null") return def;
          const num = parseFloat(trimmed.replace(",", "."));
          if (isNaN(num)) return def;
          return Math.max(0, num); // Ensure non-negative
        }
        return def;
      };
      const parseSystem = (val: any): string => {
        if (val === undefined || val === null) return "null";
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (trimmed === "" || trimmed.toLowerCase() === "null") return "null";
          return trimmed;
        }
        return "null";
      };

      // Map to internal structure
      const mappedTasks: Omit<Task, "id">[] = validatedData.map((item: any) => {
        // Check if it's the new format or original format
        if ("title" in item) {
          // New format - map fields
          const ticketStr = item.ticket === null || item.ticket === undefined
            ? "#N/A"
            : typeof item.ticket === "number" 
            ? `#${item.ticket}` 
            : item.ticket.startsWith("#") ? item.ticket : `#${item.ticket}`;
          
          // Convert status "Bloqueado" to "Bloqueada"
          let status: TaskStatus = "Backlog";
          if (item.status === "Em Desenvolvimento") {
            status = "Em Desenvolvimento";
          } else if (item.status === "Bloqueado" || item.status === "Bloqueada") {
            status = "Bloqueada";
          } else if (item.status === "Backlog") {
            status = "Backlog";
          }

          return {
            titulo: item.title,
            ticket: ticketStr,
            descricao: item.description,
            tempoEstimado: parseNumber(item.estimativa, 0),
            pontoFuncao: parseNumber(item.contagem_apf, 0),
            status: status,
            tipo: parseSystem(item.sistema),
          };
        } else {
          // Original format - return as is
          return item as Omit<Task, "id">;
        }
      });

      onImport(mappedTasks);

      toast({
        title: "Sucesso!",
        description: `${mappedTasks.length} atividade(s) importada(s) com sucesso`,
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
          <p className="font-semibold mb-2">Formatos aceitos:</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-1">Formato 1 (Freshdesk):</p>
              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
{`[
  {
    "ticket": 164269,
    "sistema": "Portal de Serviços",
    "status": "Em Desenvolvimento",
    "title": "Título da atividade",
    "estimativa": 8,
    "contagem_apf": null,
    "description": "Descrição detalhada"
  }
]`}
              </pre>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Formato 2 (Original):</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonImporter;
