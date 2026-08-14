import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell.jsx';
import { SIMULATIONS, fichierUrl } from '../simulations/index.js';
import {
  IcInfo, IcUp, IcCheck, IcTarget, IcRun, IcPlus, IcPlay, IcDown, IcShare,
} from '../icons.jsx';

/* Jauge en demi-cercle : même géométrie que la maquette — un arc épais,
   ouvert vers le bas, la valeur posée dessous. */
function Gauge({ pct, cap }) {
  const R = 58, C = Math.PI * R;
  return (
    <div className="gauge">
      <svg width="150" height="84" viewBox="0 0 150 84" aria-hidden="true">
        <path d={`M17 74 A ${R} ${R} 0 0 1 133 74`} fill="none"
              stroke="var(--card-3)" strokeWidth="11" strokeLinecap="round" />
        <path d={`M17 74 A ${R} ${R} 0 0 1 133 74`} fill="none"
              stroke="var(--orange)" strokeWidth="11" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div className="val num">{pct} %</div>
        <div className="cap">{cap}</div>
      </div>
    </div>
  );
}

/* Anneau : arc ouvert en bas, comme le suivi d'objectif de la maquette. */
function Ring({ pct, titre }) {
  const R = 58, C = 2 * Math.PI * R, part = 0.78;
  return (
    <div className="ring">
      <svg width="158" height="158" viewBox="0 0 158 158" aria-hidden="true">
        <g transform="rotate(131 79 79)">
          <circle cx="79" cy="79" r={R} fill="none" stroke="var(--card-3)"
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${C * part} ${C}`} />
          <circle cx="79" cy="79" r={R} fill="none" stroke="var(--orange)"
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${C * part * (pct / 100)} ${C}`} />
        </g>
      </svg>
      <div className="in">
        <div className="v num">{pct} %</div>
        <div className="k">{titre}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const sim = SIMULATIONS[0];
  const e = sim.economie;
  const totalSeg = e.segments.reduce((a, s) => a + s.v, 0);

  return (
    <Shell
      crumb={['Buyticle', 'Simulations', sim.nom]}
      action={
        <a className="btn-v" href={fichierUrl(sim, sim.fichiers[1].f)} download>
          <IcShare w={14} />Dossier complet
        </a>
      }
    >
      {/* ══ RANGÉE 1 ══ */}
      <div className="grid">
        <section className="card c12">
          <div className="idrow">
            <div className="thumb">{sim.emoji}</div>
            <div style={{ minWidth: 0 }}>
              <div className="idname">{sim.nom}</div>
              <div className="idref num">#{sim.ref}</div>
            </div>
            <div className="idbtns">
              <button className="btn-o" onClick={() => nav(`/simulations/${sim.slug}`)}>
                Dossier
              </button>
              <button className="btn-v" onClick={() => nav(`/simulations/${sim.slug}/live`)}>
                <IcPlay w={13} />Lancer
              </button>
            </div>
          </div>

          <div className="tags">
            <span className="tag">{sim.rayon}</span>
            <span className="tag">{sim.boutiques} boutiques</span>
            <span className="tag g">{sim.statut}</span>
            <span className="tag v">{sim.marche}</span>
          </div>

          <div className="bars">
            {sim.familles.map((f) => (
              <div className="bar" key={f.nom}>
                <div className="l">
                  <span className="n">{f.nom}</span>
                  <span className="p num">{f.pct} %</span>
                </div>
                <div className="track">
                  <i style={{ width: `${f.pct}%`, background: f.couleur }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {sim.metriques.map((m) => (
          <section className="card c4" key={m.k}>
            <div className="card-h" style={{ marginBottom: 0 }}>
              <span className={`sq ${m.sq}`}>
                {m.ico === 'target' ? <IcTarget w={17} />
                  : m.ico === 'share' ? <IcUp w={17} /> : <IcCheck w={17} />}
              </span>
              <span className="sp" />
              <span style={{ color: 'var(--faint)' }}><IcInfo w={13} /></span>
            </div>
            <div className={'big num' + (m.mot ? ' word' : '')}>{m.v}</div>
            <div className="lbl">{m.k}</div>
            <div className="delta">
              {m.up && <span className="up"><IcUp w={11} /></span>}
              <span>{m.d}</span>
            </div>
          </section>
        ))}
      </div>

      {/* ══ RANGÉE 2 ══ */}
      <div className="grid">
        <section className="card c5">
          <div className="card-h"><span className="card-t">{sim.prevision.titre}</span></div>
          <span className="goal">{sim.prevision.cible}</span>
          <Gauge pct={sim.prevision.pct} cap={sim.prevision.legende} />
          <div className="note">{sim.prevision.note}</div>
        </section>

        <section className="card c11">
          <div className="card-h">
            <span className="card-t">Déroulé de la simulation</span>
            <span className="sp" />
            <span className="dots">•••</span>
          </div>
          <div className="rail-x">
            {sim.scenes.map((s) => (
              <article className="scene" key={s.t}>
                <div className="img">
                  <span className="em">{s.em}</span>
                  <span className={`badge ${s.bc}`}>{s.b}</span>
                </div>
                <div className="b">
                  <div className="t">{s.t}</div>
                  <div className="d">{s.d}</div>
                  <div className="f"><span>{s.j}</span><span>{s.dur}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card c8">
          <div className="card-h">
            <span className="card-t">Contrôles du modèle</span>
            <span className="sp" />
            <span className="dots">•••</span>
          </div>
          <div className="diag">
            {['a', 'b', 'c'].map((k) => (
              <div key={k}>
                <div className="v num">{sim.controles[k].v}</div>
                <div className="k">{sim.controles[k].k}</div>
                <div className="s">{sim.controles[k].s}</div>
              </div>
            ))}
          </div>
          <div className="strip">
            <IcCheck w={14} />
            <span>{sim.controles.strip}</span>
            <span className="ok">{sim.controles.etat}</span>
          </div>
          <button className="btn-run" onClick={() => nav(`/simulations/${sim.slug}/live`)}>
            <IcRun w={15} />Relancer la simulation
          </button>
        </section>
      </div>

      {/* ══ RANGÉE 3 ══ */}
      <div className="grid">
        <section className="card c5">
          <div className="card-h">
            <span className="card-t">Répartition des clients</span>
            <span className="sp" />
            <span style={{ color: 'var(--faint)' }}><IcInfo w={13} /></span>
          </div>
          <div className="hist">
            {sim.repartition.barres.map((b, i) => (
              <i key={i} className={i === 0 ? 'on' : undefined}
                 style={{ height: `${(b / 28) * 100}%` }} />
            ))}
          </div>
          <div className="quad">
            {sim.repartition.stats.map((s) => (
              <div key={s.k}>
                <div className="v num">{s.v}<small>{s.u}</small></div>
                <div className="k">{s.k}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card c5">
          <div className="card-h">
            <span className="card-t">Économie du rayon</span>
            <span className="sp" />
            <span className="dots">•••</span>
          </div>
          {e.lignes.map(([k, v]) => (
            <div className="kv" key={k}><span>{k}</span><b className="num">{v}</b></div>
          ))}
          <div className="kv"><span>Statut</span><span className="pill">{e.statut}</span></div>
          <div className="segbar">
            {e.segments.map((s) => (
              <i key={s.k} style={{ flex: s.v / totalSeg, background: s.c }} />
            ))}
          </div>
          <div className="segkey">
            {e.segments.map((s) => (
              <div key={s.k}>
                <div className="v num">{s.l}</div>
                <div className="k">{s.k}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card c5">
          <div className="card-h">
            <span className="card-t">Objectif suivi</span>
            <span className="sp" />
            <span className="dots">•••</span>
          </div>
          <Ring pct={sim.objectifSuivi.pct} titre={sim.objectifSuivi.titre} />
          <div className="legend">
            <span><i style={{ background: 'var(--orange)' }} />{sim.objectifSuivi.ok}</span>
            <span><i style={{ background: 'var(--card-3)' }} />{sim.objectifSuivi.ko}</span>
          </div>
        </section>

        <section className="card c9">
          <div className="card-h">
            <span className="card-t">Journal des décisions</span>
            <span className="sp" />
            <span className="plus"><IcPlus w={13} /></span>
          </div>
          <div className="log">
            {sim.decisions.map((d) => (
              <div className="logi" key={d.t}>
                <span className="h num">{d.h}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="t">{d.t}</div>
                  <div className="m">
                    <span className={`chip ${d.cc}`}>{d.c}</span>
                    <span className="s">{d.d}</span>
                    <span className="s">·</span>
                    <span className="s">{d.s}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <a className="btn-o" style={{ marginTop: 10, justifyContent: 'center' }}
             href={fichierUrl(sim, sim.fichiers[0].f)} download>
            <IcDown w={13} />Télécharger la simulation
          </a>
        </section>
      </div>
    </Shell>
  );
}
