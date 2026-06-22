import { store } from '../store.js';
import { formatCurrency, calculateProjections } from '../utils.js';

export const Projections = {
  render(container) {
    const data = calculateProjections(store.state.transactions, store.state.recurrent);
    
    // Determina o mascote e conselho baseado na tendência da sobra de caixa
    const projectedNet = data.projectedMonthlyNet;
    const mascotImg = projectedNet >= 0 ? 'img/mascote_feliz.png' : 'img/mascote_triste.png';
    const mascotTitle = projectedNet >= 0 ? 'Tendência Saudável!' : 'Atenção na Tendência!';
    const mascotSpeech = projectedNet >= 0
      ? `Suas contas recorrentes mostram uma sobra líquida estimada em <strong>${formatCurrency(projectedNet)}</strong> por mês. Sua linha de tendência projeta crescimento sustentável.`
      : `Suas despesas recorrentes fixas superam sua receita mensal estimada em <strong>${formatCurrency(Math.abs(projectedNet))}</strong> por mês. Reduzir seus custos fixos é essencial!`;

    const goals = store.state.savingsGoals || [];
    const currentBalance = data.currentBalance;

    const goalsHtml = goals.length === 0 ? `
      <div class="empty-state" style="padding: 1.5rem; font-size: 0.85rem;">
        Nenhuma meta de poupança cadastrada.
      </div>
    ` : goals.map(goal => {
      const progressPercent = Math.min(100, Math.max(0, (currentBalance / goal.targetAmount) * 100));
      
      let etaText = '';
      let etaClass = '';
      let progressClass = '';

      if (currentBalance >= goal.targetAmount) {
        etaText = 'Meta Concluída! 🎉';
        etaClass = 'completed';
        progressClass = 'success';
      } else if (projectedNet <= 0) {
        etaText = 'Tendência mensal negativa ⚠️';
        etaClass = 'impossible';
        progressClass = 'danger';
      } else {
        const remaining = goal.targetAmount - currentBalance;
        const months = Math.ceil(remaining / projectedNet);
        etaText = `Estimativa: ~${months} ${months === 1 ? 'mês' : 'meses'}`;
        progressClass = 'warning';
      }

      return `
        <div class="recurrent-item" style="flex-direction: column; align-items: stretch; gap: 0.75rem; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
            <div class="recurrent-details">
              <span class="recurrent-title" style="font-size: 1.1rem; font-weight: 800; text-transform: uppercase;">${goal.description}</span>
              <span class="recurrent-sub">Alvo: ${formatCurrency(goal.targetAmount)}</span>
            </div>
            <button class="btn-delete goal-delete-btn" data-id="${goal.id}" title="Excluir Meta">✕</button>
          </div>
          
          <div class="goal-progress-info">
            <span>Progresso: ${progressPercent.toFixed(1)}%</span>
            <span>Saldo Atual: ${formatCurrency(currentBalance)}</span>
          </div>

          <div class="progress-bar-brutal" style="height: 12px; margin: 0.25rem 0 0.5rem 0;">
            <div class="progress-fill-brutal ${progressClass}" style="width: ${progressPercent}%"></div>
          </div>

          <div style="display: flex;">
            <span class="goal-eta ${etaClass}">${etaText}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Cabeçalho com Mascote de Projeções (Giz de Lousa) -->
      <div class="card-brutal mb-3" style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; padding: 1rem 1.5rem; border-color: ${projectedNet >= 0 ? 'var(--income)' : 'var(--expense)'};">
        <img src="${mascotImg}" class="chalk-sketch" style="margin: 0; width: 90px; height: 90px; flex-shrink: 0;" alt="Mascote Projeções">
        <div style="flex: 1; min-width: 250px;">
          <h3 class="display-font" style="font-size: 1.25rem; margin-bottom: 0.25rem; color: ${projectedNet >= 0 ? 'var(--income)' : 'var(--expense)'};">${mascotTitle}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
            ${mascotSpeech}
          </p>
        </div>
      </div>

      <div class="projection-config-grid">
        <!-- Coluna 1: Cadastrar / Listar Recorrências -->
        <div class="card-brutal">
          <div class="card-title">
            <span>Fixos & Recorrências</span>
            <span style="font-size: 1.1rem;">🔄</span>
          </div>
          
          <form id="recurrent-form" style="border-bottom: 2px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 1.5rem;" autocomplete="off">
            <h4 class="mb-2" style="font-size: 0.9rem;">Adicionar Receita/Despesa Fixa</h4>
            
            <div class="switch-group" style="margin-bottom: 1rem;">
              <div class="switch-option active type-expense" id="rec-switch-expense" data-type="expense">Despesa Fixa</div>
              <div class="switch-option" id="rec-switch-income" data-type="income">Receita Fixa</div>
            </div>
            
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="rec-description" style="font-size: 0.8rem;">Descrição</label>
              <input type="text" class="input-brutal" id="rec-description" placeholder="Ex: Aluguel, Salário, Internet" required>
            </div>
            
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="rec-amount" style="font-size: 0.8rem;">Valor Mensal</label>
              <input type="number" step="0.01" min="0.01" class="input-brutal" id="rec-amount" placeholder="0,00" required>
            </div>
            
            <button type="submit" class="btn-brutal btn-primary btn-sm w-full">Adicionar Recorrência</button>
          </form>

          <!-- Listagem das recorrências -->
          <h4 class="mb-2" style="font-size: 0.9rem;">Recorrências Ativas</h4>
          <div id="recurrent-items-list" style="max-height: 250px; overflow-y: auto; padding-right: 0.25rem;">
            ${store.state.recurrent.length === 0 ? `
              <div class="empty-state" style="padding: 1.5rem; font-size: 0.85rem;">
                Nenhuma receita ou despesa fixa cadastrada.
              </div>
            ` : store.state.recurrent.map(item => {
              const sign = item.amount > 0 ? '+' : '-';
              const itemClass = item.type === 'income' ? 'income' : 'expense';
              return `
                <div class="recurrent-item" data-id="${item.id}">
                  <div class="recurrent-details">
                    <span class="recurrent-title">${item.description}</span>
                    <span class="recurrent-sub">${item.type === 'income' ? 'Renda Recorrente' : 'Despesa Fixa'}</span>
                  </div>
                  <div class="flex align-center gap-2">
                    <span class="recurrent-value ${itemClass}">${sign}${formatCurrency(Math.abs(item.amount))}</span>
                    <button class="btn-delete rec-delete-btn" data-id="${item.id}" title="Excluir Recorrência">✕</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Coluna 2: Análise da Projeção e Resumos -->
        <div class="card-brutal">
          <div class="card-title">
            <span>DRE Estimado & Projeção</span>
            <span style="font-size: 1.1rem;">📊</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
            <div class="flex justify-between" style="border-bottom: 1px dashed var(--border); padding-bottom: 0.4rem;">
              <span style="color: var(--text-secondary);">Saldo Inicial:</span>
              <strong style="font-family: var(--font-display);">${formatCurrency(data.currentBalance)}</strong>
            </div>
            <div class="flex justify-between" style="border-bottom: 1px dashed var(--border); padding-bottom: 0.4rem;">
              <span style="color: var(--text-secondary);">Receitas Fixas (+):</span>
              <span style="color: var(--income); font-weight: 600;">+ ${formatCurrency(data.recurrentIncome)}</span>
            </div>
            <div class="flex justify-between" style="border-bottom: 1px dashed var(--border); padding-bottom: 0.4rem;">
              <span style="color: var(--text-secondary);">Despesas Fixas (-):</span>
              <span style="color: var(--expense); font-weight: 600;">- ${formatCurrency(data.recurrentExpense)}</span>
            </div>
            <div class="flex justify-between" style="border-bottom: 1px dashed var(--border); padding-bottom: 0.4rem;">
              <span style="color: var(--text-secondary);" title="Média de despesas reais subtraídas do custo fixo">Gasto Variável Médio (-):</span>
              <span style="color: var(--expense); font-weight: 600;">- ${formatCurrency(data.estimatedVariableExpense)}</span>
            </div>
            <div class="flex justify-between" style="padding-top: 0.5rem; border-top: 2px solid var(--border); font-size: 1rem;">
              <strong>Resultado Mensal Estimado:</strong>
              <strong class="${data.projectedMonthlyNet >= 0 ? 'income' : 'expense'}" style="font-family: var(--font-display);">
                ${data.projectedMonthlyNet >= 0 ? '+' : ''}${formatCurrency(data.projectedMonthlyNet)}
              </strong>
            </div>
          </div>

          <!-- Cards Rápidos de Projeção -->
          <div class="projection-summary-cards">
            <div class="projection-card-mini">
              <div class="proj-title">Em 3 Meses</div>
              <div class="proj-val ${data.projections['3m'] >= 0 ? 'income' : 'expense'}" style="color: ${data.projections['3m'] >= 0 ? 'var(--income)' : 'var(--expense)'}">
                ${formatCurrency(data.projections['3m'])}
              </div>
            </div>
            <div class="projection-card-mini">
              <div class="proj-title">Em 6 Meses</div>
              <div class="proj-val ${data.projections['6m'] >= 0 ? 'income' : 'expense'}" style="color: ${data.projections['6m'] >= 0 ? 'var(--income)' : 'var(--expense)'}">
                ${formatCurrency(data.projections['6m'])}
              </div>
            </div>
            <div class="projection-card-mini">
              <div class="proj-title">Em 12 Meses</div>
              <div class="proj-val ${data.projections['12m'] >= 0 ? 'income' : 'expense'}" style="color: ${data.projections['12m'] >= 0 ? 'var(--income)' : 'var(--expense)'}">
                ${formatCurrency(data.projections['12m'])}
              </div>
            </div>
          </div>
          
          <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; background: rgba(255,255,255,0.02); padding: 0.75rem; border: 1px solid var(--border);">
            ⚠️ <strong>Como funciona a projeção?</strong> O sistema soma suas receitas fixas e subtrai as despesas fixas cadastradas. Em seguida, calcula a sua média de gastos variáveis (despesas totais no histórico menos despesas fixas) e projeta essa tendência sob o saldo atual acumulado.
          </div>
        </div>
      </div>

      <!-- Gráfico da Tendência de Projeção -->
      <div class="card-brutal" style="margin-bottom: 2rem;">
        <div class="card-title">
          <span>Linha de Tendência de Saldo</span>
          <span style="font-size: 0.8rem; font-weight: 500; text-transform: none;">Trajetória Futura</span>
        </div>
        <div class="chart-container" id="projection-chart-box">
          <!-- Gráfico de Projeção SVG -->
        </div>
      </div>

      <!-- Seção de Metas de Poupança -->
      <div class="savings-goals-section">
        <h2 class="display-font" style="font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          🎯 Metas de Poupança
        </h2>
        
        <div class="grid-cols-2">
          <!-- Coluna 1: Cadastrar Nova Meta -->
          <div class="card-brutal">
            <div class="card-title">
              <span>Nova Meta</span>
              <span style="font-size: 1.1rem;">💰</span>
            </div>
            
            <form id="goal-form" autocomplete="off">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" for="goal-description" style="font-size: 0.8rem;">Descrição da Meta</label>
                <input type="text" class="input-brutal" id="goal-description" placeholder="Ex: Comprar Notebook, Viagem Japão" required>
              </div>
              
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" for="goal-amount" style="font-size: 0.8rem;">Valor Alvo (R$)</label>
                <input type="number" step="0.01" min="0.01" class="input-brutal" id="goal-amount" placeholder="0,00" required>
              </div>
              
              <button type="submit" class="btn-brutal btn-primary btn-sm w-full">Criar Meta de Poupança</button>
            </form>
          </div>

          <!-- Coluna 2: Metas Ativas -->
          <div class="card-brutal">
            <div class="card-title">
              <span>Metas Ativas</span>
              <span style="font-size: 1.1rem;">🏆</span>
            </div>
            
            <div id="goals-items-list" style="max-height: 380px; overflow-y: auto; padding-right: 0.25rem; display: flex; flex-direction: column; gap: 1rem;">
              ${goalsHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderProjectionChart(data);
    this.bindEvents(container);
  },

  renderProjectionChart(data) {
    const container = document.getElementById('projection-chart-box');
    if (!container) return;

    const points = [
      { label: 'Hoje', val: data.currentBalance },
      { label: '3 Meses', val: data.projections['3m'] },
      { label: '6 Meses', val: data.projections['6m'] },
      { label: '12 Meses', val: data.projections['12m'] }
    ];

    const width = 500;
    const height = 200;
    const paddingX = 45;
    const paddingY = 30;

    const values = points.map(p => p.val);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 100);
    const valRange = (maxVal - minVal) || 100;

    // Calcula coordenadas X e Y
    const chartPoints = points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((p.val - minVal) / valRange) * (height - 2 * paddingY);
      return { ...p, x, y };
    });

    const linePath = chartPoints.reduce((path, pt, idx) => {
      return path + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y} `;
    }, '');

    // Grade horizontal de referência zero
    let zeroLine = '';
    if (minVal < 0) {
      const zeroY = height - paddingY - ((0 - minVal) / valRange) * (height - 2 * paddingY);
      zeroLine = `<line x1="${paddingX}" y1="${zeroY}" x2="${width - paddingX}" y2="${zeroY}" stroke="var(--text-muted)" stroke-dasharray="3,3" stroke-width="1.5" />`;
    }

    // Grade vertical
    const gridLines = chartPoints.map(pt => `
      <line x1="${pt.x}" y1="${paddingY}" x2="${pt.x}" y2="${height - paddingY}" stroke="var(--card-bg)" stroke-width="1.5" />
    `).join('');

    // Círculos e tooltips
    const circles = chartPoints.map((pt, idx) => `
      <g class="chart-point-group">
        <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="var(--bg)" stroke="${pt.val >= 0 ? 'var(--income)' : 'var(--expense)'}" stroke-width="3" style="cursor: pointer;" />
        <circle cx="${pt.x}" cy="${pt.y}" r="15" fill="transparent" style="cursor: pointer;" 
                onmouseover="document.getElementById('proj-tooltip').style.display='block'; 
                             document.getElementById('proj-tooltip').innerHTML='Projeção ${pt.label}: <strong>${formatCurrency(pt.val)}</strong>';
                             document.getElementById('proj-tooltip').style.left='${pt.x - 70}px';
                             document.getElementById('proj-tooltip').style.top='${pt.y - 45}px';"
                onmouseout="document.getElementById('proj-tooltip').style.display='none';" />
      </g>
    `).join('');

    // Rótulos do Eixo X
    const xLabels = chartPoints.map(pt => `
      <text x="${pt.x}" y="${height - 8}" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-display)" font-size="10" font-weight="700">${pt.label}</text>
    `).join('');

    container.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <!-- Retângulo da grade -->
        <rect x="${paddingX}" y="${paddingY}" width="${width - 2 * paddingX}" height="${height - 2 * paddingY}" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-width="2" />
        ${gridLines}
        ${zeroLine}
        <!-- Linha Tracejada de Projeção -->
        <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="6,4" />
        <!-- Pontos -->
        ${circles}
        <!-- Rótulos -->
        ${xLabels}
      </svg>
      <div id="proj-tooltip" class="chart-tooltip" style="min-width: 140px;"></div>
    `;
  },

  bindEvents(container) {
    const form = document.getElementById('recurrent-form');
    const switchExpense = document.getElementById('rec-switch-expense');
    const switchIncome = document.getElementById('rec-switch-income');
    
    let activeType = 'expense';

    // Toggle de tipo de recorrência
    if (switchExpense && switchIncome) {
      switchExpense.addEventListener('click', () => {
        activeType = 'expense';
        switchExpense.classList.add('active', 'type-expense');
        switchIncome.classList.remove('active', 'type-income');
      });

      switchIncome.addEventListener('click', () => {
        activeType = 'income';
        switchIncome.classList.add('active', 'type-income');
        switchExpense.classList.remove('active', 'type-expense');
      });
    }

    // Submit form de recorrência
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const description = document.getElementById('rec-description').value;
        const amountVal = parseFloat(document.getElementById('rec-amount').value);
        
        const amount = activeType === 'expense' ? -Math.abs(amountVal) : Math.abs(amountVal);

        store.addRecurrentItem({
          description,
          amount,
          type: activeType
        });

        // Limpa campos e recarrega
        document.getElementById('rec-description').value = '';
        document.getElementById('rec-amount').value = '';
        this.render(container);
      });
    }

    // Deleção de recorrências
    const itemsList = document.getElementById('recurrent-items-list');
    if (itemsList) {
      itemsList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.rec-delete-btn');
        if (deleteBtn) {
          const id = deleteBtn.dataset.id;
          if (confirm('Tem certeza que deseja excluir esta recorrência?')) {
            store.deleteRecurrentItem(id);
            this.render(container);
          }
        }
      });
    }

    // Submit form de metas
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const description = document.getElementById('goal-description').value;
        const targetAmount = parseFloat(document.getElementById('goal-amount').value);

        store.addSavingsGoal({
          description,
          targetAmount
        });

        // Limpa campos e recarrega
        document.getElementById('goal-description').value = '';
        document.getElementById('goal-amount').value = '';
        this.render(container);
      });
    }

    // Deleção de metas
    const goalsList = document.getElementById('goals-items-list');
    if (goalsList) {
      goalsList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.goal-delete-btn');
        if (deleteBtn) {
          const id = deleteBtn.dataset.id;
          if (confirm('Tem certeza que deseja excluir esta meta de poupança?')) {
            store.deleteSavingsGoal(id);
            this.render(container);
          }
        }
      });
    }
  }
};
