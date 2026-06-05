// /src/main.js
// ConmebolTV — Motor de Renderização Otimizado + Gestão de Anúncios
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
  const app = document.querySelector('#app');
  
  // Renderiza blocos dinâmicos complementares
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

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DE ANÚNCIOS E OTIMIZAÇÃO (CORE WEB VITALS)
// ─────────────────────────────────────────────────────────────────────────────

let scriptsCarregados = false;

function dispararCarregamentoAds() {
  if (scriptsCarregados) return;
  scriptsCarregados = true;

  console.log("Otimização CWV: Carregando scripts de anúncios...");

  // 1. Joinads
  const sJoin = document.createElement('script');
  sJoin.src = "https://script.joinads.me/myad6204.js";
  sJoin.type = "module";
  sJoin.async = true;
  sJoin.setAttribute('crossorigin', 'anonymous');
  document.head.appendChild(sJoin);

  // 2. MGID
  const sMgid = document.createElement('script');
  sMgid.src = "https://jsc.mgid.com/site/972311.js";
  sMgid.async = true;
  document.head.appendChild(sMgid);

  // 3. Clever (Offerwall contratual)
  const sClever = document.createElement('script');
  sClever.id = "CleverCoreLoader77037";
  sClever.src = "https://scripts.cleverwebserver.com/71d2f02a3f2becbb298e4439febd0ec9.js";
  sClever.async = true;
  sClever.type = "text/javascript";
  document.head.appendChild(sClever);
}

// Rodízio do Rodapé (70% Join Ads / 30% Lead VIP)
function renderFooterAd() {
  const footerAd = document.querySelector('.footer-ad-rotator');
  if (!footerAd) return;

  if (Math.random() <= 0.7) {
    // 70% das vezes exibe a Join Ads
    footerAd.innerHTML = '<div joinadscode="ContentFooter" lazyload="true"></div>';
  } else {
    // 30% das vezes exibe a captura de lead para o grupo VIP
    footerAd.innerHTML = `
      <div class="cta-vip-box" style="padding: 20px; text-align: center; background-color: var(--c-navy-md); border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <p style="font-size: 18px; color: white; margin-bottom: 12px; font-family: var(--font-display); font-weight: 700; letter-spacing: 0.05em;">Quer lucrar com estes dados?</p>
        <a href="https://facebook.com/groups/sua-comunidade" target="_blank" class="btn-vip" style="text-decoration: none;">ENTRAR NO GRUPO VIP</a>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
function init() {
  navigate('home');
  
  // Renderiza o anúncio rotativo no rodapé
  renderFooterAd();

  // Dispara o carregamento dos scripts pesados de ads após 3 segundos
  setTimeout(dispararCarregamentoAds, 3000);
}

init();