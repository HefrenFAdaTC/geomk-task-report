import jsPDF from "jspdf";
import { Task } from "@/types/report";

const createPieChartCanvas = (tasks: Task[]): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d")!;

  const stats = {
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
    backlog: tasks.filter((t) => t.status === "Backlog").length,
  };

  const total = stats.bloqueada + stats.desenvolvimento + stats.backlog;
  if (total === 0) return canvas;

  const data = [
    { label: "Item 1", value: stats.bloqueada, color: "#ef4444" },
    { label: "Item 2", value: stats.desenvolvimento, color: "#3b82f6" },
    { label: "Item 3", value: stats.backlog, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  let currentAngle = 0;

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

    currentAngle += sliceAngle;
  });

  // Draw legend with percentages
  let legendY = 20;
  currentAngle = 0;
  data.forEach((item) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    
    ctx.fillStyle = item.color;
    ctx.fillRect(220, legendY, 15, 15);
    
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${item.label}`, 240, legendY + 12);
    ctx.fillText(`${percentage}%`, 240, legendY + 28);
    
    legendY += 50;
  });

  return canvas;
};

export const generatePDF = async (tasks: Task[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Header
  doc.setFillColor(220, 220, 220);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("RelatórioGeoMK", 15, 15);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("GeoMK Soluções • Sebrae Ceará", 15, 25);

  // Title
  yPos = 50;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório de Atividades previstas", 15, yPos);

  // Add pie chart
  yPos = 65;
  if (tasks.length > 0) {
    try {
      const chartCanvas = createPieChartCanvas(tasks);
      const chartImage = chartCanvas.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", 15, yPos, 60, 60);
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  }

  // Company info (left side)
  const leftColX = 90;
  let leftYPos = 75;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Previstas", leftColX, leftYPos);
  
  leftYPos += 8;
  doc.setFont("helvetica", "normal");
  doc.text("Empresa: GeoMK Soluções", leftColX, leftYPos);
  
  leftYPos += 6;
  doc.text("Cliente: Sebrae Ceará", leftColX, leftYPos);
  
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  leftYPos += 6;
  doc.text(`Data: ${currentDate}`, leftColX, leftYPos);

  // Statistics table (right side)
  const stats = {
    pontos: tasks.reduce((sum, t) => sum + t.pontoFuncao, 0),
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
    backlog: tasks.filter((t) => t.status === "Backlog").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
  };

  const rightColX = leftColX;
  let rightYPos = leftYPos + 12;
  
  // Draw table
  const tableData = [
    ["Total de pontos de função", stats.pontos.toString()],
    ["Bloqueadas", stats.bloqueada.toString()],
    ["Backlog", stats.backlog.toString()],
    ["Desenvolvimento", stats.desenvolvimento.toString()],
  ];

  tableData.forEach(([label, value]) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(rightColX, rightYPos, pageWidth - 15, rightYPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label, rightColX + 2, rightYPos + 5);
    doc.text(value, pageWidth - 25, rightYPos + 5);
    
    rightYPos += 8;
  });
  doc.line(rightColX, rightYPos, pageWidth - 15, rightYPos);

  yPos = rightYPos + 15;

  // Section title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Atividades cadastradas", 15, yPos);
  yPos += 10;

  // List all tasks
  tasks.forEach((task, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Task number and title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const titleText = `${index + 1}. ${task.tipo} - ${task.titulo}`;
    doc.text(titleText, 20, yPos);
    yPos += 8;

    // Task details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    doc.text(`Ticket: ${task.ticket}`, 25, yPos);
    yPos += 6;

    doc.text(`Pontos de Função: ${task.pontoFuncao} pontos`, 25, yPos);
    yPos += 6;

    doc.text(`Estimativa: ${task.tempoEstimado} dia${task.tempoEstimado > 1 ? 's' : ''}`, 25, yPos);
    yPos += 6;

    const description = doc.splitTextToSize(`Descrição: ${task.descricao}`, pageWidth - 50);
    doc.text(description, 25, yPos);
    yPos += description.length * 5 + 8;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text(
      `-ganecundo geu Negacio`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `relatorio-geomk-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
