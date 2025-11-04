import { Task } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  Backlog: "bg-warning/20 text-warning border-warning/30",
  "Em Desenvolvimento": "bg-info/20 text-info border-info/30",
  Bloqueada: "bg-destructive/20 text-destructive border-destructive/30",
};

const typeColors = {
  Bug: "bg-destructive/10 text-destructive",
  Melhoria: "bg-success/10 text-success",
  "Nova Funcionalidade": "bg-primary/10 text-primary",
  Outro: "bg-muted text-muted-foreground",
};

const TaskTable = ({ tasks, onEdit, onDelete }: TaskTableProps) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhuma atividade cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Tempo (dias)</TableHead>
                <TableHead className="text-center">Pontos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.titulo}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{task.ticket}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={typeColors[task.tipo] || typeColors.Outro}>
                      {task.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{task.tempoEstimado}</TableCell>
                  <TableCell className="text-center font-semibold">{task.pontoFuncao}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTable;
