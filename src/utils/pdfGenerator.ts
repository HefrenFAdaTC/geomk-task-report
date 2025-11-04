import jsPDF from "jspdf";
import { Task } from "@/types/report";

export const generatePDF = (tasks: Task[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Atividades Previstas", pageWidth / 2, yPos, { align: "center" });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Empresa: GeoMK Soluções", 20, yPos);
  
  yPos += 7;
  doc.text("Cliente: Sebrae Ceará", 20, yPos);
  
  yPos += 7;
  const currentDate = new Date().toLocaleDateString("pt-BR");
  doc.text(`Data: ${currentDate}`, 20, yPos);

  yPos += 15;
  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Group tasks by status
  const tasksByStatus = {
    Backlog: tasks.filter((t) => t.status === "Backlog"),
    "Em Desenvolvimento": tasks.filter((t) => t.status === "Em Desenvolvimento"),
    Bloqueada: tasks.filter((t) => t.status === "Bloqueada"),
  };

  // Render each section
  Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
    if (statusTasks.length === 0) return;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${status} (${statusTasks.length})`, 20, yPos);
    yPos += 8;

    // Tasks in this section
    statusTasks.forEach((task, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. [${task.tipo}] - ${task.titulo}`, 25, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const description = doc.splitTextToSize(`Descrição: ${task.descricao}`, pageWidth - 50);
      doc.text(description, 25, yPos);
      yPos += description.length * 5 + 2;

      doc.text(`Ticket: ${task.ticket}`, 25, yPos);
      yPos += 5;

      doc.text(`Tempo estimado: ${task.tempoEstimado} dias`, 25, yPos);
      yPos += 5;

      doc.text(`Ponto de Função: ${task.pontoFuncao}`, 25, yPos);
      yPos += 5;

      doc.text(`Tipo: ${task.tipo}`, 25, yPos);
      yPos += 5;

      doc.text(`Status: ${task.status}`, 25, yPos);
      yPos += 10;
    });

    yPos += 5;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Gerado automaticamente por Relatório GeoMK © ${new Date().getFullYear()}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, doc.internal.pageSize.height - 10, {
      align: "right",
    });
  }

  // Save the PDF
  doc.save(`relatorio-atividades-${currentDate.replace(/\//g, "-")}.pdf`);
};
