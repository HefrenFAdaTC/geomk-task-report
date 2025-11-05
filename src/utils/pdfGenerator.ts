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

  // Draw legend with percentages - table format below chart
  let legendY = 220;
  
  // Draw table header line
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, legendY);
  ctx.lineTo(190, legendY);
  ctx.stroke();
  
  legendY += 15;
  
  data.forEach((item) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    
    // Draw row
    ctx.fillStyle = "#000000";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(item.label, 15, legendY);
    
    ctx.textAlign = "right";
    ctx.fillText(`${percentage}%`, 185, legendY);
    
    // Draw line separator
    legendY += 10;
    ctx.strokeStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(10, legendY);
    ctx.lineTo(190, legendY);
    ctx.stroke();
    
    legendY += 15;
  });

  return canvas;
};

export const generatePDF = async (tasks: Task[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Header with logo
  doc.setFillColor(220, 220, 220);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Load and add logo
  try {
    const logoUrl = "/logo-geomk.png";
    doc.addImage(logoUrl, "PNG", 15, 8, 30, 20);
  } catch (error) {
    console.error("Error loading logo:", error);
  }
  
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("RelatórioGeoMK", 50, 15);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("GeoMK Soluções • Sebrae Ceará", 50, 25);

  // Title - Large and prominent
  yPos = 50;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório de Atividades previstas", 15, yPos);

  // Calculate statistics
  const stats = {
    pontos: tasks.reduce((sum, t) => sum + t.pontoFuncao, 0),
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
    backlog: tasks.filter((t) => t.status === "Backlog").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
  };

  // Add pie chart on the left
  yPos = 65;
  if (tasks.length > 0) {
    try {
      const chartCanvas = createPieChartCanvas(tasks);
      const chartImage = chartCanvas.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", 15, yPos, 75, 75);
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  }

  // Right side content starts here
  const rightColX = 105;
  let rightYPos = 70;
  
  // "Previstas" label
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Previstas", rightColX, rightYPos);
  
  // Company info
  rightYPos += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Empresa: GeoMK Soluções", rightColX, rightYPos);
  
  rightYPos += 8;
  doc.text("Cliente: Sebrae Ceará", rightColX, rightYPos);
  
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  rightYPos += 8;
  doc.text(`Data: ${currentDate}`, rightColX, rightYPos);

  // Statistics table
  rightYPos += 12;
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
    doc.setFontSize(10);
    doc.text(label, rightColX + 2, rightYPos + 5);
    doc.text(value, pageWidth - 25, rightYPos + 5);
    
    rightYPos += 10;
  });
  doc.line(rightColX, rightYPos, pageWidth - 15, rightYPos);

  yPos = Math.max(yPos + 80, rightYPos + 15);

  // Section title - just the title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Atividades cadastradas", 15, yPos);
  yPos += 15;

  let taskNumber = 1;

  // Render all tasks in a single numbered list (no grouping by status)
  tasks.forEach((task) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Task number and title with # symbol before tipo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const titleText = `${taskNumber}. #${task.tipo} - ${task.titulo}`;
    doc.text(titleText, 15, yPos);
    yPos += 10;

    // Ticket
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Ticket: ${task.ticket}`, 15, yPos);
    yPos += 7;

    // Pontos de Função
    doc.text(`Pontos de Função: ${task.pontoFuncao} pontos`, 15, yPos);
    yPos += 7;

    // Estimativa
    doc.text(`Estimativa: ${task.tempoEstimado} dia${task.tempoEstimado > 1 ? 's' : ''}`, 15, yPos);
    yPos += 7;

    // Description
    const description = doc.splitTextToSize(`Descrição: ${task.descricao}`, pageWidth - 30);
    doc.text(description, 15, yPos);
    yPos += description.length * 5 + 12;

    taskNumber++;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Relatório gerado automaticamente por RelatórioGeoMK © 2025",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `relatorio-geomk-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
