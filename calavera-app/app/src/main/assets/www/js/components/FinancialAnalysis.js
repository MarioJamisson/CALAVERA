import { store } from '../store.js';
import { formatCurrency, calculateProjections } from '../utils.js';

export const FinancialAnalysis = {
  render(container) {
    const data = calculateProjections(store.state.transactions, store.state.recurrent);
    const currentBalance = data.currentBalance;
    const projectedNet = data.projectedMonthlyNet;
    
    // Obtém receitas médias e despesas médias estimadas
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Filtra transações do mês atual
    const currentMonthTransactions = store.state.transactions.filter(tx => tx.date.startsWith(currentMonthKey));
    
    // Despesas totais do mês atual
    const totalMonthExpenses = currentMonthTransactions
      .filter(tx => tx.amount < 0)
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

    // Gastos em categorias consideradas supérfluas/discrionárias (Lazer e Outros)
    const discretionaryExpenses = currentMonthTransactions
      .filter(tx => tx.amount < 0 && (tx.category === 'lazer' || tx.category === 'outros'));

    const totalDiscretionary = discretionaryExpenses.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

    // Percentual gasto à toa
    const wastePercent = totalMonthExpenses > 0 ? (totalDiscretionary / totalMonthExpenses) * 100 : 0;
    
    // Potencial economia anual (reduzindo 50% do gasto à toa)
    const monthlySavingsPotential = totalDiscretionary * 0.5;
    const annualSavingsPotential = monthlySavingsPotential * 12;

    // Determina status de alerta para o desperdício e o mascote correspondente
    let wasteBadgeClass = 'success';
    let wasteMessage = 'Parabéns! Seus gastos supérfluos estão extremamente baixos. Você está mantendo foco total no essencial!';
    let mascotImg = 'img/mascote_feliz.png';
    let mascotTitle = 'Consumo Sob Controle';

    if (wastePercent >= 20 && wastePercent < 45) {
      wasteBadgeClass = 'warning';
      wasteMessage = 'Atenção: Seus gastos supérfluos estão em nível moderado. Com alguns pequenos ajustes você poupa ainda mais.';
      mascotImg = 'img/mascote_neutro.png';
      mascotTitle = 'Gastos Moderados';
    } else if (wastePercent >= 45) {
      wasteBadgeClass = 'danger';
      wasteMessage = 'Cuidado! Quase metade das suas despesas mensais estão indo para lazer e supérfluos. Hora de fechar as torneiras!';
      mascotImg = 'img/mascote_triste.png';
      mascotTitle = 'Alerta de Vazamento!';
    }

    // Calcula os pontos positivos (Vitórias Financeiras)
    const wins = [];

    // 1. Saldo Geral Positivo
    if (currentBalance > 0) {
      wins.push({
        title: 'Saldo no Azul',
        desc: `Seu caixa geral está positivo em <strong>${formatCurrency(currentBalance)}</strong>. Você está fora do cheque especial e livre de juros abusivos!`
      });
    }

    // 2. Taxa de Poupança Projetada
    const incomeForWins = Math.max(data.recurrentIncome, data.avgHistoricIncome);
    if (projectedNet > 0 && incomeForWins > 0) {
      const savingsRate = (projectedNet / incomeForWins) * 100;
      wins.push({
        title: `Poupando com Consistência`,
        desc: `Você projeta economizar <strong>${formatCurrency(projectedNet)}</strong> por mês (aproximadamente <strong>${savingsRate.toFixed(0)}%</strong> da sua receita). Excelente hábito!`
      });
    }

    // 3. Limite de Custos Fixos (Regra 50/30/20)
    if (data.recurrentExpense > 0 && incomeForWins > 0) {
      const fixedRatio = (data.recurrentExpense / incomeForWins) * 100;
      if (fixedRatio <= 50) {
        wins.push({
          title: 'Despesas Fixas Controladas',
          desc: `Seus custos fixos consomem apenas <strong>${fixedRatio.toFixed(0)}%</strong> do seu orçamento, abaixo do limite crítico recomendado de 50%.`
        });
      }
    }

    // 4. Reserva de Emergência
    if (data.recurrentExpense > 0 && currentBalance > 0) {
      const monthsCovered = currentBalance / data.recurrentExpense;
      if (monthsCovered >= 3) {
        wins.push({
          title: 'Reserva Emergencial Saudável',
          desc: `Seu saldo líquido acumulado atual cobre <strong>${monthsCovered.toFixed(1)} meses</strong> de todas as suas despesas recorrentes fixas.`
        });
      }
    }

    container.innerHTML = `
      <div class="mb-3">
        <h2 class="display-font" style="font-size: 1.8rem; color: var(--accent); margin-bottom: 0.5rem;">Análise de Hábitos Financeiros</h2>
        <p style="color: var(--text-secondary); max-width: 800px;">
          Nossos algoritmos brutalistas avaliam seus lançamentos reais do mês atual (${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}) e identificam ralos financeiros e pontos de vitória no seu comportamento de consumo.
        </p>
      </div>

      <div class="grid-cols-2" style="align-items: flex-start; gap: 1.5rem;">
        
        <!-- CARD: GASTANDO ATOA -->
        <div class="card-brutal analysis-card-red" style="padding: 1.5rem;">
          <h3 class="display-font mb-2" style="font-size: 1.25rem; color: var(--expense);">Gasto Supérfluo ("Gastando Àtoa")</h3>
          
          <!-- Painel Dinâmico do Mascote (Ilustração de Giz) -->
          <div class="card-brutal mb-2" style="display: flex; gap: 1rem; align-items: center; padding: 1rem; border-color: rgba(255,255,255,0.15); background-color: var(--card-bg);">
            <img src="${mascotImg}" class="chalk-sketch" style="margin: 0; width: 80px; height: 80px; flex-shrink: 0;" alt="Mascote Análise">
            <div style="flex: 1;">
              <h4 class="display-font" style="font-size: 0.95rem; margin: 0 0 0.25rem 0; color: ${wastePercent < 20 ? 'var(--income)' : wastePercent < 45 ? 'var(--text)' : 'var(--expense)'};">${mascotTitle}</h4>
              <p style="font-size: 0.8rem; margin: 0; color: var(--text-secondary); line-height: 1.4;">${wasteMessage}</p>
            </div>
          </div>

          <div class="flex align-center justify-between" style="flex-wrap: wrap;">
            <div>
              <div class="analysis-percentage-badge ${wastePercent < 20 ? 'good' : wastePercent < 45 ? 'warning' : 'bad'}">
                ${wastePercent.toFixed(0)}%
              </div>
              <div class="card-subtitle" style="margin-bottom: 1rem;">Do seu total de despesas deste mês é supérfluo</div>
            </div>
            <div class="text-right">
              <div style="font-size: 0.8rem; color: var(--text-secondary);">Valor Dispendido</div>
              <div class="proj-val expense" style="font-size: 1.5rem; font-family: var(--font-display);">${formatCurrency(totalDiscretionary)}</div>
            </div>
          </div>

          <!-- Barra de Progresso Brutalista -->
          <div class="progress-bar-brutal">
            <div class="progress-fill-brutal ${wastePercent < 20 ? 'success' : wastePercent < 45 ? 'warning' : 'danger'}" style="width: ${Math.min(100, wastePercent)}%;"></div>
          </div>

          <!-- Painel de Otimização Brutal -->
          ${totalDiscretionary > 0 ? `
            <div class="card-brutal" style="background-color: rgba(255, 42, 133, 0.05); padding: 1rem; border-style: dashed;">
              <h4 class="display-font mb-1" style="font-size: 0.85rem; color: var(--expense);">💡 Plano Brutal de Economia</h4>
              <p style="font-size: 0.8rem; color: var(--text);">
                Se você cortar <strong>50%</strong> dos seus gastos com Lazer e Outros, você salva <strong>${formatCurrency(monthlySavingsPotential)}</strong> adicionais por mês. 
                Isso acumula <strong>${formatCurrency(annualSavingsPotential)}</strong> em 1 ano livres para investir!
              </p>
            </div>
          ` : ''}

          <!-- Lista de Vazamentos do Mês -->
          <h4 class="display-font mt-3 mb-1" style="font-size: 0.9rem;">Histórico Supérfluo (Mês Atual)</h4>
          <div class="analysis-list">
            ${discretionaryExpenses.length === 0 ? `
              <div style="font-size: 0.8rem; color: var(--text-muted); padding: 1rem 0; text-align: center;">Nenhuma despesa de lazer ou outros lançada este mês.</div>
            ` : discretionaryExpenses.map(tx => `
              <div class="analysis-item-row">
                <div>
                  <span style="font-weight: 600; font-size: 0.85rem;">${tx.description}</span>
                  <span style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 0.5rem;">${tx.category === 'lazer' ? '🍿 Lazer' : '🏷️ Outros'}</span>
                </div>
                <span class="recurrent-value expense" style="font-size: 0.85rem;">${formatCurrency(tx.amount)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CARD: VITÓRIAS FINANCEIRAS -->
        <div class="card-brutal analysis-card-green" style="padding: 1.5rem;">
          <h3 class="display-font mb-2" style="font-size: 1.25rem; color: var(--income);">Suas Vitórias ("Fazendo Certo")</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${wins.length === 0 ? `
              <div class="empty-state" style="padding: 2rem;">
                <div class="empty-icon" style="color: var(--text-secondary);">📉</div>
                <div class="empty-title">Nenhum marcador positivo ainda</div>
                <p style="font-size: 0.85rem;">Cadastre transações saudáveis, economize mais mensalmente ou mantenha o saldo geral positivo para desbloquear insígnias de vitória financeira!</p>
              </div>
            ` : wins.map(win => `
              <div class="card-brutal" style="padding: 1rem; border-color: rgba(0, 255, 102, 0.3); background-color: rgba(0, 255, 102, 0.02);">
                <div class="flex align-center gap-1 mb-1">
                  <span style="color: var(--income); font-size: 1.1rem;">★</span>
                  <h4 class="display-font" style="font-size: 0.9rem; color: var(--income); margin: 0;">${win.title}</h4>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                  ${win.desc}
                </p>
              </div>
            `).join('')}
          </div>
          
          ${wins.length > 0 ? `
            <div class="text-center mt-3">
              <span class="badge-brutal badge-brutal-green" style="font-size: 0.75rem;">Consistência é Chave!</span>
            </div>
          ` : ''}
        </div>

      </div>
    `;
  }
};
