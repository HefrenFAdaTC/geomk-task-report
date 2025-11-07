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

// FUNÇÃO GERADORA DO GRÁFICO EM ALTA RESOLUÇÃO
function createPieChartCanvas(tasks: Activity[]): HTMLCanvasElement {
  // === TAMANHO LÓGICO (em tela) ===
  const logicalWidth = 300;
  const logicalHeight = 100;

  // === ESCALA PARA ALTA RESOLUÇÃO (3x) ===
  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;

  const ctx = canvas.getContext("2d")!;
  if (!ctx) throw new Error("Contexto 2D não disponível");

  // Escala o contexto para manter proporção
  ctx.scale(scale, scale);

  // Fundo branco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  const stats = {
    bloqueada: tasks.filter((t) => t.status === "Bloqueada").length,
    desenvolvimento: tasks.filter((t) => t.status === "Em Desenvolvimento").length,
    backlog: tasks.filter((t) => t.status === "Backlog").length,
  };

  const total = stats.bloqueada + stats.desenvolvimento + stats.backlog;
  if (total === 0) return canvas;

  const colors = ["#ec3636", "#0FC882", "#3B82F5"];
  const labels = ["Bloqueadas", "Desenvolvimento", "Backlog"];
  const data = [
    { label: labels[0], value: stats.bloqueada, color: colors[0] },
    { label: labels[1], value: stats.desenvolvimento, color: colors[1] },
    { label: labels[2], value: stats.backlog, color: colors[2] },
  ].filter((d) => d.value > 0);

  // Gráfico de pizza
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
    ctx.lineWidth = 1.5;
    ctx.stroke();
    currentAngle += sliceAngle;
  });

  // Legenda
  let legendY = 20;
  const legendX = 110;
  const swatchSize = 12;
  const padding = 6;

  ctx.textAlign = "left";
  data.forEach((item) => {
    const percentage = ((item.value / total) * 100).toFixed(1);

    // Swatch
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY + 1, swatchSize, swatchSize);

    // Label
    ctx.fillStyle = "#000000";
    ctx.font = "italic 8px Arial";
    ctx.fillText(item.label, legendX + swatchSize + padding, legendY + 8);

    // Contagem
    ctx.font = "bold 10px Arial";
    ctx.fillText(`(${item.value})`, legendX + swatchSize + padding, legendY + 18);

    // Porcentagem
    ctx.textAlign = "right";
    ctx.font = "bold 10px Arial";
    ctx.fillText(`${percentage}%`, 190, legendY + 18);
    ctx.textAlign = "left";

    legendY += 24;
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
  const lineHeight = 14;

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

  // === DADOS DO RELATÓRIO ===
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

  // === CARDS ===
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

  // === GRÁFICO EM ALTA RESOLUÇÃO ===
  let chartImage;
  try {
    const canvas = createPieChartCanvas(activities);
    const imgData = canvas.toDataURL("image/png", 1.0);
    chartImage = await pdfDoc.embedPng(imgData);
  } catch (err) {
    console.warn("Falha ao gerar gráfico:", err);
  }

  if (chartImage) {
    const logicalWidth = 300;
    const logicalHeight = 100;

    const imgWidth = logicalWidth;
    const imgHeight = logicalHeight;

    const imgX = width - margin - imgWidth + 80;
    const imgY = y - imgHeight + 40;

    page.drawImage(chartImage, {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });
  }

  y = cardY - 40;

  // === AGRUPAR POR STATUS ===
  const statusOrder = ["Bloqueada", "Em Desenvolvimento", "Backlog"];
  const statusColors: Record<string, any> = {
    "Bloqueada": rgb(0.93, 0.21, 0.21),
    "Backlog": rgb(0.23, 0.51, 0.96),
    "Em Desenvolvimento": rgb(0.06, 0.78, 0.51),
  };

  const grouped = statusOrder.map(status => ({
    status,
    activities: activities.filter(a => a.status === status),
    count: activities.filter(a => a.status === status).length,
    color: statusColors[status],
  }));

  const contentWidth = width - margin * 2;

  for (let groupIndex = 0; groupIndex < grouped.length; groupIndex++) {
    const group = grouped[groupIndex];
    if (group.count === 0) continue;

    // Calcula total de pontos da seção
    const totalPontosSecao = group.activities.reduce((sum, a) => sum + a.pontoFuncao, 0);

    // Adiciona nova página para cada seção (exceto a primeira)
    if (groupIndex > 0 && grouped[groupIndex - 1].count > 0) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    } else if (y < 180) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }

    // Barra de status
    page.drawRectangle({
      x: margin,
      y: y - 30,
      width: contentWidth,
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
    page.drawText(`${group.count} atividades • ${totalPontosSecao} pontos de função`, {
      x: width - margin - 200,
      y: y - 20,
      size: fontSize,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    y -= 50;

    for (let i = 0; i < group.activities.length; i++) {
      const act = group.activities[i];

      if (y < 220) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;
      }

      const area = act.tipo || "undefined";
      const titleText = `${i + 1}. ${area} - ${act.titulo}`;
      const titleLines = wrapText(titleText, fontBold, fontSize, contentWidth - 20);

      titleLines.forEach((line, j) => {
        page.drawText(line, {
          x: margin,
          y: y - j * lineHeight,
          size: fontSize,
          font: fontBold,
          color: rgb(0.1, 0.25, 0.4),
          maxWidth: contentWidth,
        });
      });

      y -= titleLines.length * lineHeight + 10;

      const detailsText = `Ticket: ${act.ticket}   Pontos de Função: ${act.pontoFuncao} pontos   Estimativa: ${act.tempoEstimado} dias`;
      page.drawText(detailsText, {
        x: margin,
        y: y,
        size: smallSize,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: contentWidth,
      });

      y -= 18;

      const descLines = wrapText(act.descricao, fontRegular, smallSize, contentWidth - 20);
      descLines.forEach((line, j) => {
        page.drawText(line, {
          x: margin,
          y: y - j * lineHeight,
          size: smallSize,
          font: fontRegular,
          color: rgb(0.1, 0.1, 0.1),
          maxWidth: contentWidth,
        });
      });

      y = y - descLines.length * lineHeight - 25;
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
