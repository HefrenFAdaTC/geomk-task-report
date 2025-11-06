import { useState, useEffect } from "react";
import { Plus, FileDown, LayoutList } from "lucide-react";
import { Task, TaskStats, TaskStatus } from "@/types/report";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import TaskForm from "@/components/TaskForm";
import TaskTable from "@/components/TaskTable";
import TaskSection from "@/components/TaskSection";
import JsonImporter from "@/components/JsonImporter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfGenerator";
import {
  ClipboardList,
  ListTodo,
  Loader2,
  AlertCircle,
  Target,
  Table as TableIcon,
} from "lucide-react";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    backlog: 0,
    emDesenvolvimento: 0,
    bloqueada: 0,
    totalPontos: 0,
  });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("geomk-tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Calculate stats whenever tasks change
  useEffect(() => {
    const newStats: TaskStats = {
      total: tasks.length,
      backlog: tasks.filter((t) => t.status === "Backlog").length,
      emDesenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
      bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
      totalPontos: tasks.reduce((sum, t) => sum + t.pontoFuncao, 0),
    };
    setStats(newStats);
  }, [tasks]);

  // Save tasks to localStorage
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("geomk-tasks", JSON.stringify(updatedTasks));
  };

  const handleSubmit = (data: Omit<Task, "id">) => {
    if (editingTask) {
      const updatedTasks = tasks.map((t) =>
        t.id === editingTask.id ? { ...data, id: editingTask.id } : t
      );
      saveTasks(updatedTasks);
      toast.success("Atividade atualizada com sucesso!");
    } else {
      const newTask: Task = {
        ...data,
        id: Date.now().toString(),
      };
      saveTasks([...tasks, newTask]);
      toast.success("Atividade criada com sucesso!");
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    saveTasks(updatedTasks);
    toast.success("Atividade removida com sucesso!");
  };

  const handleClearSection = (status: TaskStatus) => {
    const remaining = tasks.filter((t) => t.status !== status);
    const removedCount = tasks.length - remaining.length;
    if (removedCount === 0) {
      toast.info("Nenhuma atividade para remover nesta seção");
      return;
    }
    saveTasks(remaining);
    toast.success(`${removedCount} atividade(s) removida(s) de ${status}`);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleGeneratePDF = () => {
    if (tasks.length === 0) {
      toast.error("Adicione atividades antes de gerar o relatório");
      return;
    }
    generatePDF(tasks);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  const handleImportJson = (importedTasks: Omit<Task, "id">[]) => {
    const newTasks: Task[] = importedTasks.map((taskData) => ({
      ...taskData,
      id: Date.now().toString() + Math.random().toString(),
    }));
    saveTasks([...tasks, ...newTasks]);
    toast.success(`${newTasks.length} atividade(s) importada(s) com sucesso!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Atividade
          </Button>
          <Button
            onClick={handleGeneratePDF}
            variant="outline"
            className="gap-2"
            disabled={tasks.length === 0}
          >
            <FileDown className="h-4 w-4" />
            Gerar Relatório PDF
          </Button>
        </div>

        {/* JSON Importer */}
        <div className="mb-8">
          <JsonImporter onImport={handleImportJson} />
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingTask(null);
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
            </DialogHeader>
            <TaskForm task={editingTask || undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard title="Total de Atividades" value={stats.total} icon={ClipboardList} />
          <StatsCard
            title="Backlog"
            value={stats.backlog}
            icon={ListTodo}
            variant="warning"
          />
          <StatsCard
            title="Em Desenvolvimento"
            value={stats.emDesenvolvimento}
            icon={Loader2}
            variant="primary"
          />
          <StatsCard
            title="Bloqueadas"
            value={stats.bloqueada}
            icon={AlertCircle}
            variant="destructive"
          />
          <StatsCard
            title="Pontos de Função"
            value={stats.totalPontos}
            icon={Target}
            variant="success"
          />
        </div>

        {/* View Toggle */}
        <Tabs defaultValue="sections" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="sections" className="gap-2">
              <LayoutList className="h-4 w-4" />
              Por Seções
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Tabela Completa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <div className="space-y-4">
              <TaskSection
                title="Bloqueadas"
                tasks={tasks.filter((t) => t.status === "Bloqueada")}
                statusColor="bg-destructive/20 text-destructive"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClearAll={() => handleClearSection("Bloqueada")}
              />
              <TaskSection
                title="Em Desenvolvimento"
                tasks={tasks.filter((t) => t.status === "Em Desenvolvimento")}
                statusColor="bg-info/20 text-info"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClearAll={() => handleClearSection("Em Desenvolvimento")}
              />
              <TaskSection
                title="Backlog"
                tasks={tasks.filter((t) => t.status === "Backlog")}
                statusColor="bg-warning/20 text-warning"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClearAll={() => handleClearSection("Backlog")}
              />
            </div>
          </TabsContent>

          <TabsContent value="table">
            <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
