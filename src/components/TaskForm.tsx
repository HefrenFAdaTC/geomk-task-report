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

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{task ? "Editar Atividade" : "Nova Atividade"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="tempoEstimado">Tempo Estimado (dias) *</Label>
              <Input
                id="tempoEstimado"
                type="number"
                min="1"
                {...register("tempoEstimado", { required: true, valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pontoFuncao">Ponto de Função *</Label>
              <Input
                id="pontoFuncao"
                type="number"
                min="1"
                {...register("pontoFuncao", { required: true, valueAsNumber: true })}
              />
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
              <Label htmlFor="tipo">Tipo de Atividade *</Label>
              <Input
                id="tipo"
                {...register("tipo", { required: true })}
                placeholder="Ex: Bug, Melhoria, Nova Funcionalidade"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">{task ? "Atualizar" : "Salvar"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
