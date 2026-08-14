/* ══════════════════════════════════════════════════════════════════════════
   LE TÉLÉPHONE
   Il apparaît à côté de la scène dès que quelqu'un sort le sien, et il montre
   exactement ce que cette personne a sous les yeux : le commerçant qui lance
   la recherche, puis le client qui suit son itinéraire. Sans lui, on voit un
   bonhomme regarder sa main.
   ══════════════════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

export class Phone {
  constructor() {
    this.el = $('phone');
    this.body = $('phBody');
    this.who = $('phWho');
    this.time = $('phTime');
    this.mode = null;
    const h = new Date();
    this.time.textContent = `${String(h.getHours()).padStart(2, '0')}:${String(h.getMinutes()).padStart(2, '0')}`;
  }

  cacher() { this.el.classList.remove('on'); this.mode = null; }

  /* ── écran du commerçant ── */
  vendeur(etat, data = {}) {
    this.el.classList.add('on');
    this.el.classList.remove('client');
    this.who.textContent = 'Boutique Essomba';
    if (this.mode !== 'v') { this.mode = 'v'; }

    if (etat === 'demande') {
      this.body.innerHTML = `
        <div class="ph-h">Demande d'un client</div>
        <div class="ph-card">
          <div class="ph-prod">Timberland 6-inch</div>
          <div class="ph-var">Pointure 45 · milieu de gamme</div>
        </div>
        <button class="ph-go">Chercher dans le rayon</button>
        <div class="ph-note">14 boutiques à moins de 500 m</div>`;
    }

    if (etat === 'appel') {
      this.body.innerHTML = `
        <div class="ph-h">On demande au rayon…</div>
        <div class="ph-timer"><i style="animation-duration:${data.sec || 30}s"></i></div>
        <div class="ph-sub">${data.sec || 30} secondes pour répondre</div>
        <div class="ph-list" id="phList"></div>`;
    }

    if (etat === 'repond') {
      const l = $('phList');
      if (l) {
        const d = document.createElement('div');
        d.className = 'ph-rep';
        d.innerHTML = `<span class="ph-dot"></span><span class="ph-nom">${data.nom}</span>
                       <span class="ph-stock">${data.stock}</span>`;
        l.appendChild(d);
        requestAnimationFrame(() => d.classList.add('in'));
      }
    }

    if (etat === 'choix') {
      this.body.innerHTML = `
        <div class="ph-h">Trois boutiques l'ont</div>
        <div class="ph-list">
          ${data.cands.map((c) => `
            <div class="ph-rep in ${c.win ? 'win' : ''}">
              <span class="ph-dot"></span>
              <span class="ph-nom">${c.nom}</span>
              <span class="ph-ratio">reçu ${c.r} · envoyé ${c.e}</span>
            </div>`).join('')}
        </div>
        <div class="ph-note">Celle qui a le plus donné passe devant.</div>`;
    }

    if (etat === 'envoye') {
      this.body.innerHTML = `
        <div class="ph-ok">✓</div>
        <div class="ph-h" style="text-align:center">Client envoyé</div>
        <div class="ph-card" style="text-align:center">
          <div class="ph-prod">${data.nom}</div>
          <div class="ph-var">à ${data.m} m · remise 3 % pour le client</div>
        </div>
        <div class="ph-gain">+ 3 360 F pour toi si la vente se fait</div>`;
    }
  }

  /* ── écran du client : l'itinéraire ── */
  client(etat, data = {}) {
    this.el.classList.add('on', 'client');
    this.who.textContent = 'Client · itinéraire';
    this.mode = 'c';

    if (etat === 'route') {
      this.body.innerHTML = `
        <div class="ph-nav">
          <div class="ph-dest">${data.nom}</div>
          <div class="ph-dist"><b id="phM">${data.m}</b> m</div>
        </div>
        <div class="ph-map" id="phMap">
          <div class="ph-track"><i id="phProg"></i></div>
          <div class="ph-me" id="phMe"></div>
          <div class="ph-goal"></div>
        </div>
        <div class="ph-step" id="phStep">Continue tout droit dans l'allée</div>
        <div class="ph-code">
          <span>Ton bon</span><b>${data.code}</b>
        </div>
        <div class="ph-exp">Valable 48 h · uniquement chez ${data.nom}</div>`;
    }

    if (etat === 'avance') {
      const m = $('phM'), pr = $('phProg'), me = $('phMe'), st = $('phStep');
      if (m) m.textContent = data.m;
      if (pr) pr.style.width = `${data.pct}%`;
      if (me) me.style.left = `calc(${data.pct}% - 7px)`;
      if (st && data.txt) st.textContent = data.txt;
    }

    if (etat === 'arrive') {
      this.body.innerHTML = `
        <div class="ph-ok">✓</div>
        <div class="ph-h" style="text-align:center">Tu y es</div>
        <div class="ph-card" style="text-align:center">
          <div class="ph-prod">${data.nom}</div>
          <div class="ph-var">Montre ton bon au vendeur</div>
        </div>
        <div class="ph-code big"><b>${data.code}</b></div>
        <div class="ph-gain">48 000 F − 3 % = 46 560 F</div>`;
    }
  }
}
