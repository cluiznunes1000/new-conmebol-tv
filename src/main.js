// /src/main.js
// ConmebolTV — Motor de Renderização Otimizado
// ─────────────────────────────────────────────────────────────────────────────

async function fetchGameData() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) throw new Error('data.json não encontrado');
    return await response.json();
  } catch (error) {
    return { timeCasa: 'Palmeiras', timeFora: 'Peñarol', probCasa: 72 };
  }
}

async function navigate(page) {
  const app = document.querySelector('#app');
  
  // Se for home, nós limpamos apenas a parte que o JS gerencia ou apenas preenchemos
  if (page === 'home') {
    const stats = await fetchGameData();
    renderHome(stats);
  } else {
    app.innerHTML = `
      <section class="container" style="padding: 48px 0; text-align: center;">
        <h1>${page.toUpperCase()}</h1>
        <p>Conteúdo em desenvolvimento.</p>
      </section>
    `;
  }
}

window.navigate = navigate;

// Agora a renderHome não apaga o layout, ela apenas preenche o que falta
function renderHome(stats) {
  // Apenas renderizamos o que é dinâmico e não está no HTML estático
  const app = document.querySelector('#app');
  
  // Se você já tem a Hero Grid no HTML, remova o renderHero daqui
  // renderHero(app); 
  
  renderOddsWidget(app, stats);
  renderNews(app);
  renderCTA(app);
}

function renderOddsWidget(container, stats) {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="container" style="padding-top: 0;">
        <p class="section-label">Live Odds</p>
        <div class="card-odds">
          <div>
            <p class="card-odds__match">${stats.timeCasa} vs ${stats.timeFora}</p>
            <p class="card-odds__prob">Probabilidade de vitória casa: <strong>${stats.probCasa}%</strong></p>
          </div>
          <a href="#" class="btn-vip" style="font-size:12px; padding: 8px 16px;">Ver análise completa</a>
        </div>
    </div>
  `;
  container.appendChild(div);
}

async function renderNews(container) {
  const articleWrap = document.createElement('div');
  articleWrap.id = 'noticia-destaque';
  container.appendChild(articleWrap);

  const hoje = new Date();
  const ymd = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
  const urlPost = `/posts/${ymd}-rodada-libertadores.html`;

  try {
    const res = await fetch(urlPost);
    if (!res.ok) throw new Error('Matéria não gerada');
    const html = await res.text();
    articleWrap.innerHTML = `<div class="container conteudo-portal">${html}</div>`;
  } catch (err) {
    articleWrap.innerHTML = `<div class="container"><p style="text-align:center; padding: 20px;">Análise da rodada em breve.</p></div>`;
  }
}

function renderCTA(container) {
  const cta = document.createElement('section');
  cta.className = 'cta-section';
  cta.innerHTML = `
    <h2>Quer lucrar com estes dados?</h2>
    <p>Junte-se a +8.200 especialistas no Aposta Invest 2.0 e receba nossas análises diárias.</p>
    <a href="https://facebook.com/groups/sua-comunidade" target="_blank" class="btn-cta">ENTRAR NO GRUPO VIP</a>
  `;
  container.appendChild(cta);
}

init();