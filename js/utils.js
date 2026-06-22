// Funções Utilitárias do Sistema

// Formata valor para moeda brasileira (R$ 1.250,50)
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Formata valor separando parte inteira e decimal para tipografia brutalista
export function formatCurrencyParts(value) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(absValue);
  
  // Remove "R$" do texto e divide pela vírgula
  const cleanStr = formatted.replace(/^R\$\s?/, '').trim();
  const parts = cleanStr.split(',');
  
  return {
    symbol: 'R$',
    integer: parts[0],
    cents: parts[1] || '00',
    isNegative
  };
}

// Formata data de YYYY-MM-DD para DD/MM/YYYY
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Retorna um label amigável de data (ex: "Hoje", "Ontem" ou "21 de Junho")
export function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dateStr === todayStr) {
    return 'Hoje';
  } else if (dateStr === yesterdayStr) {
    return 'Ontem';
  }
  
  const parts = dateStr.split('-');
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return `${parseInt(parts[2], 10)} de ${months[dateObj.getMonth()]}`;
}

// Retorna o nome abreviado do mês (ex: "Jan", "Fev") a partir de "YYYY-MM"
export function getMonthNameAbbr(yearMonthStr) {
  const parts = yearMonthStr.split('-');
  const monthIdx = parseInt(parts[1], 10) - 1;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[monthIdx] || yearMonthStr;
}

// Calcula as métricas de projeção financeira futura
export function calculateProjections(transactions, recurrentItems) {
  // 1. Calcula o saldo atual
  const currentBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  // 2. Calcula as médias históricas mensais de transações reais
  // Agrupa transações por mês (YYYY-MM)
  const monthlyData = {};
  
  transactions.forEach(tx => {
    const monthKey = tx.date.substring(0, 7); // "YYYY-MM"
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    
    if (tx.amount > 0) {
      monthlyData[monthKey].income += tx.amount;
    } else {
      monthlyData[monthKey].expense += Math.abs(tx.amount);
    }
  });

  const monthKeys = Object.keys(monthlyData);
  const numMonths = monthKeys.length || 1;
  
  let totalHistoricIncome = 0;
  let totalHistoricExpense = 0;
  
  monthKeys.forEach(key => {
    totalHistoricIncome += monthlyData[key].income;
    totalHistoricExpense += monthlyData[key].expense;
  });
  
  const avgHistoricIncome = totalHistoricIncome / numMonths;
  const avgHistoricExpense = totalHistoricExpense / numMonths;

  // 3. Soma das Receitas e Despesas Fixas (Recorrências) cadastradas
  const recurrentIncome = recurrentItems
    .filter(item => item.type === 'income')
    .reduce((acc, item) => acc + Math.abs(item.amount), 0);
    
  const recurrentExpense = recurrentItems
    .filter(item => item.type === 'expense')
    .reduce((acc, item) => acc + Math.abs(item.amount), 0);

  // 4. Calcula gastos variáveis estimados
  // Gastos variáveis = Média de despesas históricas menos as despesas fixas (para evitar duplicidade), com piso em 0
  const estimatedVariableExpense = Math.max(0, avgHistoricExpense - recurrentExpense);

  // 5. Saldo mensal líquido projetado
  // O usuário recebe as recorrências ativas mais outras fontes de renda, menos as despesas fixas e as variáveis estimadas
  // Se não houver histórico de renda, usamos a renda fixa. Se houver renda histórica maior, consideramos a renda histórica média.
  const estimatedMonthlyIncome = Math.max(recurrentIncome, avgHistoricIncome);
  const projectedMonthlyNet = estimatedMonthlyIncome - recurrentExpense - estimatedVariableExpense;

  // 6. Projeções para 3, 6 e 12 meses
  const projection3m = currentBalance + (projectedMonthlyNet * 3);
  const projection6m = currentBalance + (projectedMonthlyNet * 6);
  const projection12m = currentBalance + (projectedMonthlyNet * 12);

  // Histórico mensal acumulado para o gráfico
  // Ordena os meses cronologicamente
  const sortedMonths = [...monthKeys].sort();
  
  let runningBalance = 0;
  const balanceHistory = [];
  
  // Para reconstruir o histórico acumulado:
  // Primeiro ordena todas as transações por data
  const sortedTransactions = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  
  // Agrupa saldo final de cada mês
  const monthlyCumulative = {};
  let tempBalance = 0;
  
  sortedTransactions.forEach(tx => {
    tempBalance += tx.amount;
    const monthKey = tx.date.substring(0, 7);
    monthlyCumulative[monthKey] = tempBalance;
  });

  const historyPoints = Object.keys(monthlyCumulative).sort().map(month => ({
    label: getMonthNameAbbr(month),
    balance: monthlyCumulative[month]
  }));

  // Se o histórico estiver vazio, cria pontos fictícios com base no saldo atual
  if (historyPoints.length === 0) {
    historyPoints.push({ label: 'Atual', balance: currentBalance });
  }

  return {
    currentBalance,
    avgHistoricIncome,
    avgHistoricExpense,
    recurrentIncome,
    recurrentExpense,
    estimatedVariableExpense,
    projectedMonthlyNet,
    projections: {
      '3m': projection3m,
      '6m': projection6m,
      '12m': projection12m
    },
    historyPoints
  };
}
