import { store } from '../store.js';

export const TransactionModal = {
  activeType: 'expense',
  activeCategory: 'outros',
  editingTransactionId: null,

  render(container) {
    container.innerHTML = `
      <div class="modal-content">
        <div class="modal-close" id="modal-close-btn">&times;</div>
        <h2 class="mb-3" id="modal-title-text">Nova Transação</h2>
        
        <form id="transaction-form" autocomplete="off">
          <!-- Tipo: Despesa ou Receita -->
          <div class="switch-group">
            <div class="switch-option active type-expense" id="switch-expense" data-type="expense">Despesa</div>
            <div class="switch-option" id="switch-income" data-type="income">Receita</div>
          </div>
          
          <!-- Valor Gigante -->
          <div class="giant-input-container">
            <span class="giant-currency">R$</span>
            <input type="number" step="0.01" min="0.01" class="giant-input" id="tx-amount" placeholder="0,00" required>
          </div>
          
          <!-- Descrição -->
          <div class="form-group">
            <label class="form-label" for="tx-description">Descrição / Nome</label>
            <input type="text" class="input-brutal" id="tx-description" placeholder="Ex: Supermercado" required>
          </div>
          
          <!-- Categorias -->
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <div class="tags-grid" id="tags-grid-container">
              <!-- Injetado dinamicamente -->
            </div>
          </div>
          
          <!-- Data -->
          <div class="form-group">
            <label class="form-label" for="tx-date">Data</label>
            <input type="date" class="input-brutal" id="tx-date" required>
          </div>
          
          <button type="submit" class="btn-brutal btn-primary w-full mt-2" id="modal-submit-btn">Registrar Transação</button>
        </form>
      </div>
    `;

    this.bindEvents(container);
    this.renderCategoryTags();
    this.resetForm();
  },

  renderCategoryTags() {
    const container = document.getElementById('tags-grid-container');
    if (!container) return;

    container.innerHTML = '';
    Object.entries(store.state.categories).forEach(([key, value]) => {
      const isSelected = key === this.activeCategory;
      const tagBtn = document.createElement('div');
      tagBtn.className = `tag-option ${isSelected ? 'active' : ''}`;
      tagBtn.dataset.category = key;
      tagBtn.innerHTML = `<span>${value.icon}</span> ${value.name}`;
      
      tagBtn.addEventListener('click', () => {
        document.querySelectorAll('.tag-option').forEach(el => el.classList.remove('active'));
        tagBtn.classList.add('active');
        this.activeCategory = key;
      });

      container.appendChild(tagBtn);
    });
  },

  bindEvents(container) {
    const closeBtn = document.getElementById('modal-close-btn');
    const switchExpense = document.getElementById('switch-expense');
    const switchIncome = document.getElementById('switch-income');
    const form = document.getElementById('transaction-form');

    // Fechar Modal
    closeBtn.addEventListener('click', () => this.close(container));
    
    // Switch de Tipo
    const setType = (type) => {
      this.activeType = type;
      if (type === 'expense') {
        switchExpense.classList.add('active', 'type-expense');
        switchIncome.classList.remove('active', 'type-income');
        this.activeCategory = 'outros';
      } else {
        switchIncome.classList.add('active', 'type-income');
        switchExpense.classList.remove('active', 'type-expense');
        this.activeCategory = 'essenciais';
      }
      this.renderCategoryTags();
    };

    switchExpense.addEventListener('click', () => setType('expense'));
    switchIncome.addEventListener('click', () => setType('income'));

    // Submit do Form
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const amountVal = parseFloat(document.getElementById('tx-amount').value);
      const description = document.getElementById('tx-description').value;
      const date = document.getElementById('tx-date').value;
      
      // Despesa salva como valor negativo no store
      const amount = this.activeType === 'expense' ? -Math.abs(amountVal) : Math.abs(amountVal);

      if (this.editingTransactionId) {
        // Modo Edição
        store.updateTransaction(this.editingTransactionId, {
          description,
          amount,
          type: this.activeType,
          category: this.activeCategory,
          date
        });
      } else {
        // Modo Criação
        store.addTransaction({
          description,
          amount,
          type: this.activeType,
          category: this.activeCategory,
          date
        });
      }

      this.close(container);
    });

    // Fechar ao clicar no overlay de fundo
    container.addEventListener('click', (e) => {
      if (e.target === container) {
        this.close(container);
      }
    });
  },

  resetForm() {
    const amountInput = document.getElementById('tx-amount');
    const descInput = document.getElementById('tx-description');
    const dateInput = document.getElementById('tx-date');
    const switchExpense = document.getElementById('switch-expense');
    const switchIncome = document.getElementById('switch-income');

    if (amountInput) amountInput.value = '';
    if (descInput) descInput.value = '';
    if (dateInput) {
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
      dateInput.value = localISOTime;
    }

    this.activeType = 'expense';
    this.activeCategory = 'outros';
    this.editingTransactionId = null;
    
    if (switchExpense && switchIncome) {
      switchExpense.classList.add('active', 'type-expense');
      switchIncome.classList.remove('active', 'type-income');
    }

    const titleText = document.getElementById('modal-title-text');
    const submitBtn = document.getElementById('modal-submit-btn');
    if (titleText) titleText.textContent = 'Nova Transação';
    if (submitBtn) submitBtn.textContent = 'Registrar Transação';
    
    this.renderCategoryTags();
  },

  open(container, transactionId = null) {
    if (transactionId) {
      this.editingTransactionId = transactionId;
      const tx = store.state.transactions.find(t => t.id === transactionId);
      if (tx) {
        const amountInput = document.getElementById('tx-amount');
        const descInput = document.getElementById('tx-description');
        const dateInput = document.getElementById('tx-date');
        const switchExpense = document.getElementById('switch-expense');
        const switchIncome = document.getElementById('switch-income');

        if (amountInput) amountInput.value = Math.abs(tx.amount).toFixed(2);
        if (descInput) descInput.value = tx.description;
        if (dateInput) dateInput.value = tx.date;

        this.activeType = tx.type;
        this.activeCategory = tx.category;

        if (switchExpense && switchIncome) {
          if (tx.type === 'expense') {
            switchExpense.classList.add('active', 'type-expense');
            switchIncome.classList.remove('active', 'type-income');
          } else {
            switchIncome.classList.add('active', 'type-income');
            switchExpense.classList.remove('active', 'type-expense');
          }
        }

        const titleText = document.getElementById('modal-title-text');
        const submitBtn = document.getElementById('modal-submit-btn');
        if (titleText) titleText.textContent = 'Editar Transação';
        if (submitBtn) submitBtn.textContent = 'Salvar Alterações';

        this.renderCategoryTags();
      }
    } else {
      this.resetForm();
    }

    container.classList.add('active');
    setTimeout(() => {
      const amountInput = document.getElementById('tx-amount');
      if (amountInput) amountInput.focus();
    }, 100);
  },

  close(container) {
    container.classList.remove('active');
    this.resetForm();
  }
};
