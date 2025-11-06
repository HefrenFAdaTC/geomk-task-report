import { useForm } from "react-hook-form";
import { Task, TaskStatus } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: Omit<Task, "id">) => void;
  onCancel: () => void;
}

const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<Omit<Task, "id">>({
    defaultValues: task || {
      titulo: "",
      ticket: "",
      descricao: "",
      tempoEstimado: 1,
      pontoFuncao: 1,
      status: "Backlog",
      tipo: "",
    },
  });

  const status = watch("status");

  const handleFormSubmit = (data: Omit<Task, "id">) => {
    // Convert empty strings or "null" to default values
    const parseValue = (val: any): number => {
      if (!val || val === '' || (typeof val === 'string' && val.toLowerCase() === 'null')) {
        return 1;
      }
      const num = typeof val === 'number' ? val : parseFloat(val);
      return isNaN(num) ? 1 : num;
    };

    const cleanedData = {
      ...data,
      tempoEstimado: parseValue(data.tempoEstimado),
      pontoFuncao: parseValue(data.pontoFuncao),
      tipo: data.tipo && data.tipo.toLowerCase() !== "null" ? data.tipo : "Sem Sistema",
    };
    onSubmit(cleanedData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                {...register("titulo", { required: true })}
                placeholder="Nome da atividade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket">Ticket da Atividade *</Label>
              <Input
                id="ticket"
                {...register("ticket", { required: true })}
                placeholder="#164269"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...register("descricao", { required: true })}
              placeholder="Detalhamento da tarefa"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempoEstimado">Tempo Estimado (dias)</Label>
              <Input
                id="tempoEstimado"
                placeholder="1 ou null"
                {...register("tempoEstimado")}
              />
              <p className="text-xs text-muted-foreground">Deixe vazio ou digite "null" para valor padrão (1 dia)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pontoFuncao">Ponto de Função</Label>
              <Input
                id="pontoFuncao"
                placeholder="1 ou null"
                {...register("pontoFuncao")}
              />
              <p className="text-xs text-muted-foreground">Deixe vazio ou digite "null" para valor padrão (1 ponto)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="Em Desenvolvimento">Em Desenvolvimento</SelectItem>
                  <SelectItem value="Bloqueada">Bloqueada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Atividade / Sistema</Label>
              <Input
                id="tipo"
                {...register("tipo")}
                placeholder="Ex: Portal de Serviços, Bug, Melhoria"
              />
              <p className="text-xs text-muted-foreground">Deixe vazio ou digite "null" para "Sem Sistema"</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">{task ? "Atualizar" : "Salvar"}</Button>
          </div>
        </form>
    </div>
  );
};

export default TaskForm;
