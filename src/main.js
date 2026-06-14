// /src/main.js
// ConmebolTV — Motor de Renderização v5

const GITHUB_REPO = 'cluiznunes1000/new-conmebol-tv';
const POSTS_PATH = 'public/posts';
const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbDB4sC4Y9li0ZEoGt3i';

const CATEGORY_IMAGES = {
  'Libertadores': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  'Sul-Americana': 'https://images.unsplash.com/photo-1540747913346-19212a4b423d?w=600&q=80',
  'Brasileirão': 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&q=80',
  'Futebol Feminino': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80',
  'Copa do Mundo': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
  'Seleções': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80',
  'Clubes': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80',
  'CONMEBOL': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
};

function detectTag(filename) {
  const f = filename.toLowerCase();
  if (f.includes('libertadores')) return 'Libertadores';
  if (f.includes('sul-americana') || f.includes('sulamericana')) return 'Sul-Americana';
  if (f.includes('brasileirao') || f.includes('brasileiro')) return 'Brasileirão';
  if (f.includes('feminina') || f.includes('feminino')) return 'Futebol Feminino';
  if (f.includes('copa')) return 'Copa do Mundo';
  if (f.includes('selecao') || f.includes('selecção')) return 'Seleções';
  if (f.includes('mirassol') || f.includes('flamengo') || f.includes('palmeiras') || f.includes('boca') || f.includes('river')) return 'Clubes';
  return 'CONMEBOL';
}

function titleFromFilename(filename) {
  const name = filename.replace('.html', '');
  const parts = name.split('-');
  const withoutDate = parts.slice(3).join(' ');
  if (!withoutDate || withoutDate.match(/^noticia conmebol \d+$/i)) return null;
  return withoutDate.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function fetchArticles() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    if (!res.ok) throw new Error('GitHub API error');
    const files = await res.json();

    const htmlFiles = files
      .filter(f => f.name.endsWith('.html') && f.name !== 'index.html' && !f.name.startsWith('src'))
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 20);

    const articles = await Promise.all(htmlFiles.map(async f => {
      const tag = detectTag(f.name);
      const titleFromName = titleFromFilename(f.name);
      let title = titleFromName;

      if (!title) {
        try {
          const htmlRes = await fetch(f.download_url);
          const html = await htmlRes.text();
          const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (match) {
            title = match[1].replace(' | ConmebolTV', '').trim();
          }
          if (!title || title === 'ConmebolTV') {
            const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            if (h1Match) title = h1Match[1].trim();
          }
        } catch (e) {}
      }

      return {
        title: title || 'Notícia ConmebolTV',
        url: `/posts/${f.name}`,
        date: f.name.substring(0, 10),
        tag: tag,
        img: CATEGORY_IMAGES[tag] || CATEGORY_IMAGES['CONMEBOL']
      };
    }));

    return articles;
  } catch (e) {
    console.warn('[ConmebolTV] fetchArticles:', e.message);
    return [];
  }
}

async function fetchGameData() {
  try {
    const res = await fetch('/data.json');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { timeCasa: 'Palmeiras', timeFora: 'Peñarol', probCasa: 72 };
  }
}

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
    const grid = app.querySelector('#section-articles');
    grid.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;">
      ${renderCards(articles.slice(0, 12))}
    </div>`;
  }
}

window.navigate = navigate;

function renderHome(stats, articles) {
  const app = document.querySelector('#app');
  app.innerHTML = '';
  renderHero(app, articles);
  renderOddsWidget(app, stats);
  renderLatestArticles(app, articles);
  renderCTA(app);
}

function renderHero(container, articles) {
  const main = articles[0] || {
    tag: 'CONMEBOL',
    title: 'Bem-vindo ao ConmebolTV',
    excerpt: 'O portal de referência do futebol sul-americano.',
    img: CATEGORY_IMAGES['CONMEBOL'],
    url: '#'
  };

  const secondary = articles.slice(1, 4);

  const secondaryHTML = secondary.map(p => `
    <article class="news-card-sm" onclick="location.href='${p.url}'" role="link" tabindex="0"
             aria-label="${p.title}">
      <img class="news-card-sm__img" src="${p.img}" alt="" loading="lazy" width="110" height="90" />
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
      <article class="hero-main" onclick="location.href='${main.url}'" role="link" tabindex="0">
        <img class="hero-main__bg" src="${main.img}" alt="" width="800" height="500" loading="eager" />
        <div class="hero-main__overlay" aria-hidden="true"></div>
        <div class="hero-main__body">
          <span class="hero-main__tag">${main.tag}</span>
          <h1 class="hero-main__title">${main.title}</h1>
          <p class="hero-main__excerpt">Clique para ler a cobertura completa desta notícia.</p>
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

function renderCards(articles) {
  return articles.map(a => `
    <article onclick="location.href='${a.url}'" role="link" tabindex="0"
             style="cursor:pointer;background:var(--c-surface,#1a1a2e);border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;transition:transform .2s;"
             onmouseover="this.style.transform='translateY(-3px)'"
             onmouseout="this.style.transform='translateY(0)'">
      <img src="${a.img}" alt="${a.title}" loading="lazy"
           style="width:100%;height:150px;object-fit:cover;display:block;" />
      <div style="padding:14px;">
        <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#facc15;">${a.tag}</span>
        <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin:6px 0 8px;line-height:1.3;color:var(--c-text,#fff);">${a.title}</h3>
        <small style="color:var(--c-muted,#888);font-size:12px;">${a.date}</small>
      </div>
    </article>
  `).join('');
}

function renderLatestArticles(container, articles) {
  const section = document.createElement('section');
  section.style.cssText = 'max-width:1240px;margin:40px auto;padding:0 16px;';
  section.innerHTML = `
    <p class="section-label">Últimas Notícias</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-top:16px;">
      ${articles.length > 0 ? renderCards(articles.slice(4, 10)) : '<p style="color:var(--c-muted);font-size:14px;padding:24px 0;">Fique ligado! As notícias chegam em breve.</p>'}
    </div>
  `;
  container.appendChild(section);
}

function renderCTA(container) {
  const cta = document.createElement('section');
  cta.className = 'cta-section';
  cta.innerHTML = `
    <h2 style="font-size:28px;font-weight:800;margin-bottom:12px;">Fique por dentro de tudo!</h2>
    <p style="font-size:16px;margin-bottom:24px;opacity:0.85;">
      Junte-se ao canal oficial da ConmebolTV no WhatsApp e receba notícias,<br>resultados e análises em tempo real.
    </p>
    <a href="${WHATSAPP_CHANNEL}" target="_blank" rel="noopener"
       style="display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#fff;font-size:18px;font-weight:700;padding:16px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(37,211,102,0.4);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      ENTRAR NO CANAL
    </a>
  `;
  container.appendChild(cta);
}

navigate('home');
