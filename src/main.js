// /src/main.js
// ConmebolTV — Motor de Renderização Otimizado

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

function renderHome(stats) {
  // Agora apontamos para IDs específicos que criamos no HTML!
  renderOddsWidget(document.querySelector('#odds-placeholder'), stats);
  renderNews(document.querySelector('#n8n-placeholder'));
  renderCTA(document.querySelector('#cta-placeholder'));
}

function renderOddsWidget(container, stats) {
  if (!container) return;
  container.innerHTML = `
    <div class="widget-odds-box">
        <p class="section-label-small">⚡ Live Odds</p>
        <p class="card-odds__match">${stats.timeCasa} vs ${stats.timeFora}</p>
        <p class="card-odds__prob">Probabilidade vitória casa: <strong>${stats.probCasa}%</strong></p>
        <a href="#" class="btn-vip-small">Ver análise completa</a>
    </div>
  `;
}

async function renderNews(container) {
  if (!container) return;
  const hoje = new Date();
  const ymd = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
  const urlPost = `/posts/${ymd}-rodada-libertadores.html`;

  try {
    const res = await fetch(urlPost);
    if (!res.ok) throw new Error('Matéria não gerada');
    const html = await res.text();
    container.innerHTML = `<div class="conteudo-portal">${html}</div>`;
  } catch (err) {
    container.innerHTML = `
      <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 1px dashed #ccc; margin-bottom: 24px;">
        <p style="color: var(--c-muted);">Análise da rodada sendo gerada pelo n8n... em breve.</p>
      </div>`;
  }
}

function renderCTA(container) {
  if (!container) return;
  container.innerHTML = `
    <section class="cta-section">
      <h2>Quer lucrar com estes dados?</h2>
      <p>Junte-se a +8.200 especialistas no Aposta Invest 2.0 e receba nossas análises diárias.</p>
      <a href="https://facebook.com/groups/sua-comunidade" target="_blank" class="btn-cta-large">ENTRAR NO GRUPO VIP</a>
    </section>
  `;
}

// OTIMIZAÇÃO (CORE WEB VITALS)
let scriptsCarregados = false;
function dispararCarregamentoAds() {
  if (scriptsCarregados) return;
  scriptsCarregados = true;

  const sJoin = document.createElement('script');
  sJoin.src = "https://script.joinads.me/myad6204.js";
  sJoin.type = "module";
  sJoin.async = true;
  document.head.appendChild(sJoin);

  const sMgid = document.createElement('script');
  sMgid.src = "https://jsc.mgid.com/site/972311.js";
  sMgid.async = true;
  document.head.appendChild(sMgid);

  const sClever = document.createElement('script');
  sClever.id = "CleverCoreLoader77037";
  sClever.src = "https://scripts.cleverwebserver.com/71d2f02a3f2becbb298e4439febd0ec9.js";
  sClever.async = true;
  document.head.appendChild(sClever);
}

function renderFooterAd() {
  const footerAd = document.querySelector('.footer-ad-rotator');
  if (!footerAd) return;
  if (Math.random() <= 0.7) {
    footerAd.innerHTML = '<div joinadscode="ContentFooter" lazyload="true"></div>';
  } else {
    footerAd.innerHTML = `
      <div style="background: var(--c-navy-md); padding: 20px; border-radius: 8px; text-align: center; max-width: 600px; margin: 0 auto;">
        <p style="color: white; font-family: var(--font-display); font-size: 18px; margin-bottom: 12px;">Quer lucrar com estes dados?</p>
        <a href="https://facebook.com/groups/sua-comunidade" class="btn-vip">ENTRAR NO GRUPO VIP</a>
      </div>`;
  }
}

function init() {
  navigate('home');
  renderFooterAd();
  setTimeout(dispararCarregamentoAds, 3000);
}
init();