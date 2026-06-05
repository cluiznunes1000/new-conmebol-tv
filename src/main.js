// /src/main.js
// ConmebolTV — Motor de Renderização
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dados de preenchimento para o Hero.
 * Em produção, substitua esta lista pela resposta de um endpoint
 * que integra com sua API de Live Score / n8n.
 */
const HERO_POSTS = {
  main: {
    tag: 'Libertadores',
    title: 'Quem vai à final? Os favoritos que os dados confirmam para as oitavas da Libertadores 2026',
    excerpt: 'As probabilidades de vitória revelam o mapa do torneio. Confira quais clubes têm mais de 70% de chance de avançar e quais zebras ameaçam os gigantes.',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80',
    slug: '/posts/2026-06-03-rodada-libertadores.html'
  },
  secondary: [
    {
      tag: 'Sul-Americana',
      title: 'Sul-Americana 2026: Quais times brasileiros têm mais chances de título?',
      excerpt: 'Análise tática aponta os favoritos após a fase de grupos e os confrontos mais perigosos no mata-mata.',
      img: 'https://images.unsplash.com/photo-1551958219-acbc595b3dd5?w=400&q=70',
      slug: '#'
    },
    {
      tag: 'Apostas',
      title: 'Odds ao vivo: Por que as casas de apostas erram tanto no futebol sul-americano?',
      excerpt: 'Especialistas explicam os fatores que geram distorções nas probabilidades e como identificar valor real.',
      img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=70',
      slug: '#'
    },
    {
      tag: 'Brasileirão',
      title: 'Brasileirão 2026: Quem lidera a corrida ao título após 10 rodadas?',
      excerpt: 'Tabela atualizada e análise de desempenho dos quatro clubes que mais se destacam na competição.',
      img: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&q=70',
      slug: '#'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────
function renderHeader() {
  // O header já está no HTML estático (index.html).
  // Esta função existe para compatibilidade caso o header precise
  // de dados dinâmicos no futuro (ex: contador de notificações).
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE DADOS — API de Live Score (via data.json enquanto API não está ativa)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGameData() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) throw new Error('data.json não encontrado');
    return await response.json();
  } catch (error) {
    console.warn('[ConmebolTV] Usando fallback para dados do widget:', error.message);
    return { timeCasa: 'Palmeiras', timeFora: 'Peñarol', probCasa: 72 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
async function navigate(page) {
  const app = document.querySelector('#app');

  const pageMap = {
    home:        { title: null,           desc: null },
    libertadores: { title: 'Libertadores', desc: 'Análises, resultados e estatísticas da Copa Libertadores.' },
    sulamericana: { title: 'Sul-Americana', desc: 'Tudo sobre a Copa Sul-Americana 2026.' },
    brasileirao:  { title: 'Brasileirão',  desc: 'Tabela, resultados e palpites do Campeonato Brasileiro.' },
    apostas:      { title: 'Apostas',      desc: 'Dados estatísticos e odds ao vivo para investidores esportivos.' },
  };

  const meta = pageMap[page] || pageMap['home'];

  if (page === 'home') {
    app.innerHTML = '<div class="hero-loading">Carregando...</div>';
    const stats = await fetchGameData();
    renderHome(stats);
  } else {
    app.innerHTML = `
      <section class="hero-section">
        <p class="section-label">${meta.title}</p>
        <h1 style="font-family: var(--font-display); font-size: 32px; font-weight: 800; margin-bottom: 8px;">${meta.title}</h1>
        <p style="color: var(--c-muted); font-size: 15px; margin-bottom: 28px;">${meta.desc}</p>
        <p style="color: var(--c-muted); font-size: 14px; text-align: center; padding: 48px 0;">
          Conteúdo desta seção será injetado pelo robô n8n. Em breve.
        </p>
      </section>
    `;
  }
}

window.navigate = navigate;

// ─────────────────────────────────────────────────────────────────────────────
// HOME: renderiza o Hero Grid + Widget de Odds + Notícia + CTA
// ─────────────────────────────────────────────────────────────────────────────
function renderHome(stats) {
  const app = document.querySelector('#app');
  app.innerHTML = '';

  renderHero(app);
  renderOddsWidget(app, stats);
  renderNews(app);
  renderCTA(app);
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO GRID — manchete principal (60%) + 3 secundárias (40%)
// ─────────────────────────────────────────────────────────────────────────────
function renderHero(container) {
  const { main, secondary } = HERO_POSTS;

  const secondaryHTML = secondary.map(p => `
    <article class="news-card-sm" onclick="location.href='${p.slug}'" role="link" tabindex="0"
             aria-label="Leia mais: ${p.title}">
      <img class="news-card-sm__img"
           src="${p.img}"
           alt=""
           loading="lazy"
           width="110" height="90" />
      <div class="news-card-sm__body">
        <span class="news-card-sm__tag">${p.tag}</span>
        <h2 class="news-card-sm__title">${p.title}</h2>
        <p class="news-card-sm__excerpt">${p.excerpt}</p>
      </div>
    </article>
  `).join('');

  const section = document.createElement('section');
  section.className = 'hero-section';
  section.setAttribute('aria-label', 'Destaques');

  section.innerHTML = `
    <div class="hero-grid">
      <!-- Manchete principal -->
      <article class="hero-main"
               onclick="location.href='${main.slug}'"
               role="link" tabindex="0"
               aria-label="Destaque principal: ${main.title}">
        <img class="hero-main__bg"
             src="${main.img}"
             alt=""
             width="800" height="500"
             loading="eager" />
        <div class="hero-main__overlay" aria-hidden="true"></div>
        <div class="hero-main__body">
          <span class="hero-main__tag">${main.tag}</span>
          <h1 class="hero-main__title">${main.title}</h1>
          <p class="hero-main__excerpt">${main.excerpt}</p>
        </div>
      </article>

      <!-- Notícias secundárias -->
      <div class="hero-secondary" aria-label="Outras notícias">
        ${secondaryHTML}
      </div>
    </div>
  `;

  container.appendChild(section);
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET DE ODDS — dados do data.json / Live Score API
// ─────────────────────────────────────────────────────────────────────────────
function renderOddsWidget(container, stats) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'max-width: 1240px; margin: 0 auto; padding: 0 16px;';
  wrap.innerHTML = `
    <p class="section-label">Live Odds</p>
    <div class="card-odds">
      <div>
        <p class="card-odds__match">${stats.timeCasa} vs ${stats.timeFora}</p>
        <p class="card-odds__prob">Probabilidade de vitória casa: <strong>${stats.probCasa}%</strong></p>
      </div>
      <a href="#" class="btn-vip" style="font-size:12px; padding: 8px 16px;">Ver análise completa</a>
    </div>
  `;
  container.appendChild(wrap);
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE NOTÍCIAS — posts/ gerados pelo n8n
// ─────────────────────────────────────────────────────────────────────────────
async function renderNews(container) {
  const articleWrap = document.createElement('div');
  articleWrap.id = 'noticia-destaque';
  articleWrap.innerHTML = `
    <p style="text-align:center; font-size:14px; color: var(--c-muted); padding: 24px 0;">
      Carregando análise da rodada...
    </p>
  `;
  container.appendChild(articleWrap);

  // Data de hoje para buscar o arquivo gerado pelo n8n
  const hoje = new Date();
  const ymd = hoje.getFullYear() + '-'
            + String(hoje.getMonth() + 1).padStart(2, '0') + '-'
            + String(hoje.getDate()).padStart(2, '0');
  const urlPost = `/posts/${ymd}-rodada-libertadores.html`;

  try {
    const res = await fetch(urlPost);
    if (!res.ok) throw new Error('Matéria de hoje ainda não gerada.');
    const html = await res.text();

    const article = document.createElement('article');
    article.className = 'conteudo-portal';
    article.innerHTML = html;
    articleWrap.innerHTML = '';
    articleWrap.appendChild(article);
  } catch (err) {
    console.log('[ConmebolTV] Status n8n:', err.message);
    articleWrap.innerHTML = `
      <p style="text-align:center; font-size:14px; color: var(--c-muted); padding: 24px 0;">
        Fique ligado! A análise tática da rodada de hoje sai em breve.
      </p>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA — Grupo VIP
// ─────────────────────────────────────────────────────────────────────────────
function renderCTA(container) {
  const cta = document.createElement('section');
  cta.className = 'cta-section';
  cta.innerHTML = `
    <h2>Quer lucrar com estes dados?</h2>
    <p>Junte-se a +8.200 especialistas no Aposta Invest 2.0 e receba nossas análises diárias.</p>
    <a href="https://facebook.com/groups/sua-comunidade" target="_blank" rel="noopener" class="btn-cta">
      ENTRAR NO GRUPO VIP
    </a>
  `;
  container.appendChild(cta);
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
function init() {
  navigate('home');
}

init();