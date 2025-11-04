import jsPDF from "jspdf";
import { Task } from "@/types/report";

const createPieChartCanvas = (tasks: Task[]): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  const stats = {
    backlog: tasks.filter((t) => t.status === "Backlog").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
  };

  const total = stats.backlog + stats.desenvolvimento + stats.bloqueada;
  if (total === 0) return canvas;

  const data = [
    { label: "Bloqueadas", value: stats.bloqueada, color: "#ef4444" },
    { label: "Em Desenvolvimento", value: stats.desenvolvimento, color: "#0ea5e9" },
    { label: "Backlog", value: stats.backlog, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const centerX = 200;
  const centerY = 180;
  const radius = 120;

  let currentAngle = -Math.PI / 2;

  // Draw pie slices
  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius + 40);
    const labelY = centerY + Math.sin(labelAngle) * (radius + 40);
    
    ctx.fillStyle = "#000000";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    const percentage = ((item.value / total) * 100).toFixed(0);
    ctx.fillText(`${item.label}`, labelX, labelY - 5);
    ctx.fillText(`${percentage}%`, labelX, labelY + 10);

    currentAngle += sliceAngle;
  });

  // Draw legend
  let legendY = 340;
  data.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(50, legendY, 20, 20);
    ctx.fillStyle = "#000000";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${item.label}: ${item.value}`, 75, legendY + 15);
    legendY += 25;
  });

  return canvas;
};

export const generatePDF = async (tasks: Task[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Header with gradient-like effect
  doc.setFillColor(23, 37, 84);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Atividades Previstas", pageWidth / 2, 25, { align: "center" });

  // Company info box
  doc.setFillColor(240, 244, 248);
  doc.rect(15, 55, pageWidth - 30, 25, "F");
  
  yPos = 65;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("Empresa: GeoMK Soluções", 20, yPos);
  doc.text("Cliente: Sebrae Ceará", 20, yPos + 7);
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Data: ${currentDate}`, 20, yPos + 14);

  // Statistics summary box
  yPos = 90;
  doc.setFillColor(23, 37, 84);
  doc.rect(15, yPos, pageWidth - 30, 20, "F");
  
  const stats = {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === "Backlog").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
    pontos: tasks.reduce((sum, t) => sum + t.pontoFuncao, 0),
  };

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${stats.total}`, 25, yPos + 8);
  doc.text(`Backlog: ${stats.backlog}`, 65, yPos + 8);
  doc.text(`Em Dev: ${stats.desenvolvimento}`, 105, yPos + 8);
  doc.text(`Bloqueadas: ${stats.bloqueada}`, 145, yPos + 8);
  doc.text(`Pontos: ${stats.pontos}`, 185, yPos + 8);

  // Add pie chart if there are tasks
  if (tasks.length > 0) {
    yPos = 120;
    
    try {
      const chartCanvas = createPieChartCanvas(tasks);
      const chartImage = chartCanvas.toDataURL("image/png");
      const chartWidth = 80;
      const chartHeight = 80;
      doc.addImage(chartImage, "PNG", pageWidth - chartWidth - 20, yPos - 10, chartWidth, chartHeight);
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  }

  yPos = 120;

  // Group tasks by status
  const tasksByStatus = {
    Bloqueada: tasks.filter((t) => t.status === "Bloqueada"),
    "Em Desenvolvimento": tasks.filter((t) => t.status === "Em Desenvolvimento"),
    Backlog: tasks.filter((t) => t.status === "Backlog"),
  };

  // Render each section
  Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
    if (statusTasks.length === 0) return;

    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // Section header with color
    const sectionColors: Record<string, [number, number, number]> = {
      Bloqueada: [239, 68, 68],
      "Em Desenvolvimento": [14, 165, 233],
      Backlog: [245, 158, 11],
    };

    const [r, g, b] = sectionColors[status] || [100, 100, 100];
    doc.setFillColor(r, g, b);
    doc.rect(15, yPos, pageWidth - 30, 10, "F");
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${status} (${statusTasks.length} atividade${statusTasks.length > 1 ? "s" : ""})`, 20, yPos + 7);
    yPos += 15;

    // Tasks in this section
    statusTasks.forEach((task, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Task box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos, pageWidth - 40, 0.1);

      yPos += 5;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      const titleText = `${index + 1}. [${task.tipo}] - ${task.titulo}`;
      doc.text(titleText, 25, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      
      const description = doc.splitTextToSize(`${task.descricao}`, pageWidth - 55);
      doc.text(description, 25, yPos);
      yPos += description.length * 4 + 3;

      doc.setTextColor(80, 80, 80);
      doc.text(`📋 Ticket: ${task.ticket}`, 25, yPos);
      yPos += 4;

      doc.text(`⏱️  Tempo estimado: ${task.tempoEstimado} dia${task.tempoEstimado > 1 ? "s" : ""}`, 25, yPos);
      yPos += 4;

      doc.text(`🎯 Ponto de Função: ${task.pontoFuncao}`, 25, yPos);
      yPos += 4;

      doc.text(`📊 Status: ${task.status}`, 25, yPos);
      yPos += 8;
    });

    yPos += 5;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFillColor(240, 244, 248);
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado automaticamente por Relatório GeoMK © ${new Date().getFullYear()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 10, {
      align: "right",
    });
  }

  // Save the PDF
  const fileName = `relatorio-geomk-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
