Perfeito 👌 — a imagem que você mandou mostra exatamente o visual desejado (cards, botões e seções organizadas).
Aqui está a **versão final e revisada da documentação técnica e funcional**, ajustada para refletir **o layout que aparece na imagem** e suas novas instruções:

---

# 🧾 **Documentação do Projeto — Relatório de Atividades GeoMK**

## **1. Nome do Projeto**

`relatorio-geomk`

---

## **2. Objetivo**

Criar uma aplicação web moderna e simples para **gerenciar atividades** (tarefas) com classificação por status, geração automática de relatório em **PDF com gráfico de pizza**, e visualização interativa das tarefas organizadas por seções (accordion).

---

## **3. Tecnologias Utilizadas**

* **React (SPA)** — Framework principal
* **Vite** — Ambiente de desenvolvimento rápido
* **TailwindCSS** — Estilização responsiva e moderna
* **React Hook Form** — Controle dos formulários
* **Chart.js + react-chartjs-2** — Gráfico de pizza
* **html2canvas + jsPDF** — Geração de PDF com gráfico embutido
* **Lucide-react** — Ícones
* **Local Storage** — Armazenamento dos dados no navegador (sem backend por enquanto)

---

## **4. Estrutura de Pastas**

```
relatorio-geomk/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ReportForm.tsx
│   │   ├── ReportStats.tsx
│   │   ├── ReportAccordion.tsx
│   │   ├── PieChart.tsx
│   │   └── ReportPreview.tsx
│   ├── pages/
│   │   └── Home.tsx
│   ├── utils/
│   │   └── reportGenerator.ts
│   ├── types/
│   │   └── report.d.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── README.md
```

---

## **5. Funcionalidades Principais**

### **5.1 Cabeçalho**

* Mostra o título **“Relatório de Atividades”**
* Subtítulo fixo: `GeoMK Soluções · Sebrae Ceará`
* Exibe a **data atual** à direita

---

### **5.2 Ações Principais**

| Botão                     | Função                                                |
| ------------------------- | ----------------------------------------------------- |
| **+ Adicionar Atividade** | Abre o formulário de cadastro                         |
| **Gerar Relatório PDF**   | Gera o relatório completo em PDF com gráfico de pizza |

---

### **5.3 Cards Estatísticos**

Mostram informações em tempo real:

* Total de atividades
* Quantas estão em **Backlog**
* Quantas estão **Em Desenvolvimento**
* Quantas estão **Bloqueadas**
* **Total de Pontos de Função**

Exemplo (igual à imagem enviada):

```
[ Total: 3 ] [ Backlog: 0 ] [ Em Desenvolvimento: 1 ] [ Bloqueadas: 2 ] [ Pontos: 10 ]
```

---

### **5.4 Visualização das Atividades**

Abaixo dos cards, há dois botões:

* **Por Seções** — Mostra as atividades agrupadas por status (em accordions)
* **Tabela Completa** — Exibe todas as atividades em uma lista única (opcional)

Cada **accordion** representa uma seção:

* 🔴 **Bloqueadas**
* 🟠 **Backlog**
* 🔵 **Em Desenvolvimento**

Cada card dentro da seção exibe:

```
[Título]   [Ticket]   [Tipo de Atividade]
Descrição
⏱ Tempo Estimado     🎯 Pontos de Função
✏️ (Editar)   🗑 (Excluir)
```

---

### **5.5 Formulário de Atividade**

Campos do formulário:

| Campo                     | Tipo        | Descrição                                                  |
| ------------------------- | ----------- | ---------------------------------------------------------- |
| **Título**                | Texto       | Nome da tarefa                                             |
| **Ticket**                | Texto       | Ex: `#000000`                                              |
| **Descrição**             | Texto longo | Detalhamento da atividade                                  |
| **Ferramenta**            | Texto       | Nome da ferramenta                                         |
| **Tempo estimado (dias)** | Número      | Quantos dias para concluir                                 |
| **Ponto de função**       | Número      | Valor técnico da atividade                                 |
| **Status**                | Seleção     | Opções: `Bloqueada`, `Backlog`, `Em Desenvolvimento`       |
| **Tipo de atividade**     | Texto livre | Ex: “Bug”, “Melhoria”, “Nova tela”, etc. (campo digitável) |

Botões:

* **Salvar / Editar**
* **Cancelar**
o botão "Editar" deve preservar os dados da atividade para que eles possam ser modificados e atualizados

---

## **6. Estrutura do Relatório em PDF**

### **Cabeçalho**

```
Relatório de Atividades Previstas
Empresa: GeoMK Soluções
Cliente: Sebrae Ceará
Data: 04 de novembro de 2025
```

➡️ Ao lado direito do cabeçalho, o **gráfico de pizza** é renderizado mostrando a proporção entre:

* Backlog
* Em Desenvolvimento
* Bloqueadas

---

### **Corpo do Relatório**

As atividades são **separadas por seções**:

#### 🟠 **Backlog**

1. [Ferramenta] - Nova tela de cadastro
   Ticket: `#000345`   Tempo estimado: 2 dias   Ponto de Função: 3   Tipo da atividade: Nova Tela
   Descrição: Criar tela para cadastro de clientes.

#### 🔵 **Em Desenvolvimento**

1. [Ferramenta] - Corrigir API de autenticação
   Ticket: `#002050`   Tempo estimado: 1 dias   Ponto de Função: 2   Tipo da atividade: Melhoria
   Descrição: Ajustar endpoint de login.

#### 🔴 **Bloqueadas**

1. [Ferramenta] - Correção de erros diversos
   Ticket: `#002060`   Tempo estimado: 4 dias   Ponto de Função: 1   Tipo da atividade: Bug
   Descrição: Erros no detalhamento de dados.

---

### **Rodapé**

```
Relatório gerado automaticamente por Relatório GeoMK © 2025
```

---

## **7. Estrutura dos Dados (JSON)**

```json
{
  "id": 1,
  "titulo": "API",
  "ticket": "tck-123",
  "descricao": "Fazer uma API",
  "ferramenta": "Tela cadastro",
  "tempoEstimado": 4,
  "pontoFuncao": 1,
  "status": "Bloqueada",
  "tipo": "Bug"
}
```

---

## **8. Geração de Relatório (PDF)**

A função `reportGenerator.ts`:

* Captura o **conteúdo renderizado em tela** (div principal com dados e gráfico).
* Usa **html2canvas** para converter o gráfico e cards em imagem.
* Usa **jsPDF** para montar o PDF com:

  * Cabeçalho fixo
  * Gráfico de pizza embutido
  * Seções de atividades divididas
  * Rodapé automático

---

## **9. Dependências**

```bash
npm install react react-dom react-router-dom
npm install react-hook-form axios
npm install jspdf html2canvas chart.js react-chartjs-2
npm install lucide-react
npm install -D tailwindcss vite
```

---

## **10. Exemplo Visual (igual à imagem enviada)**

```
---------------------------------------------------------
Relatório de Atividades
GeoMK Soluções · Sebrae Ceará               04/11/2025
---------------------------------------------------------
[+ Adicionar] [Gerar Relatório PDF]

Total: 3 | Backlog: 0 | Desenvolvimento: 1 | Bloqueadas: 2 | Pontos: 10
---------------------------------------------------------
[Por Seções] [Tabela Completa]

▼ Bloqueadas (2)
  - Api (tck-123) Bug
    Fazer uma API
    ⏱ 4 dias | 🎯 1 ponto
    ✏️ [Editar] 🗑 [Excluir]

  - Site (tck-124) Bug
    Corrigir layout
    ⏱ 6 dias | 🎯 2 pontos
    ✏️ [Editar] 🗑 [Excluir]

▼ Em Desenvolvimento (1)
  - Integração com API...
---------------------------------------------------------
```

---

## **11. Próximos Passos**

1. Criar o projeto com `npm create vite@latest relatorio-geomk --template react`
2. Configurar o TailwindCSS
3. Criar os componentes conforme esta documentação
4. Implementar o gráfico (PieChart)
5. Criar a função `gerarRelatorioPDF()`
6. Testar a funcionalidade de accordion e PDF

---

Posso agora gerar este documento em **PDF, DOCX (Word)** ou **Markdown (.md)** para você enviar direto ao **Lovable**.
Qual formato você quer?
