import { useState, useEffect } from "react";
import { Plus, FileDown } from "lucide-react";
import { Task, TaskStats } from "@/types/report";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import TaskPieChart from "@/components/TaskPieChart";
import TaskForm from "@/components/TaskForm";
import TaskTable from "@/components/TaskTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfGenerator";
import {
  ClipboardList,
  ListTodo,
  Loader2,
  AlertCircle,
  Target,
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

        {/* Form */}
        {showForm && (
          <TaskForm task={editingTask || undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

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

        {/* Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <TaskPieChart stats={stats} />
          </div>
          <div className="lg:col-span-2">
            <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
