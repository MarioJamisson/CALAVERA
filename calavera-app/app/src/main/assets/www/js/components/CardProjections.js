import { store } from '../store.js';
import { formatCurrency, calculateProjections } from '../utils.js';

export const CardProjections = {
  render(container) {
    const data = calculateProjections(store.state.transactions, store.state.recurrent);
    const currentBalance = data.currentBalance;
    const projectedNet = data.projectedMonthlyNet;
    const plannedPurchases = store.state.plannedCardPurchases;

    // Calcula impacto total acumulado
    const totalInstallmentsValue = plannedPurchases.reduce((acc, p) => {
      const installmentValue = p.amount / p.installments;
      return acc + installmentValue;
    }, 0);

    const projectedNetWithPlanned = projectedNet - totalInstallmentsValue;

    // Determina o mascote e a fala baseada nas projeções
    let mascotImg = 'img/mascote_neutro.png';
    let mascotTitle = 'Simulador de Compras';
    let mascotSpeech = 'Insira uma simulação de compra parcelada ou à vista para que eu possa avaliar o impacto no seu orçamento.';

    if (plannedPurchases.length > 0) {
      if (projectedNetWithPlanned < 0) {
        mascotImg = 'img/mascote_triste.png';
        mascotTitle = 'Risco de Vermelho!';
        mascotSpeech = 'Cuidado! A soma das parcelas consome todo o seu saldo livre mensal de sobra. Eu não recomendo avançar com todos esses planos.';
      } else {
        mascotImg = 'img/mascote_feliz.png';
        mascotTitle = 'Orçamento Saudável!';
        mascotSpeech = 'Excelente! Seu saldo projetado continuará positivo mesmo pagando todas as parcelas simuladas simultaneamente. Aprovado!';
      }
    }

    container.innerHTML = `
      <div class="mb-3">
        <h2 class="display-font" style="font-size: 1.8rem; color: var(--accent); margin-bottom: 0.5rem;">Planejamento de Compras no Cartão</h2>
        <p style="color: var(--text-secondary); max-width: 800px;">
          Simule compras futuras no cartão de crédito. Nosso motor brutalista analisa o seu saldo atual (para compras à vista) e o seu saldo líquido mensal projetado (para compras parceladas) e calcula o grau de recomendação de cada aquisição.
        </p>
      </div>

      <!-- Grid Principal -->
      <div class="grid-cols-3" style="align-items: flex-start; gap: 1.5rem;">
        
        <!-- Formulário de Simulação -->
        <div class="card-brutal" style="grid-column: span 1; padding: 1.5rem;">
          <h3 class="display-font mb-2" style="font-size: 1.1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;">Simular Nova Compra</h3>
          
          <div class="form-group mb-2">
            <label class="form-label" for="plan-desc">Descrição do Item</label>
            <input type="text" id="plan-desc" class="input-brutal w-full" placeholder="Ex: Notebook M4, PlayStation 6">
          </div>

          <div class="form-group mb-2">
            <label class="form-label" for="plan-amount">Valor Total (R$)</label>
            <input type="number" id="plan-amount" class="input-brutal w-full" placeholder="0.00">
          </div>

          <div class="form-group mb-3">
            <label class="form-label" for="plan-installments">Parcelas</label>
            <select id="plan-installments" class="filter-select w-full" style="background-color: var(--card-bg);">
              <option value="1">À vista (1x)</option>
              <option value="2">2x sem juros</option>
              <option value="3">3x sem juros</option>
              <option value="4">4x sem juros</option>
              <option value="6">6x sem juros</option>
              <option value="10">10x sem juros</option>
              <option value="12">12x sem juros</option>
              <option value="18">18x sem juros</option>
              <option value="24">24x sem juros</option>
            </select>
          </div>

          <button id="btn-add-planned" class="btn-brutal btn-primary btn-sm w-full">Adicionar Simulação</button>
        </div>

        <!-- Painel de Impacto e Lista de Compras -->
        <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Painel Dinâmico do Mascote (Ilustração de Giz) -->
          <div class="card-brutal" style="display: flex; gap: 1.5rem; align-items: center; padding: 1.25rem 1.5rem; border-color: ${plannedPurchases.length > 0 ? (projectedNetWithPlanned < 0 ? 'var(--expense)' : 'var(--income)') : 'var(--border)'}; background-color: var(--card-bg); transition: all var(--transition-normal);">
            <img src="${mascotImg}" class="chalk-sketch" style="margin: 0; width: 100px; height: 100px; flex-shrink: 0;" alt="Mascote Projeção">
            <div style="flex: 1;">
              <h3 class="display-font" style="font-size: 1.25rem; margin-bottom: 0.25rem; color: ${plannedPurchases.length > 0 ? (projectedNetWithPlanned < 0 ? 'var(--expense)' : 'var(--income)') : 'var(--text)'};">${mascotTitle}</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
                ${mascotSpeech}
              </p>
            </div>
          </div>

          <!-- Impacto Acumulado no Orçamento -->
          <div class="card-brutal" style="padding: 1.5rem; background-color: var(--card-bg);">
            <h3 class="display-font mb-2" style="font-size: 1.1rem; color: var(--accent);">Impacto Acumulado no Orçamento</h3>
            
            <div class="grid-cols-3" style="gap: 1rem;">
              <div class="text-center" style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 0.5rem;">
                <div class="proj-title" style="font-size: 0.75rem;">Saldo Mensal Líquido</div>
                <div class="proj-val ${projectedNet >= 0 ? 'income' : 'expense'}" style="font-size: 1.25rem;">
                  ${formatCurrency(projectedNet)}
                </div>
              </div>
              
              <div class="text-center" style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 0.5rem;">
                <div class="proj-title" style="font-size: 0.75rem;">Total de Parcelas Ativas</div>
                <div class="proj-val expense" style="font-size: 1.25rem; color: var(--expense);">
                  -${formatCurrency(totalInstallmentsValue)}
                </div>
              </div>

              <div class="text-center">
                <div class="proj-title" style="font-size: 0.75rem;">Saldo Líquido Pós-Compras</div>
                <div class="proj-val ${projectedNetWithPlanned >= 0 ? 'income' : 'expense'}" style="font-size: 1.25rem; color: ${projectedNetWithPlanned >= 0 ? 'var(--income)' : 'var(--expense)'};">
                  ${formatCurrency(projectedNetWithPlanned)}
                </div>
              </div>
            </div>
          </div>

          <!-- Listagem das Compras Simuladas -->
          <div class="card-brutal" style="padding: 1.5rem;">
            <h3 class="display-font mb-2" style="font-size: 1.1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;">Itens Simulados</h3>
            
            <div id="planned-list-container">
              <!-- Injetado via Javascript -->
            </div>
          </div>

        </div>
      </div>
    `;

    this.renderPlannedPurchasesList(plannedPurchases, currentBalance, projectedNet, container);
    this.bindEvents(container);
  },

  renderPlannedPurchasesList(purchases, currentBalance, projectedNet, container) {
    const listContainer = document.getElementById('planned-list-container');
    if (!listContainer) return;

    if (purchases.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <div class="empty-title">Nenhuma compra planejada</div>
          <p style="font-size: 0.85rem;">Preencha o formulário ao lado para simular compras futuras no cartão e testar a viabilidade.</p>
        </div>
      `;
      return;
    }

    let html = '';

    purchases.forEach(p => {
      const installmentValue = p.amount / p.installments;
      const ranking = this.calculateFeasibility(p.amount, p.installments, currentBalance, projectedNet);

      html += `
        <div class="card-brutal mb-2" style="padding: 1rem; background-color: var(--bg); transition: transform var(--transition-fast);">
          <div class="flex justify-between align-center mb-1" style="flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h4 class="display-font" style="font-size: 1.05rem; color: var(--text);">${p.description}</h4>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">
                Valor Total: <strong>${formatCurrency(p.amount)}</strong>
                ${p.installments > 1 ? ` | Parcelamento: <strong>${p.installments}x de ${formatCurrency(installmentValue)}</strong>` : ' | À vista'}
              </div>
            </div>
            
            <div class="flex align-center gap-2">
              <span class="badge-brutal ${ranking.badgeClass}">${ranking.label}</span>
              <button class="btn-delete-planned btn-brutal btn-sm" data-id="${p.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; height: auto;" title="Excluir">
                Excluir
              </button>
            </div>
          </div>
          <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
            <strong>Diagnóstico:</strong> ${ranking.explanation}
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;

    // Adiciona evento de deletar
    const deleteButtons = listContainer.querySelectorAll('.btn-delete-planned');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.deletePlannedPurchase(id);
        this.render(container);
      });
    });
  },

  calculateFeasibility(totalAmount, installments, currentBalance, projectedNet) {
    if (installments === 1) {
      const pct = (totalAmount / (currentBalance || 1)) * 100;
      if (currentBalance <= 0) {
        return {
          label: 'Não recomendável',
          badgeClass: 'badge-brutal-red',
          explanation: 'Seu saldo atual é negativo ou zero. Fazer compras à vista agora gerará endividamento imediato.'
        };
      }
      if (pct < 15) {
        return {
          label: 'Possível',
          badgeClass: 'badge-brutal-green',
          explanation: `A compra representa ${pct.toFixed(1)}% do seu saldo atual. O impacto é baixo e perfeitamente aceitável.`
        };
      } else if (pct <= 40) {
        return {
          label: 'Até dá',
          badgeClass: 'badge-brutal-yellow',
          explanation: `A compra compromete ${pct.toFixed(1)}% do seu saldo atual. É viável, mas reduzirá consideravelmente sua liquidez imediata.`
        };
      } else {
        return {
          label: 'Não recomendável',
          badgeClass: 'badge-brutal-red',
          explanation: `A compra consome ${pct.toFixed(1)}% do seu saldo atual (mais de 40%). Risco muito alto de ficar sem caixa emergencial.`
        };
      }
    } else {
      const installmentValue = totalAmount / installments;
      
      if (projectedNet <= 0) {
        return {
          label: 'Não recomendável',
          badgeClass: 'badge-brutal-red',
          explanation: 'Seu orçamento mensal projetado já está no vermelho (ou empatado). Adicionar novas parcelas aprofundará o déficit.'
        };
      }

      const pct = (installmentValue / projectedNet) * 100;

      if (pct < 20) {
        return {
          label: 'Possível',
          badgeClass: 'badge-brutal-green',
          explanation: `A parcela consome apenas ${pct.toFixed(1)}% do seu saldo líquido de sobra mensal. Muito seguro.`
        };
      } else if (pct <= 50) {
        return {
          label: 'Até dá',
          badgeClass: 'badge-brutal-yellow',
          explanation: `A parcela compromete ${pct.toFixed(1)}% do seu saldo líquido mensal. Viável, mas evite acumular outros financiamentos.`
        };
      } else {
        return {
          label: 'Não recomendável',
          badgeClass: 'badge-brutal-red',
          explanation: `A parcela consome ${pct.toFixed(1)}% (mais da metade) do seu saldo líquido mensal livre. Risco alto de descontrole de fatura.`
        };
      }
    }
  },

  bindEvents(container) {
    const btnAdd = document.getElementById('btn-add-planned');
    if (!btnAdd) return;

    btnAdd.addEventListener('click', () => {
      const descInput = document.getElementById('plan-desc');
      const amountInput = document.getElementById('plan-amount');
      const installmentsSelect = document.getElementById('plan-installments');

      const desc = descInput ? descInput.value.trim() : '';
      const rawAmount = amountInput ? parseFloat(amountInput.value) : 0;
      const amount = isNaN(rawAmount) ? 0 : rawAmount;
      const installments = installmentsSelect ? parseInt(installmentsSelect.value) : 1;

      if (!desc) {
        alert('Por favor, insira uma descrição do item.');
        return;
      }
      if (amount <= 0) {
        alert('O valor da compra deve ser maior que zero.');
        return;
      }

      store.addPlannedPurchase({
        description: desc,
        amount: amount,
        installments: installments
      });

      this.render(container);
    });
  }
};
