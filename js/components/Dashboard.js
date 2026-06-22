import { store } from '../store.js';
import { formatCurrency, formatCurrencyParts, calculateProjections } from '../utils.js';

export const Dashboard = {
  activeDonutSlice: null,

  render(container) {
    const data = calculateProjections(store.state.transactions, store.state.recurrent);
    
    // Filtra transações do mês atual (Junho 2026, ou dinamicamente baseado na data local)
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthTransactions = store.state.transactions.filter(tx => tx.date.startsWith(currentMonthKey));
    
    const currentMonthIncome = currentMonthTransactions
      .filter(tx => tx.amount > 0)
      .reduce((acc, tx) => acc + tx.amount, 0);
      
    const currentMonthExpense = currentMonthTransactions
      .filter(tx => tx.amount < 0)
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

    // Formata o saldo total em partes para visual brutalista
    const balanceParts = formatCurrencyParts(data.currentBalance);
    const incomeParts = formatCurrencyParts(currentMonthIncome);
    const expenseParts = formatCurrencyParts(currentMonthExpense);

    // Determina o mascote e a mensagem baseada no saldo consolidado
    const mascotImg = data.currentBalance >= 0 ? 'img/mascote_feliz.png' : 'img/mascote_triste.png';
    const mascotTitle = data.currentBalance >= 0 ? 'Tudo sob controle!' : 'Alerta de Caixa Negativo!';
    const mascotSpeech = data.currentBalance >= 0 
      ? 'Seu caixa consolidado está saudável e no azul. Continue mantendo o foco e registrando seus gastos!' 
      : 'Seu saldo acumulado atual está negativo. Evite compras parceladas no cartão e foque em economizar este mês.';

    container.innerHTML = `
      <!-- Cabeçalho de Boas-Vindas com Mascote (Giz de Lousa) -->
      <div class="card-brutal mb-3" style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; padding: 1rem 1.5rem; border-color: ${data.currentBalance >= 0 ? 'var(--income)' : 'var(--expense)'};">
        <img src="${mascotImg}" class="chalk-sketch" style="margin: 0; width: 90px; height: 90px; flex-shrink: 0;" alt="Mascote Dashboard">
        <div style="flex: 1; min-width: 250px;">
          <h3 class="display-font" style="font-size: 1.25rem; margin-bottom: 0.25rem; color: ${data.currentBalance >= 0 ? 'var(--income)' : 'var(--expense)'};">${mascotTitle}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
            ${mascotSpeech}
          </p>
        </div>
      </div>

      <!-- Cards Resumo -->
      <div class="grid-cols-3">
        <!-- Saldo Geral -->
        <div class="card-brutal card-accent">
          <div class="card-title">
            <span>Saldo Total</span>
            <span style="font-size: 1.2rem;">💰</span>
          </div>
          <div class="card-value ${balanceParts.isNegative ? 'expense' : 'income'}" style="color: ${balanceParts.isNegative ? 'var(--expense)' : 'var(--income)'}">
            <span style="font-size: 1.5rem; font-weight: 700; align-self: center; margin-right: 2px;">${balanceParts.isNegative ? '-' : ''}</span>
            <span style="font-size: 1.5rem; font-weight: 700; align-self: center; margin-right: 4px;">${balanceParts.symbol}</span>
            <span>${balanceParts.integer}</span>
            <span class="card-value-cents">,${balanceParts.cents}</span>
          </div>
          <div class="card-subtitle">Acumulado total de todas as contas</div>
        </div>

        <!-- Receita do Mês -->
        <div class="card-brutal">
          <div class="card-title">
            <span>Receitas (Mês)</span>
            <span style="font-size: 1.2rem; color: var(--income);">▲</span>
          </div>
          <div class="card-value" style="color: var(--income);">
            <span style="font-size: 1.5rem; font-weight: 700; align-self: center; margin-right: 4px;">R$</span>
            <span>${incomeParts.integer}</span>
            <span class="card-value-cents">,${incomeParts.cents}</span>
          </div>
          <div class="card-subtitle">Total de entradas registradas este mês</div>
        </div>

        <!-- Despesa do Mês -->
        <div class="card-brutal">
          <div class="card-title">
            <span>Despesas (Mês)</span>
            <span style="font-size: 1.2rem; color: var(--expense);">▼</span>
          </div>
          <div class="card-value" style="color: var(--expense);">
            <span style="font-size: 1.5rem; font-weight: 700; align-self: center; margin-right: 4px;">R$</span>
            <span>${expenseParts.integer}</span>
            <span class="card-value-cents">,${expenseParts.cents}</span>
          </div>
          <div class="card-subtitle">Total de saídas registradas este mês</div>
        </div>
      </div>

      <!-- Gráficos Section -->
      <div class="grid-cols-2">
        <!-- Histórico de Saldo -->
        <div class="card-brutal">
          <div class="card-title">
            <span>Histórico de Saldo</span>
            <span style="font-size: 0.8rem; font-weight: 500; text-transform: none;">Evolução Mensal</span>
          </div>
          <div class="chart-container" id="line-chart-box">
            <!-- Gráfico de Linha SVG Injetado -->
          </div>
        </div>

        <!-- Divisão de Gastos -->
        <div class="card-brutal">
          <div class="card-title">
            <span>Distribuição de Gastos</span>
            <span style="font-size: 0.8rem; font-weight: 500; text-transform: none;">Categorias (Mês)</span>
          </div>
          
          <div class="flex align-center justify-between gap-2" style="flex-wrap: wrap;">
            <!-- Donut Chart SVG -->
            <div style="flex: 1; min-width: 200px; display: flex; justify-content: center; position: relative;" id="donut-chart-box">
              <!-- Gráfico Donut Injetado -->
            </div>
            
            <!-- Legenda -->
            <div style="flex: 1.2; min-width: 220px;" id="donut-legend-box">
              <!-- Legendas Injetadas -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderLineChart(data.historyPoints);
    this.renderDonutChart(currentMonthTransactions);
  },

  renderLineChart(points) {
    const container = document.getElementById('line-chart-box');
    if (!container) return;

    if (points.length === 0) {
      container.innerHTML = `<div class="empty-state">Sem dados suficientes para gerar histórico.</div>`;
      return;
    }

    const width = 500;
    const height = 200;
    const paddingX = 40;
    const paddingY = 30;

    // Acha limites dos valores de saldo
    const balances = points.map(p => p.balance);
    const minVal = Math.min(...balances, 0); // Considera zero para referência
    const maxVal = Math.max(...balances, 100);
    const valRange = (maxVal - minVal) || 100;

    // Calcula coordenadas X e Y de cada ponto
    const chartPoints = points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1 || 1)) * (width - 2 * paddingX);
      // Inverte Y pois SVG começa do topo
      const y = height - paddingY - ((p.balance - minVal) / valRange) * (height - 2 * paddingY);
      return { ...p, x, y };
    });

    // Constrói o path da linha
    const linePath = chartPoints.reduce((path, pt, idx) => {
      return path + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y} `;
    }, '');

    // Constrói a linha guia horizontal zero se houver valores negativos e positivos
    let zeroLine = '';
    if (minVal < 0) {
      const zeroY = height - paddingY - ((0 - minVal) / valRange) * (height - 2 * paddingY);
      zeroLine = `<line x1="${paddingX}" y1="${zeroY}" x2="${width - paddingX}" y2="${zeroY}" stroke="var(--text-muted)" stroke-dasharray="3,3" stroke-width="1.5" />`;
    }

    // Cria elementos de grade vertical
    const gridLines = chartPoints.map(pt => `
      <line x1="${pt.x}" y1="${paddingY}" x2="${pt.x}" y2="${height - paddingY}" stroke="var(--card-bg)" stroke-width="1.5" />
    `).join('');

    // Cria círculos interativos e rótulos
    const circles = chartPoints.map((pt, idx) => `
      <g class="chart-point-group" data-idx="${idx}">
        <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="var(--bg)" stroke="var(--accent)" stroke-width="3" style="cursor: pointer; transition: r 0.1s;" />
        <circle cx="${pt.x}" cy="${pt.y}" r="15" fill="transparent" style="cursor: pointer;" 
                onmouseover="document.getElementById('line-tooltip').style.display='block'; 
                             document.getElementById('line-tooltip').innerHTML='${pt.label}: <strong>${formatCurrency(pt.balance)}</strong>';
                             document.getElementById('line-tooltip').style.left='${pt.x - 50}px';
                             document.getElementById('line-tooltip').style.top='${pt.y - 45}px';"
                onmouseout="document.getElementById('line-tooltip').style.display='none';" />
      </g>
    `).join('');

    // Rótulos do eixo X (meses)
    const xLabels = chartPoints.map(pt => `
      <text x="${pt.x}" y="${height - 8}" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-display)" font-size="10" font-weight="700">${pt.label}</text>
    `).join('');

    container.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <!-- Grade brutalista de fundo -->
        <rect x="${paddingX}" y="${paddingY}" width="${width - 2 * paddingX}" height="${height - 2 * paddingY}" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-width="2" />
        ${gridLines}
        ${zeroLine}
        <!-- Linha do gráfico -->
        <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="3" />
        <!-- Pontos -->
        ${circles}
        <!-- Eixos / Nomes -->
        ${xLabels}
      </svg>
      <div id="line-tooltip" class="chart-tooltip"></div>
    `;
  },

  renderDonutChart(transactions) {
    const donutBox = document.getElementById('donut-chart-box');
    const legendBox = document.getElementById('donut-legend-box');
    
    if (!donutBox || !legendBox) return;

    // Filtra apenas despesas
    const expenses = transactions.filter(tx => tx.amount < 0);
    const totalExpense = expenses.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

    if (totalExpense === 0) {
      donutBox.innerHTML = ``;
      legendBox.innerHTML = `<div class="empty-state">Nenhum gasto registrado neste mês.</div>`;
      return;
    }

    // Agrupa gastos por categoria
    const categoryTotals = {};
    expenses.forEach(tx => {
      const cat = tx.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(tx.amount);
    });

    const categoryData = Object.entries(categoryTotals).map(([cat, total]) => {
      const percentage = (total / totalExpense) * 100;
      return {
        key: cat,
        name: store.state.categories[cat]?.name || cat,
        icon: store.state.categories[cat]?.icon || '🏷️',
        color: store.state.categories[cat]?.color || 'var(--text-secondary)',
        total,
        percentage
      };
    }).sort((a, b) => b.total - a.total); // Ordena por valor mais alto

    // Donut SVG Parameters
    const size = 180;
    const radius = 65;
    const circumference = 2 * Math.PI * radius; // ~408.4
    const center = size / 2;
    const strokeWidth = 8;

    let accumulatedPercentage = 0;
    let svgSlices = '';

    categoryData.forEach((data, idx) => {
      // Donut slice usando dasharray e dashoffset
      const sliceLength = (data.percentage / 100) * circumference;
      const strokeDashArray = `${sliceLength} ${circumference}`;
      const strokeDashOffset = -((accumulatedPercentage / 100) * circumference);

      svgSlices += `
        <circle class="donut-slice"
                cx="${center}" cy="${center}" r="${radius}"
                fill="transparent"
                stroke="${data.color}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDashArray}"
                stroke-dashoffset="${strokeDashOffset}"
                transform="rotate(-90 ${center} ${center})"
                data-category="${data.key}"
                data-name="${data.name}"
                data-total="${formatCurrency(data.total)}"
                data-percent="${data.percentage.toFixed(1)}%"
                onmouseover="
                  document.getElementById('donut-center-name').textContent = '${data.icon} ${data.name}';
                  document.getElementById('donut-center-value').textContent = '${formatCurrency(data.total)}';
                  document.getElementById('donut-center-percent').textContent = '${data.percentage.toFixed(1)}%';
                  this.setAttribute('stroke-width', '14');
                "
                onmouseout="
                  document.getElementById('donut-center-name').textContent = 'Total Gastos';
                  document.getElementById('donut-center-value').textContent = '${formatCurrency(totalExpense)}';
                  document.getElementById('donut-center-percent').textContent = '100%';
                  this.setAttribute('stroke-width', '8');
                "
        />
      `;
      accumulatedPercentage += data.percentage;
    });

    donutBox.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Base de fundo se nada for renderizado -->
        <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="var(--card-bg)" stroke-width="${strokeWidth}" />
        <!-- Fatias -->
        ${svgSlices}
      </svg>
      <!-- Texto Central do Donut -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; z-index: 2; width: 100%;">
        <span id="donut-center-name" style="font-family: var(--font-display); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Total Gastos</span>
        <span id="donut-center-value" style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 900; color: var(--text);">${formatCurrency(totalExpense)}</span>
        <span id="donut-center-percent" style="font-family: var(--font-display); font-size: 0.75rem; font-weight: 700; color: var(--accent);">100%</span>
      </div>
    `;

    // Renderiza Legendas
    legendBox.innerHTML = `
      <div class="legend-container">
        ${categoryData.map(data => `
          <div class="legend-item" 
               onmouseover="
                 document.getElementById('donut-center-name').textContent = '${data.icon} ${data.name}';
                 document.getElementById('donut-center-value').textContent = '${formatCurrency(data.total)}';
                 document.getElementById('donut-center-percent').textContent = '${data.percentage.toFixed(1)}%';
                 const slice = document.querySelector('.donut-slice[data-category=\\'${data.key}\\']');
                 if(slice) slice.setAttribute('stroke-width', '14');
               "
               onmouseout="
                 document.getElementById('donut-center-name').textContent = 'Total Gastos';
                 document.getElementById('donut-center-value').textContent = '${formatCurrency(totalExpense)}';
                 document.getElementById('donut-center-percent').textContent = '100%';
                 const slice = document.querySelector('.donut-slice[data-category=\\'${data.key}\\']');
                 if(slice) slice.setAttribute('stroke-width', '8');
               "
               style="border: 1px solid var(--border); padding: 0.4rem; background-color: var(--card-bg);">
            <div class="legend-color" style="background-color: ${data.color};"></div>
            <div style="flex: 1; display: flex; justify-content: space-between; align-items: center; min-width: 0; gap: 0.25rem;">
              <span style="font-weight: 600; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.name}</span>
              <span style="font-family: var(--font-display); font-weight: 700; font-size: 0.75rem; color: var(--text-secondary); text-align: right; white-space: nowrap;">${data.percentage.toFixed(0)}%</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
