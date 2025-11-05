
import jsPDF from "jspdf";
import { Task } from "@/types/report";
const createPieChartCanvas = (tasks: Task[]): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 100;
  const ctx = canvas.getContext("2d")!;
  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const stats = {
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
    backlog: tasks.filter((t) => t.status === "Backlog").length,
  };
  const total = stats.bloqueada + stats.desenvolvimento + stats.backlog;
  if (total === 0) return canvas;
  // Professional pie chart colors: Green for Bloqueada, Teal for Desenvolvimento, Blue for Backlog
  const colors = ["#10b981", "#06b6d4", "#3b82f6"];
  const labels = ["Bloqueadas", "Desenvolvimento", "Backlog"];
  const data = [
    { label: labels[0], value: stats.bloqueada, color: colors[0] },
    { label: labels[1], value: stats.desenvolvimento, color: colors[1] },
    { label: labels[2], value: stats.backlog, color: colors[2] },
  ].filter((d) => d.value > 0);
  // Draw pie chart on the left
  const centerX = 60;
  const centerY = 50;
  const radius = 40;
  let currentAngle = -Math.PI / 2;
  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
    currentAngle += sliceAngle;
  });
  // Legend on the right, vertically stacked with proper spacing
  let legendY = 20;
  const legendX = 110;
  const swatchSize = 12;
  const padding = 6; // Best practice spacing: 4-8px gaps
  ctx.textAlign = "left";
  data.forEach((item) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
   
    // Color swatch
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY + 1, swatchSize, swatchSize);
   
    // Label (smaller font)
    ctx.fillStyle = "#000000";
    ctx.font = "italic 8px Arial"; // Smaller and italic for labels
    ctx.fillText(item.label, legendX + swatchSize + padding, legendY + 8);
   
    // Count (prominent: bold and slightly larger)
    ctx.font = "bold 10px Arial";
    ctx.fillText(`(${item.value})`, legendX + swatchSize + padding, legendY + 18);
   
    // Percentage (prominent: bold and right-aligned)
    ctx.textAlign = "right";
    ctx.font = "bold 10px Arial";
    ctx.fillText(`${percentage}%`, 190, legendY + 18);
    ctx.textAlign = "left";
   
    legendY += 24; // Adjusted spacing for two-line items
  });
  return canvas;
};
export const generatePDF = async (tasks: Task[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // Dynamic date
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  let pageNum = 1;
  // ========== COVER-LIKE HEADER ==========
  // Top header bar
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, 40, "F");
  // Logo
  try {
    const logoUrl = "/logo-geomk.png";
    doc.addImage(logoUrl, "PNG", 15, 10, 35, 18); // Slightly decreased size
  } catch (error) {
    // Fallback text logo
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GeoMK", 15, 25);
  }
  // Report title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Relatório de Atividades", pageWidth / 2, 25, { align: "center" });
  doc.setFontSize(14);
  doc.text("Previstas", pageWidth / 2, 35, { align: "center" });
  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(108, 117, 125);
  doc.text("GeoMK Soluções • Sebrae Ceará", pageWidth / 2, 42, { align: "center" });
  // ========== SUMMARY SECTION ==========
  let yPos = 55;
  // Side-by-side layout for header: title on left, chart next to it
  const summaryStartY = yPos;
  const leftX = 20;
  const titleWidth = 80; // Approximate width for "Resumo Executivo"
  const chartX = leftX + titleWidth + 10;
  const chartWidth = 80;
  const chartHeight = 40;
  // Title on left
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Resumo Executivo", leftX, summaryStartY);
  // Pie chart next to title
  if (tasks.length > 0) {
    try {
      const chartCanvas = createPieChartCanvas(tasks);
      const chartImage = chartCanvas.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", chartX, summaryStartY - 5, chartWidth, chartHeight); // Slight offset for alignment
    } catch (error) {
      console.error("Chart generation error:", error);
    }
  }
  // Info grid below title on left
  let infoY = summaryStartY + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(73, 80, 87);
  const infoLines = [
    `Empresa: GeoMK Soluções`,
    `Cliente: Sebrae Ceará`,
    `Data: ${currentDate}`,
    `Total Atividades: ${tasks.length}`,
    `Total Pontos de Função: ${tasks.reduce((sum, t) => sum + t.pontoFuncao, 0)}`
  ];
  infoLines.forEach(line => {
    doc.text(line, leftX, infoY);
    infoY += 6;
  });
  // Set yPos to bottom of the section + spacing
  const infoHeight = infoLines.length * 6;
  const sectionHeight = Math.max(infoHeight + 8, chartHeight);
  yPos = summaryStartY + sectionHeight + 10;
  // ========== DETAILED SECTIONS ==========
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Detalhamento por Status", 20, yPos);
  yPos += 10;
  const statusOrder = [
    { key: "Bloqueadas", filter: (t: Task) => t.status === "Bloqueada", color: [52, 211, 153] },
    { key: "Backlog", filter: (t: Task) => t.status === "Backlog", color: [59, 130, 246] },
    { key: "Em Desenvolvimento", filter: (t: Task) => t.status === "Em Desenvolvimento", color: [6, 182, 212] }
  ];
  statusOrder.forEach(({ key, filter, color }) => {
    const sectionTasks = tasks.filter(filter);
    if (sectionTasks.length === 0) return;
    // Check for page break
    if (yPos > 260) {
      addFooter(doc, pageWidth, pageHeight, pageNum);
      doc.addPage();
      pageNum++;
      yPos = 30;
    }
    // Section header with colored bar
    const headerHeight = 8;
    doc.setFillColor(...color);
    doc.rect(20, yPos - headerHeight / 2, pageWidth - 40, headerHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${key} (${sectionTasks.length})`, 25, yPos + 1);
    yPos += 12;
    sectionTasks.forEach((task, index) => {
      if (yPos > 280) {
        addFooter(doc, pageWidth, pageHeight, pageNum);
        doc.addPage();
        pageNum++;
        yPos = 30;
      }
      // Task title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 37, 41);
      doc.text(`${index + 1}. ${task.tipo} - ${task.titulo}`, 25, yPos);
      yPos += 6;
      // Metadata row
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(108, 117, 125);
      const daysPlural = task.tempoEstimado > 1 ? 's' : '';
      const ticketText = `Ticket: #${task.ticket}`;
      const pontosText = `Pontos de Função: ${task.pontoFuncao}`;
      const estimativaText = `Estimativa: ${task.tempoEstimado} dia${daysPlural}`;
      doc.text(ticketText, 25, yPos);
      const ticketWidth = doc.getTextWidth(ticketText);
      doc.text(pontosText, 25 + ticketWidth + 5, yPos);
      const pontosWidth = doc.getTextWidth(pontosText);
      doc.text(estimativaText, 25 + ticketWidth + pontosWidth + 10, yPos);
      yPos += 6;
      // Description
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      const descText = `Descrição: ${task.descricao}`;
      const splitDesc = doc.splitTextToSize(descText, pageWidth - 50);
      doc.text(splitDesc, 25, yPos);
      yPos += splitDesc.length * 4 + 8;
    });
    yPos += 5;
  });
  // Final footer
  addFooter(doc, pageWidth, pageHeight, pageNum);
  // Save file
  const fileName = `relatorio-geomk-${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
// Helper for footer
const addFooter = (doc: any, pageWidth: number, pageHeight: number, pageNum: number) => {
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(173, 216, 230);
  doc.text(`Página ${pageNum}`, pageWidth - 50, pageHeight - 10);
  doc.text("Relatório gerado por GeoMK Soluções © 2025", pageWidth / 2, pageHeight - 10, { align: "center" });
};
