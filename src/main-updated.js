// /src/main.js
// ConmebolTV — Motor de Renderização v2
// Integrado com n8n: lê artigos de /public/posts/

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

async function fetchGameData() {
  try {
    const response = await fetch('/public/data.json');
    if (!response.ok) throw new Error('data.json não encontrado');
    return await response.json();
  } catch {
    try {
      const response2 = await fetch('/data.json');
      if (!response2.ok) throw new Error('fallback');
      return await response2.json();
    } catch {
      return { timeCasa: 'Palmeiras', timeFora: 'Peñarol', probCasa: 72 };
    }
  }
}

// ── Busca índice de artigos gerados pelo n8n ──────────────────────────────────
async function fetchArticleIndex() {
  try {
    const res = await fetch('/public/posts/index.json');
    if (!res.ok) throw new Error('index não encontrado');
    return await res.json();
  } catch {
    return [];
  }
}

async function navigate(page) {
  const app = document.querySelector('#app');
  const pageMap = {
    home:         { title: null,            desc: null },
    libertadores: { title: 'Libertadores',  desc: 'Análises, resultados e estatísticas da Copa Libertadores.' },
    sulamericana: { title: 'Sul-Americana', desc: 'Tudo sobre a Copa Sul-Americana 2026.' },
    brasileirao:  { title: 'Brasileirão',   desc: 'Tabela, resultados e palpites do Campeonato Brasileiro.' },
    apostas:      { title: 'Apostas',       desc: 'Dados estatísticos e odds ao vivo para investidores esportivos.' },
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
        <h1 style="font-family:var(--font-display);font-size:32px;font-weight:800;margin-bottom:8px;">${meta.title}</h1>
        <p style="color:var(--c-muted);font-size:15px;margin-bottom:28px;">${meta.desc}</p>
        <p style="color:var(--c-muted);font-size:14px;text-align:center;padding:48px 0;">
          Conteúdo desta seção será injetado pelo robô n8n. Em breve.
        </p>
      </section>
    `;
  }
}

window.navigate = navigate;

function renderHome(stats) {
  const app = document.querySelector('#app');
  app.innerHTML = '';
  renderHero(app);
  renderOddsWidget(app, stats);
  renderLatestArticles(app);
  renderCTA(app);
}

function renderHero(container) {
  const { main, secondary } = HERO_POSTS;
  const secondaryHTML = secondary.map(p => `
    <article class="news-card-sm" onclick="location.href='${p.slug}'" role="link" tabindex="0"
             aria-label="Leia mais: ${p.title}">
      <img class="news-card-sm__img" src="${p.img}" alt="" loading="lazy" width="110" height="90" />
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
      <article class="hero-main" onclick="location.href='${main.slug}'" role="link" tabindex="0"
               aria-label="Destaque principal: ${main.title}">
        <img class="hero-main__bg" src="${main.img}" alt="" width="800" height="500" loading="eager" />
        <div class="hero-main__overlay" aria-hidden="true"></div>
        <div class="hero-main__body">
          <span class="hero-main__tag">${main.tag}</span>
          <h1 class="hero-main__title">${main.title}</h1>
          <p class="hero-main__excerpt">${main.excerpt}</p>
        </div>
      </article>
      <div class="hero-secondary" aria-label="Outras notícias">${secondaryHTML}</div>
    </div>
  `;
  container.appendChild(section);
}

function renderOddsWidget(container, stats) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'max-width:1240px;margin:0 auto;padding:0 16px;';
  wrap.innerHTML = `
    <p class="section-label">Live Odds</p>
    <div class="card-odds">
      <div>
        <p class="card-odds__match">${stats.timeCasa} vs ${stats.timeFora}</p>
        <p class="card-odds__prob">Probabilidade de vitória casa: <strong>${stats.probCasa}%</strong></p>
      </div>
      <a href="#" class="btn-vip" style="font-size:12px;padding:8px 16px;">Ver análise completa</a>
    </div>
  `;
  container.appendChild(wrap);
}

// ── Seção de artigos gerados pelo n8n ────────────────────────────────────────
async function renderLatestArticles(container) {
  const section = document.createElement('section');
  section.style.cssText = 'max-width:1240px;margin:32px auto;padding:0 16px;';
  section.innerHTML = `
    <p class="section-label">Últimas Notícias</p>
    <div id="articles-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-top:16px;">
      <p style="color:var(--c-muted);font-size:14px;">Carregando notícias...</p>
    </div>
  `;
  container.appendChild(section);

  const grid = section.querySelector('#articles-grid');

  // Tenta buscar índice de artigos
  const articles = await fetchArticleIndex();

  if (articles.length === 0) {
    // Fallback: tenta buscar artigo do dia
    const hoje = new Date();
    const ymd = hoje.getFullYear() + '-'
              + String(hoje.getMonth() + 1).padStart(2, '0') + '-'
              + String(hoje.getDate()).padStart(2, '0');

    const slugs = [
      `/public/posts/${ymd}-noticia-conmeboltv.html`,
      `/public/posts/${ymd}-rodada-libertadores.html`,
    ];

    let found = false;
    for (const url of slugs) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          grid.innerHTML = `
            <article class="news-card-sm" onclick="location.href='${url}'" role="link" tabindex="0"
                     style="cursor:pointer;grid-column:1/-1;">
              <div class="news-card-sm__body" style="padding:16px;">
                <span class="news-card-sm__tag">Notícia</span>
                <h2 class="news-card-sm__title">Notícia gerada hoje pelo ConmebolTV</h2>
                <p class="news-card-sm__excerpt">Clique para ler o artigo completo gerado automaticamente.</p>
              </div>
            </article>
          `;
          found = true;
          break;
        }
      } catch {}
    }

    if (!found) {
      grid.innerHTML = `<p style="color:var(--c-muted);font-size:14px;padding:24px 0;">
        Fique ligado! As notícias de hoje chegam em breve.
      </p>`;
    }
    return;
  }

  // Renderiza cards dos artigos do índice
  grid.innerHTML = articles.slice(0, 6).map(a => `
    <article class="news-card-sm" onclick="location.href='${a.url}'" role="link" tabindex="0"
             style="cursor:pointer;border:1px solid var(--c-border,#333);border-radius:8px;overflow:hidden;">
      <div class="news-card-sm__body" style="padding:16px;">
        <span class="news-card-sm__tag">${a.tag || 'Notícia'}</span>
        <h2 class="news-card-sm__title">${a.title}</h2>
        <p class="news-card-sm__excerpt">${a.excerpt || ''}</p>
        <small style="color:var(--c-muted);font-size:12px;">${a.date || ''}</small>
      </div>
    </article>
  `).join('');
}

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

function init() {
  navigate('home');
}

init();
