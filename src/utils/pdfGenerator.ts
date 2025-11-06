// src/utils/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface Activity {
  id: string;
  titulo: string;
  ticket: string;
  descricao: string;
  tempoEstimado: number;
  pontoFuncao: number;
  status: string;
  tipo: string;
}

// Função para criar o gráfico de pizza programaticamente
function createPieChartCanvas(activities: Activity[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  
  const ctx = canvas.getContext("2d")!;
  
  // Fundo branco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calcular estatísticas
  const stats = {
    bloqueada: activities.filter((t) => t.status === "Bloqueada").length,
    desenvolvimento: activities.filter((t) => t.status === "Em Desenvolvimento").length,
    backlog: activities.filter((t) => t.status === "Backlog").length,
  };
  
  const total = stats.bloqueada + stats.desenvolvimento + stats.backlog;
  if (total === 0) return canvas;
  
  // Cores profissionais
  const colors = ["#ef4444", "#3b82f6", "#10b981"];
  const labels = ["Bloqueadas", "Em Desenvolvimento", "Backlog"];
  const data = [
    { label: labels[0], value: stats.bloqueada, color: colors[0] },
    { label: labels[1], value: stats.desenvolvimento, color: colors[1] },
    { label: labels[2], value: stats.backlog, color: colors[2] },
  ].filter((d) => d.value > 0);
  
  // Desenhar pizza
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
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
    ctx.lineWidth = 3;
    ctx.stroke();
    currentAngle += sliceAngle;
  });
  
  // Legenda
  let legendY = 50;
  const legendX = 280;
  const swatchSize = 20;
  
  ctx.textAlign = "left";
  data.forEach((item) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    
    // Quadrado de cor
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY, swatchSize, swatchSize);
    
    // Texto
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px Arial";
    ctx.fillText(item.label, legendX + swatchSize + 10, legendY + 15);
    
    ctx.font = "normal 12px Arial";
    ctx.fillText(`${item.value} (${percentage}%)`, legendX + swatchSize + 10, legendY + 30);
    
    legendY += 60;
  });
  
  return canvas;
}

export async function generatePDF(activities: Activity[]) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  const fontSize = 10;
  const smallSize = 9;

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - margin;

  // === LOGO + TÍTULO ===
  page.drawText("GeoMK", {
    x: margin,
    y: y,
    size: 20,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.55),
  });

  page.drawText("Conhecendo seu Negócio", {
    x: margin,
    y: y - 18,
    size: smallSize,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText("RelatórioGeoMK", {
    x: width - margin - 120,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.55),
  });

  page.drawText("GeoMK Soluções • Sebrae Ceará", {
    x: width - margin - 140,
    y: y - 18,
    size: smallSize,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  y -= 50;

  // Linha horizontal
  page.drawLine({
    start: { x: margin, y: y + 5 },
    end: { x: width - margin, y: y + 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 20;

  // === TÍTULO DO RELATÓRIO ===
  page.drawText("Relatório de Atividades previstas", {
    x: margin,
    y: y,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  y -= 40;

  // === DADOS DO RELATÓRIO + CARDS ===
  const today = new Date().toLocaleDateString("pt-BR");
  const dados = [
    `Previstas Empresa: GeoMK Soluções`,
    `Cliente: Sebrae Ceará`,
    `Data: ${today}`,
  ];

  dados.forEach((texto, i) => {
    page.drawText(texto, {
      x: margin,
      y: y - i * 16,
      size: fontSize,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  const totalAtividades = activities.length;
  const totalPontos = activities.reduce((s, a) => s + a.pontoFuncao, 0);

  const cardY = y - 100;
  const cardWidth = 100;
  const cardHeight = 35;
  const cardSpacing = 20;

  // Card 1
  page.drawRectangle({
    x: margin,
    y: cardY,
    width: cardWidth + 8,
    height: cardHeight,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });
  page.drawText("Atividades cadastradas", {
    x: margin + 8,
    y: cardY + 18,
    size: smallSize,
    font: fontRegular,
  });
  page.drawText(totalAtividades.toString(), {
    x: margin + 8,
    y: cardY + 5,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.55),
  });

  // Card 2
  page.drawRectangle({
    x: margin + cardWidth + cardSpacing,
    y: cardY,
    width: cardWidth + 40,
    height: cardHeight,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });
  page.drawText("Total de pontos de função", {
    x: margin + cardWidth + cardSpacing + 8,
    y: cardY + 18,
    size: smallSize,
    font: fontRegular,
  });
  page.drawText(totalPontos.toString(), {
    x: margin + cardWidth + cardSpacing + 8,
    y: cardY + 5,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.55),
  });

  // === GRÁFICO DE PIZZA À DIREITA ===
  let chartImage;
  try {
    const canvas = createPieChartCanvas(activities);
    const imgData = canvas.toDataURL("image/png");
    chartImage = await pdfDoc.embedPng(imgData);
  } catch (err) {
    console.warn("Falha ao gerar gráfico:", err);
  }

  if (chartImage) {
    const imgWidth = 200;
    const imgHeight = 150;
    const imgX = width - margin - imgWidth;
    const imgY = y - imgHeight + 20;
    page.drawImage(chartImage, {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });
  }

  y = cardY - 60;

  // === AGRUPAR POR STATUS ===
  const statusOrder = ["Bloqueada", "Em Desenvolvimento", "Backlog"];
  const statusColors: Record<string, any> = {
    "Bloqueada": rgb(0.93, 0.27, 0.27),
    "Em Desenvolvimento": rgb(0.23, 0.51, 0.96),
    "Backlog": rgb(0.06, 0.73, 0.51),
  };

  const grouped = statusOrder.map(status => ({
    status,
    activities: activities.filter(a => a.status === status),
    count: activities.filter(a => a.status === status).length,
    color: statusColors[status],
  }));

  for (const group of grouped) {
    if (group.count === 0) continue;

    if (y < 180) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }

    // Barra de status
    page.drawRectangle({
      x: margin,
      y: y - 30,
      width: width - margin * 2,
      height: 30,
      color: group.color,
    });
    page.drawText(group.status, {
      x: margin + 10,
      y: y - 20,
      size: fontSize,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(group.count.toString(), {
      x: width - margin - 40,
      y: y - 20,
      size: fontSize,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    y -= 50;

    // Atividades
    for (let i = 0; i < group.activities.length; i++) {
      const act = group.activities[i];

      if (y < 220) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;
      }

      // TÍTULO
      const area = act.tipo || "undefined";
      page.drawText(`${i + 1}. ${area} - ${act.titulo}`, {
        x: margin,
        y: y,
        size: fontSize,
        font: fontBold,
        color: rgb(0.1, 0.25, 0.4),
      });

      y -= 18;

      // Detalhes
      page.drawText(`Ticket: ${act.ticket}`, {
        x: margin,
        y: y,
        size: smallSize,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(`Pontos de Função: ${act.pontoFuncao} pontos`, {
        x: margin + 150,
        y: y,
        size: smallSize,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(`Estimativa: ${act.tempoEstimado} dias`, {
        x: margin + 320,
        y: y,
        size: smallSize,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });

      y -= 18;

      // Descrição com quebra
      const descLines = wrapText(act.descricao, fontRegular, smallSize, width - margin * 2 - 20);
      descLines.forEach((line, j) => {
        page.drawText(line, {
          x: margin,
          y: y - j * 14,
          size: smallSize,
          font: fontRegular,
          color: rgb(0.1, 0.1, 0.1),
          maxWidth: width - margin * 2,
        });
      });

      y = y - descLines.length * 14 - 25;
    }
  }

  // === RODAPÉ ===
  page.drawText("GeoMK Soluções • Sebrae Ceará", {
    x: margin,
    y: 30,
    size: smallSize,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // === DOWNLOAD ===
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Relatorio_GeoMK_${new Date().toISOString().slice(0, 10)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  // Sanitizar o texto removendo caracteres especiais que WinAnsi não suporta
  const cleanText = text
    .replace(/[\n\r\t]/g, ' ')  // Remove quebras de linha e tabs
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')  // Remove caracteres não-ASCII problemáticos
    .trim();
  
  const words = cleanText.split(" ").filter(w => w.length > 0);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    try {
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    } catch (error) {
      // Se houver erro ao calcular largura, adiciona a linha atual e continua
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [cleanText];
}

export default generatePDF;
