# 💀 CALAVERA: Dashboard de Inteligência Financeira

**CALAVERA** é uma aplicação web de gestão financeira focada em fornecer clareza e controle sobre receitas e despesas. Mais do que um simples gestor, atua como um **dashboard funcional** de métricas, permitindo o acompanhamento do fluxo de caixa através de uma interface rápida, responsiva e sem atritos.

🔗 **Deploy em Produção:** [Acessar Calavera](https://mariojamisson.github.io/CALAVERA/)

## 🎯 O Problema e a Solução (Case de Negócio)

* **A Dor:** A gestão de finanças pessoais e de pequenos negócios muitas vezes depende de planilhas complexas ou aplicações pesadas que exigem configurações exaustivas, desencorajando o registo contínuo e dificultando a análise de dados.
* **A Solução:** Um dashboard financeiro *client-side* ágil e direto ao ponto. Ele centraliza entradas e saídas de capital, fornecendo uma visão imediata do saldo atual e da saúde financeira do utilizador em tempo real.
* **Impacto e IA (Vibe Coding):** A estruturação da lógica de cálculo financeiro e o design da interface do dashboard foram prototipados utilizando **Prompt Engineering** iterativo. A aplicação comprova a capacidade de criar ferramentas de alto impacto visual e regras de negócio precisas **sem a necessidade de um backend profundo**, alavancando armazenamento local e iteração rápida com IA.

## 🚀 Funcionalidades Principais

* **📊 Dashboard Analítico Funcional**: Visualização imediata do balanço financeiro, destacando receitas, despesas e saldo final de forma clara e objetiva.
* **💸 Gestão de Fluxo de Caixa**: Registo dinâmico de transações (entradas e saídas) com atualização de estado em tempo real no DOM.
* **📱 Interface *Mobile-First***: Design responsivo e limpo, garantindo que o utilizador consiga registar transações na hora, a partir de qualquer dispositivo móvel.
* **⚡ Arquitetura *Serverless* (Zero-Setup)**: A aplicação funciona inteiramente no lado do cliente (Front-end puro), garantindo privacidade dos dados financeiros e carregamento instantâneo.

## 🛠️ Tecnologias & Arquitetura

* **Frontend e UI/UX**: HTML5, CSS3 moderno (focado em acessibilidade e legibilidade de dados numéricos) e JavaScript (ES6+).
* **Gestão de Estado**: Manipulação dinâmica do DOM e persistência leve de dados (*Local Storage*), eliminando a latência de comunicação com servidores externos.
* **Metodologia de Desenvolvimento**: Prototipagem ágil e geração de lógica matemática assistida por LLMs para garantir cálculos precisos e entrega em tempo recorde.

## 📂 Como Executar

Por ser uma aplicação leve e focada na eficiência do lado do cliente, a execução é imediata:

1. Clone o repositório para a sua máquina:
   ```bash
   git clone https://github.com/MarioJamisson/CALAVERA.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador web.
3. Para simular um ambiente de produção localmente, utilize uma extensão como o **Live Server**.

---
*Construído para provar que interfaces financeiras complexas podem ser resolvidas com front-ends limpos, prototipagem inteligente e ausência de burocracia técnica.*
