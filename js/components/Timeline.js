import { store } from '../store.js';
import { formatCurrency, formatDateLabel } from '../utils.js';
import { TransactionModal } from './TransactionModal.js';

export const Timeline = {
  render(container) {
    // 1. Obtém e filtra as transações
    const txs = this.getFilteredTransactions();

    // 2. Ordena as transações por data descrescente (mais recentes primeiro)
    const sortedTxs = [...txs].sort((a, b) => b.date.localeCompare(a.date));

    // 3. Agrupa por data
    const groupedTxs = {};
    sortedTxs.forEach(tx => {
      if (!groupedTxs[tx.date]) {
        groupedTxs[tx.date] = [];
      }
      groupedTxs[tx.date].push(tx);
    });

    const modalOverlay = document.getElementById('add-transaction-modal');

    // 4. Renderiza estrutura principal
    container.innerHTML = `
      <!-- Cabeçalho com Ilustração de Giz -->
      <div class="card-brutal mb-3" style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; padding: 1rem 1.5rem;">
        <img src="img/mascote_neutro.png" class="chalk-sketch" style="margin: 0; width: 90px; height: 90px; flex-shrink: 0;" alt="Mascote Detetive">
        <div style="flex: 1; min-width: 250px;">
          <h3 class="display-font" style="font-size: 1.2rem; margin-bottom: 0.25rem; color: var(--accent);">Histórico de Lançamentos</h3>
          <p style="font-size: 0.825rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">
            Consulte a linha do tempo de receitas e despesas. Você pode pesquisar por nome, filtrar por tipo e categoria, 
            <strong>editar (✎)</strong> ou <strong>excluir (✕)</strong> qualquer registro diretamente.
          </p>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="filter-bar" style="align-items: center; gap: 0.75rem;">
        <input type="text" class="input-brutal filter-search" id="timeline-search" placeholder="Pesquisar por descrição..." value="${store.state.searchQuery}">
        
        <select class="filter-select" id="timeline-filter-type" style="background-color: var(--card-bg);">
          <option value="all" ${store.state.activeFilterType === 'all' ? 'selected' : ''}>Todos os Fluxos</option>
          <option value="income" ${store.state.activeFilterType === 'income' ? 'selected' : ''}>Receitas (Entradas)</option>
          <option value="expense" ${store.state.activeFilterType === 'expense' ? 'selected' : ''}>Despesas (Saídas)</option>
        </select>
        
        <select class="filter-select" id="timeline-filter-category" style="background-color: var(--card-bg);">
          <option value="all" ${store.state.activeFilterCategory === 'all' ? 'selected' : ''}>Todas as Categorias</option>
          ${Object.entries(store.state.categories).map(([key, val]) => `
            <option value="${key}" ${store.state.activeFilterCategory === key ? 'selected' : ''}>${val.icon} ${val.name}</option>
          `).join('')}
        </select>

        <button id="timeline-add-btn" class="btn-brutal btn-primary btn-sm" style="flex-shrink: 0; height: 42px;">+ Lançar</button>
      </div>

      <!-- Timeline de Transações -->
      <div class="timeline-container" id="timeline-list">
        ${Object.keys(groupedTxs).length === 0 ? this.renderEmptyState() : this.renderGroupedList(groupedTxs)}
      </div>
    `;

    this.bindEvents(container, modalOverlay);
  },

  getFilteredTransactions() {
    return store.state.transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(store.state.searchQuery.toLowerCase());
      const matchesType = store.state.activeFilterType === 'all' || tx.type === store.state.activeFilterType;
      const matchesCategory = store.state.activeFilterCategory === 'all' || tx.category === store.state.activeFilterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  },

  renderGroupedList(groupedTxs) {
    const sortedDates = Object.keys(groupedTxs).sort((a, b) => b.localeCompare(a));
    
    return sortedDates.map(dateStr => {
      const label = formatDateLabel(dateStr);
      const listItems = groupedTxs[dateStr].map(tx => {
        const cat = store.state.categories[tx.category] || { name: 'Outros', icon: '🏷️', color: 'var(--text-secondary)' };
        const amountFormatted = formatCurrency(tx.amount);
        const amountSign = tx.amount > 0 ? '+' : '';
        const amountClass = tx.type === 'income' ? 'income' : 'expense';

        return `
          <div class="timeline-item" data-id="${tx.id}">
            <div class="timeline-info">
              <span class="category-badge" style="background-color: ${cat.color};">${cat.icon}</span>
              <span class="timeline-description">${tx.description}</span>
            </div>
            <div class="timeline-right" style="gap: 0.5rem;">
              <span class="timeline-value ${amountClass}">${amountSign}${amountFormatted}</span>
              <button class="btn-edit btn-brutal" title="Editar Transação" data-id="${tx.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: rgba(255,255,255,0.2);">✎</button>
              <button class="btn-delete" title="Excluir Transação" data-id="${tx.id}">✕</button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="timeline-date-group">
          <div class="timeline-date-header">${label}</div>
          <div>${listItems}</div>
        </div>
      `;
    }).join('');
  },

  renderEmptyState() {
    return `
      <div class="empty-state">
        <img src="img/mascote_neutro.png" class="chalk-sketch mb-2" style="width: 100px; height: 100px;" alt="Mascote Neutro">
        <div class="empty-title">Nenhuma transação encontrada</div>
        <p>Ajuste os filtros de pesquisa ou adicione um novo registro no botão de +</p>
      </div>
    `;
  },

  bindEvents(container, modalOverlay) {
    const searchInput = document.getElementById('timeline-search');
    const typeSelect = document.getElementById('timeline-filter-type');
    const catSelect = document.getElementById('timeline-filter-category');
    const addBtn = document.getElementById('timeline-add-btn');

    // Botão Adicionar Lançamento
    if (addBtn && modalOverlay) {
      addBtn.addEventListener('click', () => {
        TransactionModal.open(modalOverlay);
      });
    }

    // Escuta inputs de filtros
    searchInput.addEventListener('input', (e) => {
      store.setFilters({ search: e.target.value });
    });

    typeSelect.addEventListener('change', (e) => {
      store.setFilters({ type: e.target.value });
    });

    catSelect.addEventListener('change', (e) => {
      store.setFilters({ category: e.target.value });
    });

    if (document.activeElement && document.activeElement.id === 'timeline-search') {
      const val = searchInput.value;
      searchInput.value = '';
      searchInput.value = val;
      searchInput.focus();
    }

    // Ações na listagem (editar e excluir)
    const listContainer = document.getElementById('timeline-list');
    listContainer.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete');
      const editBtn = e.target.closest('.btn-edit');

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
          store.deleteTransaction(id);
        }
      }

      if (editBtn && modalOverlay) {
        const id = editBtn.dataset.id;
        TransactionModal.open(modalOverlay, id);
      }
    });
  }
};
