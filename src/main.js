// /src/main.js
// ConmebolTV — Motor de Renderização v3
// Notícias dinâmicas via GitHub API + WhatsApp CTA

// ── Configuração ──────────────────────────────────────────────────────────────
const GITHUB_REPO = 'cluiznunes1000/new-conmebol-tv';
const POSTS_PATH = 'public/posts';
const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbDB4sC4Y9li0ZEoGt3i';

// ── Hero fixo (atualizar manualmente ou via n8n futuramente) ─────────────────
const HERO_POSTS = {
  main: {
    tag: 'Libertadores',
    title: 'Quem vai à final? Os favoritos que os dados confirmam para as oitavas da Libertadores 2026',
    excerpt: 'As probabilidades de vitória revelam o mapa do torneio. Confira quais clubes têm mais de 70% de chance de avançar.',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80',
    slug: '/public/posts/2026-06-03-rodada-libertadores.html'
  },
  secondary: [
    {
      tag: 'Sul-Americana',
      title: 'Sul-Americana 2026: Quais times brasileiros têm mais chances de título?',
      excerpt: 'Análise tática aponta os favoritos após a fase de grupos.',
      img: 'https://images.unsplash.com/photo-1551958219-acbc595b3dd5?w=400&q=70',
      slug: '#'
    },
    {
      tag: 'Apostas',
      title: 'Odds ao vivo: Por que as casas de apostas erram tanto no futebol sul-americano?',
      excerpt: 'Especialistas explicam os fatores que geram distorções nas probabilidades.',
      img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=70',
      slug: '#'
    },
    {
      tag: 'Brasileirão',
      title: 'Brasileirão 2026: Quem lidera a corrida ao título após 10 rodadas?',
      excerpt: 'Tabela atualizada e análise de desempenho dos quatro clubes que mais se destacam.',
      img: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&q=70',
      slug: '#'
    }
  ]
};

// ── Buscar artigos da GitHub API ──────────────────────────────────────────────
async function fetchArticles() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    if (!res.ok) throw new Error('GitHub API error');
    const files = await res.json();

    return files
      .filter(f => f.name.endsWith('.html') && f.name !== 'index.html')
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 12)
      .map(f => {
        const name = f.name.replace('.html', '');
        const parts = name.split('-');
        const date = parts.slice(0, 3).join('-');
        const slugParts = parts.slice(3);
        const title = slugParts
          .join(' ')
          .replace(/noticia conmebol \d+/i, 'Notícia ConmebolTV')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return {
          title: title || 'Notícia ConmebolTV',
          url: `/${POSTS_PATH}/${f.name}`,
          date: date,
          tag: detectTag(f.name)
        };
      });
  } catch (e) {
    console.warn('[ConmebolTV] GitHub API:', e.message);
    return [];
  }
}

function detectTag(filename) {
  const f = filename.toLowerCase();
  if (f.includes('libertadores')) return 'Libertadores';
  if (f.includes('sul-americana') || f.includes('sulamericana')) return 'Sul-Americana';
  if (f.includes('brasileirao') || f.includes('brasileiro')) return 'Brasileirão';
  if (f.includes('feminina') || f.includes('feminino')) return 'Futebol Feminino';
  if (f.includes('copa')) return 'Copa do Mundo';
  if (f.includes('selecao') || f.includes('seleção')) return 'Seleções';
  if (f.includes('mirassol') || f.includes('flamengo') || f.includes('palmeiras')) return 'Clubes';
  return 'CONMEBOL';
}

// ── Buscar dados ao vivo ──────────────────────────────────────────────────────
async function fetchGameData() {
  try {
    const res = await fetch('/public/data.json');
    if (!res.ok) throw new Error('sem data.json');
    return await res.json();
  } catch {
    return { timeCasa: 'Palmeiras', timeFora: 'Peñarol', probCasa: 72 };
  }
}

// ── Navegação ─────────────────────────────────────────────────────────────────
async function navigate(page) {
  const app = document.querySelector('#app');
  const pageMap = {
    home:         { title: null,            desc: null },
    libertadores: { title: 'Libertadores',  desc: 'Análises, resultados e estatísticas da Copa Libertadores.' },
    sulamericana: { title: 'Sul-Americana', desc: 'Tudo sobre a Copa Sul-Americana 2026.' },
    brasileirao:  { title: 'Brasileirão',   desc: 'Tabela, resultados e palpites do Campeonato Brasileiro.' },
    apostas:      { title: 'Apostas',       desc: 'Dados estatísticos e odds ao vivo.' },
  };

  const meta = pageMap[page] || pageMap['home'];

  if (page === 'home') {
    app.innerHTML = '<div class="hero-loading">Carregando...</div>';
    const [stats, articles] = await Promise.all([fetchGameData(), fetchArticles()]);
    renderHome(stats, articles);
  } else {
    app.innerHTML = `
      <section class="hero-section">
        <p class="section-label">${meta.title}</p>
        <h1 style="font-family:var(--font-display);font-size:32px;font-weight:800;margin-bottom:8px;">${meta.title}</h1>
        <p style="color:var(--c-muted);font-size:15px;margin-bottom:28px;">${meta.desc}</p>
        <div id="section-articles" style="max-width:1240px;margin:0 auto;padding:0 16px;">
          <p style="color:var(--c-muted);font-size:14px;padding:24px 0;">Carregando notícias...</p>
        </div>
      </section>
    `;
    const articles = await fetchArticles();
    const filtered = articles.filter(a => a.tag.toLowerCase().includes(page.replace('sulamericana','sul')));
    const grid = app.querySelector('#section-articles');
    if (filtered.length > 0) {
      grid.innerHTML = renderArticleCards(filtered);
    } else {
      grid.innerHTML = renderArticleCards(articles.slice(0, 6));
    }
  }
}

window.navigate = navigate;

// ── Home ──────────────────────────────────────────────────────────────────────
function renderHome(stats, articles) {
  const app = document.querySelector('#app');
  app.innerHTML = '';
  renderHero(app, articles);
  renderOddsWidget(app, stats);
  renderLatestArticles(app, articles);
  renderCTA(app);
}

// ── Hero Grid ─────────────────────────────────────────────────────────────────
function renderHero(container, articles) {
  const mainPost = articles.length > 0 ? {
    tag: articles[0].tag,
    title: articles[0].title,
    excerpt: 'Última notícia do futebol sul-americano. Clique para ler a cobertura completa.',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80',
    slug: articles[0].url
  } : HERO_POSTS.main;

  const secondaryPosts = articles.length > 1
    ? articles.slice(1, 4).map(a => ({
        tag: a.tag,
        title: a.title,
        excerpt: 'Clique para ler mais.',
        img: `https://images.unsplash.com/photo-155${Math.floor(Math.random()*9000+1000)}-acbc595b3dd5?w=400&q=70`,
        slug: a.url
      }))
    : HERO_POSTS.secondary;

  const imgs = [
    'https://images.unsplash.com/photo-1551958219-acbc595b3dd5?w=400&q=70',
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=70',
    'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&q=70',
  ];

  const secondaryHTML = secondaryPosts.map((p, i) => `
    <article class="news-card-sm" onclick="location.href='${p.slug}'" role="link" tabindex="0"
             aria-label="Leia mais: ${p.title}">
      <img class="news-card-sm__img" src="${imgs[i] || imgs[0]}" alt="" loading="lazy" width="110" height="90" />
      <div class="news-card-sm__body">
        <span class="news-card-sm__tag">${p.tag}</span>
        <h2 class="news-card-sm__title">${p.title}</h2>
      </div>
    </article>
  `).join('');

  const section = document.createElement('section');
  section.className = 'hero-section';
  section.setAttribute('aria-label', 'Destaques');
  section.innerHTML = `
    <div class="hero-grid">
      <article class="hero-main" onclick="location.href='${mainPost.slug}'" role="link" tabindex="0"
               aria-label="Destaque principal: ${mainPost.title}">
        <img class="hero-main__bg" src="${mainPost.img}" alt="" width="800" height="500" loading="eager" />
        <div class="hero-main__overlay" aria-hidden="true"></div>
        <div class="hero-main__body">
          <span class="hero-main__tag">${mainPost.tag}</span>
          <h1 class="hero-main__title">${mainPost.title}</h1>
          <p class="hero-main__excerpt">${mainPost.excerpt}</p>
        </div>
      </article>
      <div class="hero-secondary" aria-label="Outras notícias">${secondaryHTML}</div>
    </div>
  `;
  container.appendChild(section);
}

// ── Odds Widget ───────────────────────────────────────────────────────────────
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

// ── Grid de artigos ───────────────────────────────────────────────────────────
function renderArticleCards(articles) {
  const imgs = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=70',
    'https://images.unsplash.com/photo-1551958219-acbc595b3dd5?w=400&q=70',
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=70',
    'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&q=70',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=70',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=70',
  ];

  return articles.map((a, i) => `
    <article onclick="location.href='${a.url}'" role="link" tabindex="0"
             style="cursor:pointer;background:var(--c-surface,#1a1a2e);border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;transition:transform .2s;"
             onmouseover="this.style.transform='translateY(-3px)'"
             onmouseout="this.style.transform='translateY(0)'">
      <img src="${imgs[i % imgs.length]}" alt="" loading="lazy"
           style="width:100%;height:150px;object-fit:cover;display:block;" />
      <div style="padding:14px;">
        <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#facc15;">${a.tag}</span>
        <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin:6px 0 8px;line-height:1.3;color:var(--c-text,#fff);">${a.title}</h3>
        <small style="color:var(--c-muted,#888);font-size:12px;">${a.date}</small>
      </div>
    </article>
  `).join('');
}

// ── Últimas Notícias ──────────────────────────────────────────────────────────
function renderLatestArticles(container, articles) {
  const section = document.createElement('section');
  section.style.cssText = 'max-width:1240px;margin:40px auto;padding:0 16px;';

  if (articles.length === 0) {
    section.innerHTML = `
      <p class="section-label">Últimas Notícias</p>
      <p style="color:var(--c-muted);font-size:14px;padding:24px 0;">Fique ligado! As notícias chegam em breve.</p>
    `;
  } else {
    section.innerHTML = `
      <p class="section-label">Últimas Notícias</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-top:16px;">
        ${renderArticleCards(articles.slice(4, 10))}
      </div>
    `;
  }
  container.appendChild(section);
}

// ── CTA WhatsApp ──────────────────────────────────────────────────────────────
function renderCTA(container) {
  const cta = document.createElement('section');
  cta.className = 'cta-section';
  cta.innerHTML = `
    <h2 style="font-size:28px;font-weight:800;margin-bottom:12px;">Fique por dentro de tudo!</h2>
    <p style="font-size:16px;margin-bottom:24px;opacity:0.85;">
      Junte-se ao canal oficial da ConmebolTV no WhatsApp e receba notícias, resultados e análises em tempo real.
    </p>
    <a href="${WHATSAPP_CHANNEL}" target="_blank" rel="noopener"
       style="display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#fff;font-size:17px;font-weight:700;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      ENTRAR NO CANAL
    </a>
  `;
  container.appendChild(cta);
}

// ── Init ──────────────────────────────────────────────────────────────────────
navigate('home');
