import { store } from '../store.js';
import { formatCurrency } from '../utils.js';

export const Onboarding = {
  currentStep: 1,
  choice: 'clean', // 'clean' ou 'mock'
  startingBalance: 0,
  recurrentItems: [],

  render(container) {
    container.innerHTML = `
      <div class="onboarding-container">
        <div class="onboarding-card">
          <!-- Indicador de Passos -->
          <div class="onboarding-step-indicator">
            <div class="onboarding-step-dot ${this.currentStep >= 1 ? 'completed' : ''} ${this.currentStep === 1 ? 'active' : ''}" data-step="1">1. INFO</div>
            <div class="onboarding-step-dot ${this.currentStep >= 2 ? 'completed' : ''} ${this.currentStep === 2 ? 'active' : ''}" data-step="2">2. MODO</div>
            ${this.choice === 'clean' ? `
              <div class="onboarding-step-dot ${this.currentStep >= 3 ? 'completed' : ''} ${this.currentStep === 3 ? 'active' : ''}" data-step="3">3. SALDO</div>
              <div class="onboarding-step-dot ${this.currentStep >= 4 ? 'completed' : ''} ${this.currentStep === 4 ? 'active' : ''}" data-step="4">4. FIXOS</div>
            ` : ''}
            <div class="onboarding-step-dot ${this.currentStep === 5 ? 'active' : ''}" data-step="5">${this.choice === 'clean' ? '5' : '3'}. FIM</div>
          </div>

          <!-- Passo 1: Informações e Explicação de Funções -->
          <div class="onboarding-slide ${this.currentStep === 1 ? 'active' : ''}">
            <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
              <img src="img/mascote_neutro.png" class="chalk-sketch" style="margin: 0; width: 90px; height: 90px; flex-shrink: 0;" alt="Mascote Onboarding">
              <div style="flex: 1;">
                <h2 class="display-font" style="font-size: 1.6rem; color: var(--accent); margin: 0 0 0.25rem 0;">BEM-VINDO AO CALAVERA</h2>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
                  Olá! Sou o seu assistente de finanças brutalista. Conheça as funções básicas do app e configure seu saldo inicial passo a passo!
                </p>
              </div>
            </div>
            
            <div class="onboarding-feature-grid">
              <div class="onboarding-feature-item">
                <div class="onboarding-feature-icon">📊</div>
                <div class="onboarding-feature-title">Dashboard</div>
                <div class="onboarding-feature-desc">Visualização rápida de receitas, despesas do mês e um gráfico donut interativo que divide os gastos por categoria.</div>
              </div>
              <div class="onboarding-feature-item">
                <div class="onboarding-feature-icon">🗓️</div>
                <div class="onboarding-feature-title">Extrato</div>
                <div class="onboarding-feature-desc">Linha do tempo de todas as movimentações. Pesquise por descrição ou filtre por categorias e tipo de transação com um clique.</div>
              </div>
              <div class="onboarding-feature-item">
                <div class="onboarding-feature-icon">🔮</div>
                <div class="onboarding-feature-title">Projeções</div>
                <div class="onboarding-feature-desc">O motor matemático do app calcula automaticamente a tendência do seu saldo para os próximos 3, 6 e 12 meses com base nos custos fixos.</div>
              </div>
            </div>
          </div>

          <!-- Passo 2: Escolha de Modo (Começar do zero ou Mock) -->
          <div class="onboarding-slide ${this.currentStep === 2 ? 'active' : ''}">
            <h2 class="display-font mb-2" style="font-size: 1.8rem; color: var(--accent);">COMO DESEJA COMEÇAR?</h2>
            <p class="mb-2" style="font-size: 0.95rem; color: var(--text-secondary);">
              Você pode iniciar com um banco de dados totalmente em branco ou carregar um cenário fictício pronto para explorar os gráficos imediatamente.
            </p>

            <div class="onboarding-choice-box">
              <div class="onboarding-choice-card ${this.choice === 'clean' ? 'selected' : ''}" id="choice-clean">
                <div class="onboarding-choice-title">Começar do Zero</div>
                <div class="onboarding-choice-desc">Banco de dados limpo para você inserir suas contas e históricos do zero (Recomendado).</div>
              </div>
              <div class="onboarding-choice-card ${this.choice === 'mock' ? 'selected' : ''}" id="choice-mock">
                <div class="onboarding-choice-title">Dados de Exemplo</div>
                <div class="onboarding-choice-desc">Carrega histórico de teste dos últimos 4 meses para ver como os gráficos funcionam na prática.</div>
              </div>
            </div>
          </div>

          <!-- Passo 3: Cadastrar Saldo Inicial -->
          <div class="onboarding-slide ${this.currentStep === 3 ? 'active' : ''}">
            <h2 class="display-font mb-2" style="font-size: 1.8rem; color: var(--accent);">SEU SALDO ATUAL</h2>
            <p class="mb-3" style="font-size: 0.95rem; color: var(--text-secondary);">
              Informe quanto dinheiro você tem em conta hoje para iniciarmos o seu saldo geral.
            </p>

            <div class="form-group">
              <label class="form-label" for="initial-balance-input">Valor do Saldo Geral (R$)</label>
              <input type="number" id="initial-balance-input" class="input-brutal w-full" style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 700;" placeholder="0.00" value="${this.startingBalance || ''}">
            </div>
          </div>

          <!-- Passo 4: Cadastrar Contas Recorrentes (Fixo) -->
          <div class="onboarding-slide ${this.currentStep === 4 ? 'active' : ''}">
            <h2 class="display-font mb-2" style="font-size: 1.8rem; color: var(--accent);">CONTAS RECORRENTES</h2>
            <p class="mb-3" style="font-size: 0.95rem; color: var(--text-secondary);">
              Cadastre suas receitas fixas (como salário) e despesas fixas (como aluguel, internet, academia) para alimentar o motor de projeção de saldo.
            </p>

            <div class="grid-cols-2 gap-2" style="align-items: flex-start;">
              <!-- Formulário Interno de Recorrência -->
              <div class="card-brutal" style="padding: 1rem;">
                <div class="form-group mb-1">
                  <label class="form-label" style="font-size: 0.8rem;" for="rec-desc">Descrição</label>
                  <input type="text" id="rec-desc" class="input-brutal" style="padding: 0.4rem; font-size: 0.9rem;" placeholder="Ex: Salário, Aluguel">
                </div>
                
                <div class="form-group mb-1">
                  <label class="form-label" style="font-size: 0.8rem;" for="rec-val">Valor (R$)</label>
                  <input type="number" id="rec-val" class="input-brutal" style="padding: 0.4rem; font-size: 0.9rem;" placeholder="0.00">
                </div>

                <div class="switch-group mb-1" style="height: 32px; margin-bottom: 1rem;">
                  <div class="switch-option active type-income" id="rec-type-income" style="padding: 0.2rem; font-size: 0.75rem;">Receita</div>
                  <div class="switch-option type-expense" id="rec-type-expense" style="padding: 0.2rem; font-size: 0.75rem;">Despesa</div>
                </div>

                <button id="btn-add-rec" class="btn-brutal btn-primary btn-sm w-full">Adicionar</button>
              </div>

              <!-- Lista de Lançamentos Recorrentes Adicionados -->
              <div style="flex: 1;">
                <div class="form-label" style="font-size: 0.8rem;">Adicionados:</div>
                <div class="onboarding-recurrent-list" id="onboarding-rec-list">
                  <!-- Injetado via Javascript -->
                </div>
              </div>
            </div>
          </div>

          <!-- Passo 5: Conclusão -->
          <div class="onboarding-slide ${this.currentStep === 5 ? 'active' : ''}">
            <h2 class="display-font mb-2 text-center" style="font-size: 2rem; color: var(--income);">TUDO PRONTO!</h2>
            
            <div class="success-checkmark-box" style="margin: 1.5rem 0;">
              <img src="img/mascote_feliz.png" class="chalk-sketch" style="width: 100px; height: 100px; border-color: var(--income); box-shadow: 4px 4px 0px 0px var(--income);" alt="Mascote Feliz">
            </div>

            <p class="text-center mb-3" style="font-size: 1rem; color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem auto;">
              O seu ambiente foi configurado. Você está no controle das suas finanças e das suas projeções futuras a partir de agora.
            </p>
            
            <div class="card-brutal text-center" style="padding: 1rem; border-color: var(--accent); background-color: rgba(255, 0, 127, 0.05);">
              <h4 class="display-font mb-1" style="color: var(--accent); font-size: 0.9rem;">Dica Brutalista</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">
                Você pode utilizar o botão <strong>"+ Lançar"</strong> no topo da tela ou o botão flutuante a qualquer momento para adicionar transações diárias.
              </p>
            </div>
          </div>

          <!-- Navegação -->
          <div class="onboarding-nav-buttons">
            <button id="onboarding-back" class="btn-brutal btn-sm ${this.currentStep === 1 ? 'hidden' : ''}">Voltar</button>
            <div style="flex: 1;"></div>
            <button id="onboarding-next" class="btn-brutal btn-primary btn-sm">${this.currentStep === 5 ? 'Entrar no App' : 'Avançar'}</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    if (this.currentStep === 4) {
      this.renderRecurrentList();
    }
  },

  bindEvents(container) {
    const nextBtn = document.getElementById('onboarding-next');
    const backBtn = document.getElementById('onboarding-back');
    const choiceClean = document.getElementById('choice-clean');
    const choiceMock = document.getElementById('choice-mock');

    // Navegar para próximo passo
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep === 2) {
          // Processa escolhas de banco de dados
          if (this.choice === 'clean') {
            store.resetAppToZero();
            this.currentStep = 3;
          } else {
            store.loadMockData();
            this.currentStep = 5; // Pula saldo e fixos
          }
          this.render(container);
        } 
        else if (this.currentStep === 3) {
          // Processa saldo inicial
          const balanceInput = document.getElementById('initial-balance-input');
          const value = balanceInput ? parseFloat(balanceInput.value) : 0;
          this.startingBalance = isNaN(value) ? 0 : value;

          if (this.startingBalance !== 0) {
            // Cria transação de saldo inicial
            store.addTransaction({
              description: 'Saldo Inicial Cadastrado',
              amount: this.startingBalance,
              type: this.startingBalance > 0 ? 'income' : 'expense',
              category: 'essenciais',
              date: new Date().toISOString().split('T')[0]
            });
          }

          this.currentStep = 4;
          this.render(container);
        } 
        else if (this.currentStep === 4) {
          this.currentStep = 5;
          this.render(container);
        } 
        else if (this.currentStep === 5) {
          // Finaliza onboarding
          store.setOnboarded(true);
        } 
        else {
          this.currentStep++;
          this.render(container);
        }
      });
    }

    // Voltar passo
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.currentStep === 5 && this.choice === 'mock') {
          this.currentStep = 2; // Volta da conclusão para o modo
        } else {
          this.currentStep--;
        }
        this.render(container);
      });
    }

    // Seleção de modo
    if (choiceClean) {
      choiceClean.addEventListener('click', () => {
        this.choice = 'clean';
        this.render(container);
      });
    }
    if (choiceMock) {
      choiceMock.addEventListener('click', () => {
        this.choice = 'mock';
        this.render(container);
      });
    }

    // Passo 4 - Adicionar item recorrente
    if (this.currentStep === 4) {
      const btnAddRec = document.getElementById('btn-add-rec');
      const recTypeIncome = document.getElementById('rec-type-income');
      const recTypeExpense = document.getElementById('rec-type-expense');
      let selectedType = 'income';

      if (recTypeIncome && recTypeExpense) {
        recTypeIncome.addEventListener('click', () => {
          selectedType = 'income';
          recTypeIncome.classList.add('active');
          recTypeExpense.classList.remove('active');
        });
        recTypeExpense.addEventListener('click', () => {
          selectedType = 'expense';
          recTypeExpense.classList.add('active');
          recTypeIncome.classList.remove('active');
        });
      }

      if (btnAddRec) {
        btnAddRec.addEventListener('click', () => {
          const descInput = document.getElementById('rec-desc');
          const valInput = document.getElementById('rec-val');
          
          const desc = descInput ? descInput.value.trim() : '';
          const rawVal = valInput ? parseFloat(valInput.value) : 0;
          const val = isNaN(rawVal) ? 0 : rawVal;

          if (!desc) {
            alert('Por favor, informe uma descrição para a conta recorrente.');
            return;
          }
          if (val <= 0) {
            alert('O valor deve ser maior que zero.');
            return;
          }

          // Ajusta sinal do valor se for despesa
          const finalVal = selectedType === 'expense' ? -val : val;

          // Adiciona ao store
          store.addRecurrentItem({
            description: desc,
            amount: finalVal,
            type: selectedType
          });

          // Limpa inputs
          if (descInput) descInput.value = '';
          if (valInput) valInput.value = '';

          // Rerenderiza a lista
          this.renderRecurrentList();
        });
      }
    }
  },

  renderRecurrentList() {
    const listContainer = document.getElementById('onboarding-rec-list');
    if (!listContainer) return;

    const items = store.state.recurrent;
    if (items.length === 0) {
      listContainer.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding-top: 1.5rem;">
          Nenhum item fixo cadastrado.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = items.map(item => `
      <div class="recurrent-item" style="padding: 0.35rem 0.5rem; margin-bottom: 0.25rem; font-size: 0.8rem; border-color: rgba(255, 255, 255, 0.15);">
        <div class="recurrent-details">
          <span class="recurrent-title">${item.description}</span>
          <span class="recurrent-sub">${item.type === 'income' ? 'Mensal fixo' : 'Mensal fixo'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="recurrent-value ${item.type === 'income' ? 'income' : 'expense'}">
            ${formatCurrency(item.amount)}
          </span>
          <button class="btn-delete" data-id="${item.id}" style="font-size: 0.8rem; background: none; border: none; cursor: pointer; color: var(--text-secondary);" title="Excluir">✕</button>
        </div>
      </div>
    `).join('');

    // Adiciona evento de delete
    const deleteButtons = listContainer.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        store.deleteRecurrentItem(id);
        this.renderRecurrentList();
      });
    });
  },

  // Método estático para iniciar o tutorial do zero
  startTutorial() {
    this.currentStep = 1;
    this.choice = 'clean';
    this.startingBalance = 0;
    store.setOnboarded(false);
  }
};
