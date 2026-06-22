import { store } from './store.js';
import { Dashboard } from './components/Dashboard.js';
import { Timeline } from './components/Timeline.js';
import { Projections } from './components/Projections.js';
import { TransactionModal } from './components/TransactionModal.js';
import { Onboarding } from './components/Onboarding.js';
import { CardProjections } from './components/CardProjections.js';
import { FinancialAnalysis } from './components/FinancialAnalysis.js';

// Elementos da DOM
const viewport = document.getElementById('app-viewport');
const modalOverlay = document.getElementById('add-transaction-modal');
const btnAddHeader = document.getElementById('add-transaction-btn');
const btnAddFab = document.getElementById('fab-add');
const btnThemeToggle = document.getElementById('theme-toggle');
const btnTutorial = document.getElementById('tutorial-btn');
const btnExportBackup = document.getElementById('export-backup-btn');
const btnImportBackup = document.getElementById('import-backup-btn');
const inputImportBackupFile = document.getElementById('import-backup-file');

const tabButtons = {
  dashboard: document.getElementById('tab-dashboard'),
  timeline: document.getElementById('tab-timeline'),
  projections: document.getElementById('tab-projections'),
  'card-projections': document.getElementById('tab-card-projections'),
  analysis: document.getElementById('tab-analysis')
};

// Mapeamento de abas para componentes correspondentes
const VIEWS = {
  dashboard: Dashboard,
  timeline: Timeline,
  projections: Projections,
  'card-projections': CardProjections,
  analysis: FinancialAnalysis
};

// Inicializa a aplicação
function init() {
  // 1. Renderiza o modal (apenas uma vez para registrar listeners internos)
  TransactionModal.render(modalOverlay);

  // 2. Aplica o tema inicial salvo
  applyTheme(store.state.settings.theme);

  // 3. Renderiza a aba ativa inicial
  renderActiveView(store.state.currentTab);

  // 4. Associa eventos gerais da página
  bindGlobalEvents();

  // 5. Subscreve-se às alterações de estado
  store.subscribe(handleStateChange);
}

// Renderiza a view da aba ativa atual no viewport
function renderActiveView(tabName) {
  const isOnboarded = store.state.settings.isOnboarded;

  if (!isOnboarded) {
    // Esconde navegação, botão de adicionar e FAB para manter foco no onboarding
    if (tabButtons.dashboard) tabButtons.dashboard.parentElement.style.display = 'none';
    if (btnAddHeader) btnAddHeader.style.display = 'none';
    if (btnAddFab) btnAddFab.style.display = 'none';
    if (btnTutorial) btnTutorial.style.display = 'none';

    Onboarding.render(viewport);
    return;
  }

  // Exibe navegação e controles
  if (tabButtons.dashboard) tabButtons.dashboard.parentElement.style.display = 'flex';
  if (btnAddHeader) btnAddHeader.style.display = 'inline-block';
  if (btnAddFab) btnAddFab.style.display = 'block';
  if (btnTutorial) btnTutorial.style.display = 'inline-block';

  const component = VIEWS[tabName];
  if (component && viewport) {
    component.render(viewport);
  }

  // Atualiza classes ativas nas abas
  Object.entries(tabButtons).forEach(([key, btn]) => {
    if (btn) {
      if (key === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

// Aplica o tema visual no elemento body
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    btnThemeToggle.textContent = 'Modo Escuro';
  } else {
    document.body.classList.remove('light-mode');
    btnThemeToggle.textContent = 'Modo Claro';
  }
}

// Associa eventos de clique de abas, modal e tema
function bindGlobalEvents() {
  // Evento das abas
  Object.entries(tabButtons).forEach(([key, btn]) => {
    if (btn) {
      btn.addEventListener('click', () => {
        store.setTab(key);
      });
    }
  });

  // Evento de abrir modal (Cabeçalho e FAB)
  const openModal = () => TransactionModal.open(modalOverlay);
  if (btnAddHeader) btnAddHeader.addEventListener('click', openModal);
  if (btnAddFab) btnAddFab.addEventListener('click', openModal);

  // Evento de Tema
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      store.toggleTheme();
    });
  }

  // Evento de abrir o Tutorial/Onboarding
  if (btnTutorial) {
    btnTutorial.addEventListener('click', () => {
      Onboarding.startTutorial();
    });
  }

  // Logo recarrega dashboard
  const logo = document.getElementById('logo-link');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      store.setTab('dashboard');
    });
  }

  // Backup Exportar
  if (btnExportBackup) {
    btnExportBackup.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        transactions: store.state.transactions,
        recurrent: store.state.recurrent,
        plannedCardPurchases: store.state.plannedCardPurchases,
        savingsGoals: store.state.savingsGoals,
        settings: store.state.settings
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const dateToday = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("download", `calavera_backup_${dateToday}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // Backup Importar (Gatilho de clique no input de arquivo)
  if (btnImportBackup && inputImportBackupFile) {
    btnImportBackup.addEventListener('click', () => {
      inputImportBackupFile.click();
    });

    inputImportBackupFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const success = store.importData(parsed);
          if (success) {
            alert('✓ BACKUP RESTAURADO COM SUCESSO!');
            // Força renderização da aba atual
            renderActiveView(store.state.currentTab);
          } else {
            alert('✗ FALHA AO IMPORTAR BACKUP. Formato inválido.');
          }
        } catch (err) {
          console.error(err);
          alert('✗ ERRO AO LER O ARQUIVO DE BACKUP.');
        }
      };
      reader.readAsText(file);
      // Reseta o valor do input para permitir importar o mesmo arquivo novamente se necessário
      inputImportBackupFile.value = '';
    });
  }
}

// Trata mudanças de estado globais e atualiza a UI de forma otimizada
function handleStateChange(state, property, value) {
  if (property === 'currentTab') {
    renderActiveView(value);
  } 
  else if (property === 'settings') {
    applyTheme(value.theme);
    renderActiveView(state.currentTab);
  }
  // Se mudar transações, filtros, recorrências, compras planejadas ou metas de poupança, rerenderiza a aba atual
  else if (
    property === 'transactions' || 
    property === 'recurrent' || 
    property === 'filters' || 
    property === 'plannedCardPurchases' || 
    property === 'savingsGoals'
  ) {
    renderActiveView(state.currentTab);
  }
}

// Aguarda carregamento total do DOM
document.addEventListener('DOMContentLoaded', init);
