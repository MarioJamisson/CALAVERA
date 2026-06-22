// Estado Global Reativo (Store)

const DEFAULT_CATEGORIES = {
  alimentacao: { name: 'Alimentação', color: 'var(--cat-alimentacao)', icon: '🍔' },
  transporte: { name: 'Transporte', color: 'var(--cat-transporte)', icon: '🚗' },
  lazer: { name: 'Lazer', color: 'var(--cat-lazer)', icon: '🍿' },
  saude: { name: 'Saúde', color: 'var(--cat-saude)', icon: '💊' },
  essenciais: { name: 'Essenciais', color: 'var(--cat-essenciais)', icon: '🏠' },
  outros: { name: 'Outros', color: 'var(--cat-outros)', icon: '🏷️' }
};

// Dados de exemplo caso o localStorage esteja vazio
const MOCK_TRANSACTIONS = [
  // Março 2026
  { id: 't1', description: 'Salário de Março', amount: 5500.00, type: 'income', category: 'essenciais', date: '2026-03-01' },
  { id: 't2', description: 'Aluguel Apto', amount: -1500.00, type: 'expense', category: 'essenciais', date: '2026-03-05' },
  { id: 't3', description: 'Supermercado Mensal', amount: -650.00, type: 'expense', category: 'alimentacao', date: '2026-03-07' },
  { id: 't4', description: 'Assinatura Streaming', amount: -55.90, type: 'expense', category: 'lazer', date: '2026-03-10' },
  { id: 't5', description: 'Combustível Carro', amount: -220.00, type: 'expense', category: 'transporte', date: '2026-03-12' },
  { id: 't6', description: 'Jantar com Amigos', amount: -180.00, type: 'expense', category: 'lazer', date: '2026-03-18' },
  { id: 't7', description: 'Consulta Odontológica', amount: -350.00, type: 'expense', category: 'saude', date: '2026-03-24' },
  { id: 't8', description: 'Freelance Design', amount: 1200.00, type: 'income', category: 'outros', date: '2026-03-27' },
  { id: 't9', description: 'Uber Fim de Semana', amount: -75.40, type: 'expense', category: 'transporte', date: '2026-03-28' },

  // Abril 2026
  { id: 't10', description: 'Salário de Abril', amount: 5500.00, type: 'income', category: 'essenciais', date: '2026-04-01' },
  { id: 't11', description: 'Aluguel Apto', amount: -1500.00, type: 'expense', category: 'essenciais', date: '2026-04-05' },
  { id: 't12', description: 'Supermercado Mensal', amount: -720.00, type: 'expense', category: 'alimentacao', date: '2026-04-06' },
  { id: 't13', description: 'Cinema & Jantar', amount: -240.00, type: 'expense', category: 'lazer', date: '2026-04-11' },
  { id: 't14', description: 'Combustível Carro', amount: -240.00, type: 'expense', category: 'transporte', date: '2026-04-14' },
  { id: 't15', description: 'Farmácia Medicamentos', amount: -95.00, type: 'expense', category: 'saude', date: '2026-04-18' },
  { id: 't16', description: 'Venda de Item Antigo', amount: 350.00, type: 'income', category: 'outros', date: '2026-04-20' },
  { id: 't17', description: 'Internet Banda Larga', amount: -120.00, type: 'expense', category: 'essenciais', date: '2026-04-22' },
  { id: 't18', description: 'Manutenção Carro', amount: -450.00, type: 'expense', category: 'transporte', date: '2026-04-25' },

  // Maio 2026
  { id: 't19', description: 'Salário de Maio', amount: 5500.00, type: 'income', category: 'essenciais', date: '2026-05-01' },
  { id: 't20', description: 'Aluguel Apto', amount: -1500.00, type: 'expense', category: 'essenciais', date: '2026-05-05' },
  { id: 't21', description: 'Supermercado Mensal', amount: -610.00, type: 'expense', category: 'alimentacao', date: '2026-05-07' },
  { id: 't22', description: 'Show ao Vivo', amount: -320.00, type: 'expense', category: 'lazer', date: '2026-05-10' },
  { id: 't23', description: 'Combustível Carro', amount: -200.00, type: 'expense', category: 'transporte', date: '2026-05-12' },
  { id: 't24', description: 'Conta de Energia', amount: -185.00, type: 'expense', category: 'essenciais', date: '2026-05-15' },
  { id: 't25', description: 'Restaurante Japa', amount: -160.00, type: 'expense', category: 'alimentacao', date: '2026-05-22' },
  { id: 't26', description: 'Freelance WebDev', amount: 2000.00, type: 'income', category: 'outros', date: '2026-05-25' },
  { id: 't27', description: 'Internet Banda Larga', amount: -120.00, type: 'expense', category: 'essenciais', date: '2026-05-27' },

  // Junho 2026 (Mês atual)
  { id: 't28', description: 'Salário de Junho', amount: 5500.00, type: 'income', category: 'essenciais', date: '2026-06-01' },
  { id: 't29', description: 'Aluguel Apto', amount: -1500.00, type: 'expense', category: 'essenciais', date: '2026-06-05' },
  { id: 't30', description: 'Supermercado e Padaria', amount: -480.00, type: 'expense', category: 'alimentacao', date: '2026-06-07' },
  { id: 't31', description: 'Combustível Carro', amount: -220.00, type: 'expense', category: 'transporte', date: '2026-06-12' },
  { id: 't32', description: 'Jantar Comemorativo', amount: -210.00, type: 'expense', category: 'lazer', date: '2026-06-15' },
  { id: 't33', description: 'Exames de Sangue', amount: -140.00, type: 'expense', category: 'saude', date: '2026-06-18' },
];

const MOCK_RECURRENT = [
  { id: 'r1', description: 'Salário Mensal', amount: 5500.00, type: 'income' },
  { id: 'r2', description: 'Aluguel Apto', amount: -1500.00, type: 'expense' },
  { id: 'r3', description: 'Internet Banda Larga', amount: -120.00, type: 'expense' },
  { id: 'r4', description: 'Academia', amount: -110.00, type: 'expense' }
];

const MOCK_PLANNED_PURCHASES = [
  { id: 'p1', description: 'PlayStation 5 Pro', amount: 6999.00, installments: 10, date: '2026-07-15' },
  { id: 'p2', description: 'Monitor Gamer Ultrawide', amount: 2800.00, installments: 4, date: '2026-08-10' }
];

class Store {
  constructor() {
    this.listeners = [];
    
    const savedTransactions = localStorage.getItem('brutalist_transactions');
    const savedRecurrent = localStorage.getItem('brutalist_recurrent');
    const savedSettings = localStorage.getItem('brutalist_settings');
    const savedPlanned = localStorage.getItem('brutalist_planned_purchases');
    const savedSavingsGoals = localStorage.getItem('brutalist_savings_goals');

    const defaultOnboarded = savedTransactions !== null || savedRecurrent !== null;
    let parsedSettings = { theme: 'dark', isOnboarded: defaultOnboarded };
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        parsedSettings = {
          theme: parsed.theme || 'dark',
          isOnboarded: parsed.isOnboarded !== undefined ? parsed.isOnboarded : defaultOnboarded
        };
      } catch (e) {
        console.error("Erro ao ler configurações do localStorage", e);
      }
    }

    const initialState = {
      transactions: savedTransactions ? JSON.parse(savedTransactions) : MOCK_TRANSACTIONS,
      recurrent: savedRecurrent ? JSON.parse(savedRecurrent) : MOCK_RECURRENT,
      plannedCardPurchases: savedPlanned ? JSON.parse(savedPlanned) : MOCK_PLANNED_PURCHASES,
      savingsGoals: savedSavingsGoals ? JSON.parse(savedSavingsGoals) : [
        { id: 'g1', description: 'Viagem de Fim de Ano', targetAmount: 8000.00 },
        { id: 'g2', description: 'Reserva de Emergência', targetAmount: 15000.00 }
      ],
      settings: parsedSettings,
      currentTab: 'dashboard',
      activeFilterCategory: 'all',
      activeFilterType: 'all',
      searchQuery: '',
      categories: DEFAULT_CATEGORIES
    };

    // Cria o Proxy reativo
    this.state = new Proxy(initialState, {
      set: (target, property, value) => {
        target[property] = value;
        
        // Salva estados persistentes
        if (property === 'transactions') {
          localStorage.setItem('brutalist_transactions', JSON.stringify(value));
        } else if (property === 'recurrent') {
          localStorage.setItem('brutalist_recurrent', JSON.stringify(value));
        } else if (property === 'settings') {
          localStorage.setItem('brutalist_settings', JSON.stringify(value));
        } else if (property === 'plannedCardPurchases') {
          localStorage.setItem('brutalist_planned_purchases', JSON.stringify(value));
        } else if (property === 'savingsGoals') {
          localStorage.setItem('brutalist_savings_goals', JSON.stringify(value));
        }

        // Notifica listeners de que o estado mudou
        this.notify(property, value);
        return true;
      }
    });
  }

  // Inscreve um callback para ser notificado quando o estado mudar
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(property, value) {
    this.listeners.forEach(listener => listener(this.state, property, value));
  }

  // Métodos auxiliares de alteração de estado (Mutators)
  
  addTransaction(transaction) {
    const newTx = {
      id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      description: transaction.description || 'Transação sem nome',
      amount: parseFloat(transaction.amount) || 0,
      type: transaction.type || 'expense',
      category: transaction.category || 'outros',
      date: transaction.date || new Date().toISOString().split('T')[0]
    };
    
    this.state.transactions = [newTx, ...this.state.transactions];
  }

  deleteTransaction(id) {
    this.state.transactions = this.state.transactions.filter(tx => tx.id !== id);
  }

  addRecurrentItem(item) {
    const newItem = {
      id: 'r_' + Date.now(),
      description: item.description || 'Recorrência sem nome',
      amount: parseFloat(item.amount) || 0,
      type: item.type || 'expense'
    };
    this.state.recurrent = [...this.state.recurrent, newItem];
  }

  deleteRecurrentItem(id) {
    this.state.recurrent = this.state.recurrent.filter(item => item.id !== id);
  }

  toggleTheme() {
    const currentTheme = this.state.settings.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.state.settings = { ...this.state.settings, theme: newTheme };
  }

  setOnboarded(value) {
    this.state.settings = { ...this.state.settings, isOnboarded: value };
  }

  resetAppToZero() {
    this.state.transactions = [];
    this.state.recurrent = [];
    this.state.plannedCardPurchases = [];
    this.state.savingsGoals = [];
  }

  loadMockData() {
    this.state.transactions = [...MOCK_TRANSACTIONS];
    this.state.recurrent = [...MOCK_RECURRENT];
    this.state.plannedCardPurchases = [...MOCK_PLANNED_PURCHASES];
    this.state.savingsGoals = [
      { id: 'g1', description: 'Viagem de Fim de Ano', targetAmount: 8000.00 },
      { id: 'g2', description: 'Reserva de Emergência', targetAmount: 15000.00 }
    ];
  }

  addSavingsGoal(goal) {
    const newGoal = {
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      description: goal.description || 'Meta de Poupança',
      targetAmount: parseFloat(goal.targetAmount) || 0
    };
    this.state.savingsGoals = [...this.state.savingsGoals, newGoal];
  }

  deleteSavingsGoal(id) {
    this.state.savingsGoals = this.state.savingsGoals.filter(goal => goal.id !== id);
  }

  importData(data) {
    if (data && typeof data === 'object') {
      if (Array.isArray(data.transactions)) this.state.transactions = data.transactions;
      if (Array.isArray(data.recurrent)) this.state.recurrent = data.recurrent;
      if (Array.isArray(data.plannedCardPurchases)) this.state.plannedCardPurchases = data.plannedCardPurchases;
      if (Array.isArray(data.savingsGoals)) this.state.savingsGoals = data.savingsGoals;
      if (data.settings && typeof data.settings === 'object') {
        this.state.settings = { ...this.state.settings, ...data.settings };
      }
      return true;
    }
    return false;
  }

  updateTransaction(id, updatedTx) {
    this.state.transactions = this.state.transactions.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          description: updatedTx.description || tx.description,
          amount: parseFloat(updatedTx.amount) || 0,
          type: updatedTx.type || tx.type,
          category: updatedTx.category || tx.category,
          date: updatedTx.date || tx.date
        };
      }
      return tx;
    });
  }

  addPlannedPurchase(purchase) {
    const newPurchase = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      description: purchase.description || 'Compra planejada',
      amount: parseFloat(purchase.amount) || 0,
      installments: parseInt(purchase.installments) || 1,
      date: purchase.date || new Date().toISOString().split('T')[0]
    };
    this.state.plannedCardPurchases = [newPurchase, ...this.state.plannedCardPurchases];
  }

  deletePlannedPurchase(id) {
    this.state.plannedCardPurchases = this.state.plannedCardPurchases.filter(p => p.id !== id);
  }

  setTab(tabName) {
    this.state.currentTab = tabName;
  }

  setFilters(filters) {
    if (filters.category !== undefined) this.state.activeFilterCategory = filters.category;
    if (filters.type !== undefined) this.state.activeFilterType = filters.type;
    if (filters.search !== undefined) this.state.searchQuery = filters.search;
    
    // Dispara notificação manual já que alteramos propriedades que não salvam no localstorage mas afetam a UI
    this.notify('filters', this.state);
  }
}

export const store = new Store();
export { DEFAULT_CATEGORIES };
