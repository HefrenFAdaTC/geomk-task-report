import { useState } from "react";
import { Task } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  statusColor: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const typeColors: Record<string, string> = {
  Bug: "bg-destructive/10 text-destructive",
  Melhoria: "bg-success/10 text-success",
  "Nova Funcionalidade": "bg-primary/10 text-primary",
  Outro: "bg-muted text-muted-foreground",
};

const TaskSection = ({ title, tasks, statusColor, onEdit, onDelete, onClearAll }: TaskSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tasks.length === 0) return null;

  const totalPontos = tasks.reduce((sum, task) => sum + task.pontoFuncao, 0);

  return (
    <Card className="mb-4">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge className={statusColor}>{tasks.length}</Badge>
            <Badge variant="secondary" className="bg-muted text-foreground">
              {totalPontos} pontos de função
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onClearAll(); }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir todas
            </Button>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{task.titulo}</h4>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{task.ticket}</code>
                      <Badge variant="secondary" className={typeColors[task.tipo] || typeColors.Outro}>
                        {task.tipo}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.descricao}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        ⏱️ <strong>{task.tempoEstimado}</strong> dias
                      </span>
                      <span className="text-muted-foreground">
                        🎯 <strong>{task.pontoFuncao}</strong> pontos
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TaskSection;
