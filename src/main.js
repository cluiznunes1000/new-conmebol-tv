// /src/main.js

/**
 * 1. Componentes de Estrutura
 */
 function renderHeader() {
  const header = document.querySelector('#header');
  header.innerHTML = `
    <nav class="nav-silos">
      <div class="logo">CONMEBOL<span>TV</span></div>
      <ul>
        <li><a href="#" onclick="window.navigate('home')">Home</a></li>
        <li><a href="#" onclick="window.navigate('libertadores')">Libertadores</a></li>
        <li><a href="#" onclick="window.navigate('nacionais')">Nacionais</a></li>
        <li><a href="#" onclick="window.navigate('selecoes')">Seleções</a></li>
      </ul>
    </nav>
  `;
}

/**
 * 2. Motor de Dados (Busca o JSON)
 */
async function fetchGameData() {
  try {
    const response = await fetch('/data.json');
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar dados do jogo:", error);
    return { timeCasa: "Erro", timeFora: "Erro", probCasa: 0 };
  }
}

/**
 * 3. Navegação e Renderização
 */
async function navigate(page) {
  const app = document.querySelector('#app');
  
  const title = page === 'home' ? 'Inteligência Esportiva' : page.toUpperCase();
  const desc = page === 'home' ? 'Dados e estatísticas em tempo real.' : 'Conteúdo de ' + page;

  app.innerHTML = `
    <section class="hero">
      <h1>${title}</h1>
      <p>${desc}</p>
    </section>
    <div id="widget-container"></div>
  `;

  if (page === 'home') {
    const stats = await fetchGameData(); // O site busca o dado externo
    renderWidget(stats);
    renderCTA();
  }
}

window.navigate = navigate;

function renderWidget(stats) {
  const container = document.querySelector('#widget-container');
  container.innerHTML = `
    <div class="card-stats">
      <h3>${stats.timeCasa} vs ${stats.timeFora}</h3>
      <p>Probabilidade de Vitória: <strong>${stats.probCasa}%</strong> para casa.</p>
    </div>
  `;
}

function renderCTA() {
  const app = document.querySelector('#app');
  const cta = document.createElement('section');
  cta.className = 'cta-section';
  cta.innerHTML = `
    <h2>Quer lucrar com estes dados?</h2>
    <p>Junte-se a +8.200 especialistas no Aposta Invest 2.0 e receba nossas análises diárias.</p>
    <a href="https://facebook.com/groups/sua-comunidade" target="_blank" class="btn-cta">ENTRAR NO GRUPO VIP</a>
  `;
  app.appendChild(cta);
}

// Inicialização
function init() {
  renderHeader();
  navigate('home');
}

init();