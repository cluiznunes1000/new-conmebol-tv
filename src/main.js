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

  // Renderiza a estrutura básica da página atual
  app.innerHTML = `
    <section class="hero">
      <h1>${title}</h1>
      <p>${desc}</p>
    </section>
    <div id="widget-container"></div>
  `;

  // Se for a Home, carrega os elementos na ordem correta
  if (page === 'home') {
    const stats = await fetchGameData(); // Busca o dado do widget
    renderWidget(stats);                 // 1. Renderiza o Widget
    await renderNews();                  // 2. Busca e renderiza a Notícia Automatizada do n8n
    renderCTA();                         // 3. Renderiza a Chamada para o Grupo VIP
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

/**
 * 4. Motor de Notícias Automatizadas (Integração n8n -> GitHub)
 */
async function renderNews() {
  const app = document.querySelector('#app');
  
  // Procura a div que você colou no index.html. Se ela tiver sido sobrescrita, recriamos aqui.
  let containerNoticia = document.querySelector('#noticia-destaque');
  if (!containerNoticia) {
    containerNoticia = document.createElement('div');
    containerNoticia.id = 'noticia-destaque';
    containerNoticia.style = 'padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 8px;';
    app.appendChild(containerNoticia);
  }

  containerNoticia.innerHTML = '<p>Carregando as últimas análises da rodada...</p>';

  // Calcula a data de hoje no formato YYYY-MM-DD
  const hoje = new Date();
  const dataFormatada = hoje.getFullYear() + '-' + 
                        String(hoje.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(hoje.getDate()).padStart(2, '0');

  // Monta a URL exata do arquivo gerado pelo robô
  const urlNoticia = `/posts/${dataFormatada}-rodada-libertadores.html`;

  try {
    const response = await fetch(urlNoticia);
    if (!response.ok) {
      throw new Error('A matéria de hoje ainda não foi gerada.');
    }
    const htmlConteudo = await response.text();
    containerNoticia.innerHTML = htmlConteudo; // Injeta o texto do Gemini na tela
  } catch (error) {
    console.log("Status da automação:", error.message);
    containerNoticia.innerHTML = '<p>Fique ligado! A análise tática da rodada de hoje sai em breve.</p>';
  }
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