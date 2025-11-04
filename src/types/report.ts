export type TaskStatus = "Backlog" | "Em Desenvolvimento" | "Bloqueada";

export interface Task {
  id: string;
  titulo: string;
  ticket: string;
  descricao: string;
  tempoEstimado: number;
  pontoFuncao: number;
  status: TaskStatus;
  tipo: string;
}

export interface TaskStats {
  total: number;
  backlog: number;
  emDesenvolvimento: number;
  bloqueada: number;
  totalPontos: number;
}
