// /src/main.js
// ConmebolTV — Motor Limpo (Apenas Ads)

let scriptsCarregados = false;

function dispararCarregamentoAds() {
  if (scriptsCarregados) return;
  scriptsCarregados = true;

  // Joinads
  const sJoin = document.createElement('script');
  sJoin.src = "https://script.joinads.me/myad6204.js";
  sJoin.type = "module";
  sJoin.async = true;
  document.head.appendChild(sJoin);

  // MGID
  const sMgid = document.createElement('script');
  sMgid.src = "https://jsc.mgid.com/site/972311.js";
  sMgid.async = true;
  document.head.appendChild(sMgid);

  // Clever (Offerwall)
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
        <p style="color: white; font-family: var(--font-display); font-size: 18px; margin-bottom: 12px; font-weight: bold;">Quer lucrar com estes dados?</p>
        <a href="https://facebook.com/groups/sua-comunidade" target="_blank" style="background: var(--c-gold); color: var(--c-navy); padding: 10px 20px; font-family: var(--font-display); font-weight: bold; border-radius: 4px; text-decoration: none; text-transform: uppercase; display: inline-block;">ENTRAR NO GRUPO VIP</a>
      </div>`;
  }
}

function init() {
  renderFooterAd();
  // Delay de 3 segundos para carregar anúncios pesados
  setTimeout(dispararCarregamentoAds, 3000);
}

init();