import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStats } from "@/types/report";

interface TaskPieChartProps {
  stats: TaskStats;
}

const COLORS = {
  Backlog: "#f59e0b",
  "Em Desenvolvimento": "#0ea5e9",
  Bloqueada: "#ef4444",
};

const TaskPieChart = ({ stats }: TaskPieChartProps) => {
  const data = [
    { name: "Backlog", value: stats.backlog },
    { name: "Em Desenvolvimento", value: stats.emDesenvolvimento },
    { name: "Bloqueada", value: stats.bloqueada },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Atividades</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhuma atividade cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TaskPieChart;
