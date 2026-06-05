// Otimização: Carregamento Diferido (Core Web Vitals)
function dispararCarregamento() {
  // 1. Joinads
  const sJoin = document.createElement('script');
  sJoin.src = "https://script.joinads.me/myad6204.js";
  document.head.appendChild(sJoin);

  // 2. MGID
  const sMgid = document.createElement('script');
  sMgid.src = "https://jsc.mgid.com/site/972311.js";
  document.head.appendChild(sMgid);

  // 3. Clever (Offerwall ativa conforme contrato)
  const sClever = document.createElement('script');
  sClever.src = "https://scripts.cleverwebserver.com/71d2f02a3f2becbb298e4439febd0ec9.js";
  document.head.appendChild(sClever);
}

// Rodízio Footer: 70% Join Ads / 30% VIP
function renderFooterAd() {
  const footerAd = document.querySelector('.footer-ad-rotator');
  if (Math.random() <= 0.7) {
      footerAd.innerHTML = '<div joinadscode="ContentFooter" lazyload="true"></div>';
  } else {
      footerAd.innerHTML = `<div style="padding:20px; text-align:center;">
          <p>Quer lucrar? <a href="#" class="btn-vip">ENTRAR NO GRUPO VIP</a></p></div>`;
  }
}

// Iniciar após 3 segundos para performance
setTimeout(() => {
  dispararCarregamento();
  renderFooterAd();
}, 3000);