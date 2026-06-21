// screens/other.jsx — Agenda, Activiteiten, Partners, Netwerken, Nieuws, Doe mee, Doneren
const { useState: useStateOt, useEffect: useEffectOt } = React;

/* ============ WEEKKALENDER ============ */
function WeekKalender({ agendaItems, activiteitenItems, setPage }) {
  const [weekOffset, setWeekOffset] = useStateOt(0);

  const today = new Date();
  const todayDow = today.getDay();
  const daysToMonday = todayDow === 0 ? -6 : 1 - todayDow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const weekDagen = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dagLabels = ['Ma','Di','Wo','Do','Vr','Za','Zo'];
  const maandAfk = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];

  const start = weekDagen[0], end = weekDagen[6];
  const weekTitel = start.getMonth() === end.getMonth()
    ? `${start.getDate()} – ${end.getDate()} ${maandAfk[end.getMonth()]} ${end.getFullYear()}`
    : `${start.getDate()} ${maandAfk[start.getMonth()]} – ${end.getDate()} ${maandAfk[end.getMonth()]} ${end.getFullYear()}`;

  function agendaOpDag(datum) {
    return agendaItems.filter(item => {
      if (item.datum) {
        const d = new Date(item.datum);
        return d.getDate() === datum.getDate() && d.getMonth() === datum.getMonth() && d.getFullYear() === datum.getFullYear();
      }
      return item.day === datum.getDate() && item.monthNum - 1 === datum.getMonth() && item.year === datum.getFullYear();
    });
  }

  function activiteitenOpDag(datum) {
    const dow = datum.getDay();
    const ma0 = dow === 0 ? 6 : dow - 1;
    const dagNaamArr = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'];
    return activiteitenItems.filter(item => {
      const w = (item.wanneer || '').toLowerCase();
      if (!w.includes(dagNaamArr[ma0])) return false;
      const nthMatch = w.match(/(\d+)e\b|eerste|tweede|derde|vierde/);
      if (!nthMatch) return true;
      let n = 1;
      const nm = nthMatch[0];
      if (nm.startsWith('tweede') || nm === '2e') n = 2;
      else if (nm.startsWith('derde') || nm === '3e') n = 3;
      else if (nm.startsWith('vierde') || nm === '4e') n = 4;
      else if (nthMatch[1]) n = parseInt(nthMatch[1]);
      let teller = 0;
      for (let d = 1; d <= datum.getDate(); d++) {
        if ((new Date(datum.getFullYear(), datum.getMonth(), d).getDay() === 0 ? 6 : new Date(datum.getFullYear(), datum.getMonth(), d).getDay() - 1) === ma0) teller++;
      }
      return teller === n;
    });
  }

  const navBtnStyle = { background: "none", border: "1px solid var(--tib-line)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid var(--tib-line)", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => setWeekOffset(o => o - 1)} style={navBtnStyle}>‹</button>
        <strong style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontSize: "1.05rem" }}>
          Week van {weekTitel}
        </strong>
        <button onClick={() => setWeekOffset(o => o + 1)} style={navBtnStyle}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {weekDagen.map((datum, i) => {
          const isVandaag = datum.toDateString() === new Date().toDateString();
          const agItems = agendaOpDag(datum);
          const actItems = activiteitenOpDag(datum);
          const dagStr = String(datum.getDate()).padStart(2, '0');
          const maandStr = maandAfk[datum.getMonth()];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                textAlign: "center", fontSize: "0.72rem", fontWeight: 600,
                color: isVandaag ? "var(--tib-green)" : "var(--tib-ink-soft)",
                padding: "4px 0", borderBottom: "1px solid var(--tib-line)", marginBottom: 4,
              }}>
                {dagLabels[i]}<br/>
                <span style={{ fontSize: "1rem", color: isVandaag ? "var(--tib-green)" : "var(--tib-ink)" }}>{datum.getDate()}</span>
              </div>
              {agItems.map(e => (
                <button key={e.id} onClick={() => setPage && setPage({ kind: "agenda", id: e.id })}
                  style={{ background: "var(--tib-green)", borderRadius: 8, padding: "8px 4px", textAlign: "center", color: "white", border: "none", cursor: "pointer", width: "100%" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{dagStr}</div>
                  <div style={{ fontSize: "0.62rem", opacity: 0.85, marginBottom: 3 }}>{maandStr}</div>
                  <div style={{ fontSize: "0.67rem", fontWeight: 600, lineHeight: 1.2 }}>{(e.titel || e.t || '').slice(0, 20)}</div>
                </button>
              ))}
              {actItems.map(a => (
                <button key={a.id} onClick={() => setPage && setPage({ kind: "activiteit", id: a.id })}
                  style={{ background: "#E07A3A", borderRadius: 8, padding: "8px 4px", textAlign: "center", color: "white", border: "none", cursor: "pointer", width: "100%" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}>{dagStr}</div>
                  <div style={{ fontSize: "0.62rem", opacity: 0.85, marginBottom: 3 }}>{maandStr}</div>
                  <div style={{ fontSize: "0.67rem", fontWeight: 600, lineHeight: 1.2 }}>{(a.naam || a.name || '').slice(0, 20)}</div>
                </button>
              ))}
              {agItems.length === 0 && actItems.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--tib-line)", fontSize: "1rem" }}>·</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 20, fontSize: "0.8rem", color: "var(--tib-ink-soft)", paddingTop: 10, borderTop: "1px solid var(--tib-line)", marginTop: 12 }}>
        <span><span style={{ color: "var(--tib-green)", fontSize: "1rem" }}>●</span> Eenmalig</span>
        <span><span style={{ color: "#E07A3A", fontSize: "1rem" }}>●</span> Terugkerend</span>
      </div>
    </div>
  );
}

/* ============ AGENDA ============ */
function Agenda({ voice, setPage }) {
  const you = voice === "u" ? "u" : "je";
  const [agendaItems, setAgendaItems] = useStateOt(null);
  const [activiteitenItems, setActiviteitenItems] = useStateOt(null);

  useEffectOt(() => {
    async function laadData() {
      const sb = window._tibSupabase;
      if (sb) {
        const [agRes, actRes] = await Promise.all([
          sb.from('agenda').select('*').order('datum', { ascending: true }),
          sb.from('activiteiten').select('*'),
        ]);
        const agData = !agRes.error && agRes.data ? agRes.data : (window.AGENDA || []);
        const actData = !actRes.error && actRes.data ? actRes.data : (window.ACTIVITIES || []);
        setAgendaItems(agData);
        setActiviteitenItems(actData);
        // Schrijf Supabase-data naar globals zodat Detail.jsx items kan vinden via id
        if (!agRes.error && agRes.data) {
          window.AGENDA = agData.map(r => ({
            ...r,
            t: r.titel || r.t,
            title: r.titel || r.title,
            waar: r.locatie || r.waar,
            w: r.locatie || r.w,
            time: r.tijd || r.time,
            desc: r.omschrijving || r.beschrijving || r.desc,
          }));
        }
        if (!actRes.error && actRes.data) {
          const cats = (window.CATEGORIES || []);
          function resolvecat(raw) {
            if (!raw) return cats[0]?.id || 'sociaal';
            const lower = raw.toLowerCase().trim();
            // exact id match
            const byId = cats.find(c => c.id === lower);
            if (byId) return byId.id;
            // label match (case-insensitive, partial)
            const byLabel = cats.find(c => c.label && c.label.toLowerCase().includes(lower.split(/[\s-]/)[0]));
            if (byLabel) return byLabel.id;
            // fallback: first available
            return cats[0]?.id || 'sociaal';
          }
          window.ACTIVITIES = actData.map(r => ({
            ...r,
            name: r.naam || r.name,
            group: r.type || r.group,
            cat: resolvecat(r.categorie || r.cat),
            phone: r.contact || r.phone,
            desc: r.omschrijving || r.beschrijving || r.desc,
          }));
        }
      } else {
        setAgendaItems(window.AGENDA || []);
        setActiviteitenItems(window.ACTIVITIES || []);
      }
    }
    laadData();
  }, []);

  function formatDatum(item) {
    if (item.datum) {
      const d = new Date(item.datum);
      const mn = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
      return { dag: String(d.getDate()).padStart(2, '0'), maand: mn[d.getMonth()] };
    }
    return { dag: item.d || '', maand: item.m || '' };
  }

  function EenmaligCard({ e }) {
    const { dag, maand } = formatDatum(e);
    const titel = e.titel || e.t || '';
    const locatie = e.locatie || e.w || '';
    const tijd = e.tijd || e.time || '';
    const tag = e.tag || '';
    const desc = e.omschrijving || e.beschrijving || e.desc || '';
    return (
      <article
        className="agenda-card is-clickable"
        style={{ alignItems: "flex-start", cursor: "pointer" }}
        onClick={() => setPage && setPage({ kind: "agenda", id: e.id })}
        tabIndex={0}
        onKeyDown={(ev) => { if (ev.key === "Enter" && setPage) setPage({ kind: "agenda", id: e.id }); }}
      >
        <div className="agenda-date">
          <div className="day">{dag}</div>
          <div className="mo">{maand}</div>
        </div>
        <div style={{ flex: 1 }}>
          {(tag || tijd) && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
              {tag && <span className="badge">{tag}</span>}
              {tijd && <span className="muted" style={{ fontSize: "0.9rem" }}>{tijd}</span>}
            </div>
          )}
          <h3>{titel}</h3>
          {locatie && <div className="where" style={{ marginBottom: 8 }}>{locatie}</div>}
          {desc && <p style={{ margin: 0, color: "var(--tib-ink-soft)" }}>{desc}</p>}
        </div>
        <span className="btn btn-ghost btn-sm" style={{ alignSelf: "center" }}>Meer info →</span>
      </article>
    );
  }

  function volgendeDate(wanneer) {
    const w = (wanneer || '').toLowerCase();
    const dagNamen = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
    let weekdag = -1;
    dagNamen.forEach((n, i) => { if (w.includes(n)) weekdag = i; });
    if (weekdag === -1) return new Date(9999, 0, 1);
    const nu = new Date();
    let daysUntil = (weekdag - nu.getDay() + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    const next = new Date(nu);
    next.setDate(nu.getDate() + daysUntil);
    return next;
  }

  function TerugkerendCard({ a }) {
    const naam = a.naam || a.name || '';
    const wanneer = a.wanneer || '';
    const waar = a.waar || '';
    const type = a.type || a.group || '';
    const kosten = a.kosten || '';

    const next = volgendeDate(wanneer);
    const mn = ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
    const dag = next.getFullYear() === 9999 ? '—' : String(next.getDate()).padStart(2, '0');
    const maand = next.getFullYear() === 9999 ? '' : mn[next.getMonth()];

    return (
      <article
        className="agenda-card is-clickable"
        style={{ alignItems: "flex-start", cursor: "pointer" }}
        onClick={() => setPage && setPage({ kind: "activiteit", id: a.id })}
        tabIndex={0}
        onKeyDown={(ev) => { if (ev.key === "Enter" && setPage) setPage({ kind: "activiteit", id: a.id }); }}
      >
        <div className="agenda-date" style={{ background: "#E07A3A" }}>
          <div className="day">{dag}</div>
          <div className="mo">{maand}</div>
        </div>
        <div style={{ flex: 1 }}>
          {type && <div style={{ marginBottom: 4 }}><span className="badge">{type}</span></div>}
          <h3>{naam}</h3>
          {wanneer && <div className="where" style={{ marginBottom: 4 }}>{wanneer}</div>}
          {waar && <div className="muted" style={{ fontSize: "0.9rem", marginBottom: 4 }}>{waar}</div>}
          {kosten && <div className="muted" style={{ fontSize: "0.85rem" }}>{kosten}</div>}
        </div>
        <span className="btn btn-ghost btn-sm" style={{ alignSelf: "center" }}>Meer info →</span>
      </article>
    );
  }

  const laden = agendaItems === null || activiteitenItems === null;

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Agenda</span>
          <h1>Alle evenementen.</h1>
          <p>Hier vind {you} alle bijzondere momenten en terugkerende activiteiten in Noordelijk Scheveningen.</p>
        </div>
      </section>
      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container">
          {!laden && (
            <WeekKalender agendaItems={agendaItems} activiteitenItems={activiteitenItems} setPage={setPage} />
          )}
          <div className="agenda-split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 18, fontFamily: "var(--font-display)" }}>Eenmalige Activiteiten</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 600, overflowY: "auto", paddingRight: 4 }}>
                {laden ? <p className="muted">Laden…</p>
                  : agendaItems.length === 0 ? <p className="muted">Geen evenementen gevonden.</p>
                  : [...agendaItems].sort((a, b) => new Date(a.datum) - new Date(b.datum)).map(e => <EenmaligCard key={e.id} e={e} />)}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 18, fontFamily: "var(--font-display)" }}>Terugkerende Activiteiten</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 600, overflowY: "auto", paddingRight: 4 }}>
                {laden ? <p className="muted">Laden…</p>
                  : activiteitenItems.length === 0 ? <p className="muted">Geen activiteiten gevonden.</p>
                  : [...activiteitenItems].sort((a, b) => volgendeDate(a.wanneer) - volgendeDate(b.wanneer)).map(a => <TerugkerendCard key={a.id} a={a} />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============ ACTIVITEITEN ============ */
function Activiteiten({ voice, setPage }) {
  const [view, setView] = useStateOt("rubriek"); // rubriek | kalender
  const groupNames = ["Ontmoeting", "Beweging", "Cultuur & leren"];
  const groups = groupNames.map((title) => ({
    title,
    items: ACTIVITIES.filter((a) => a.group === title),
  }));
  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Activiteiten</span>
          <h1>Altijd iets te doen in de buurt.</h1>
          <p>Terugkerende activiteiten van TIB en haar partners, gesorteerd op type.</p>
          <div className="seg" style={{ marginTop: 18 }}>
            <button className={view === "rubriek" ? "active" : ""} onClick={() => setView("rubriek")}>Per rubriek</button>
            <button className={view === "kalender" ? "active" : ""} onClick={() => setView("kalender")}>Kalenderweergave</button>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container">
          {view === "rubriek" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
              {groups.map((g, i) => (
                <div key={i}>
                  <h2 style={{ marginBottom: 22 }}>{g.title}</h2>
                  <div className="cards-row">
                    {g.items.map((a) => (
                      <article
                        key={a.id}
                        className="clubcard is-clickable"
                        onClick={() => setPage && setPage({ kind: "activiteit", id: a.id })}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" && setPage) setPage({ kind: "activiteit", id: a.id }); }}
                      >
                        <Placeholder id={"activiteit-photo-" + a.id} label={"Foto " + a.name} variant={["sociaal", "buiten"].includes(a.cat) ? "green" : ""} />
                        <div className="clubcard-body">
                          <h3 style={{display:"flex",alignItems:"center"}}>{window.getActivityIconJSX&&window.getActivityIconJSX(a.name)}<span>{a.name}</span></h3>
                          <p className="muted" style={{ margin: 0 }}>{a.wanneer.split(",")[0]}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                            <span className="muted" style={{ fontSize: "0.85rem" }}>via {a.contact}</span>
                            <span className="btn btn-soft btn-sm">Meer →</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "kalender" && <KalenderView setPage={setPage} />}
        </div>
      </section>
    </main>
  );
}

function KalenderView({ setPage }) {
  const DAYS = [
    { id: "ma", label: "Maandag" },
    { id: "di", label: "Dinsdag" },
    { id: "wo", label: "Woensdag" },
    { id: "do", label: "Donderdag" },
    { id: "vr", label: "Vrijdag" },
    { id: "za", label: "Zaterdag" },
    { id: "zo", label: "Zondag" },
  ];
  function dayOf(a) {
    const w = a.wanneer.toLowerCase();
    if (w.includes("maandag")) return "ma";
    if (w.includes("dinsdag")) return "di";
    if (w.includes("woensdag")) return "wo";
    if (w.includes("donderdag")) return "do";
    if (w.includes("vrijdag")) return "vr";
    if (w.includes("zaterdag")) return "za";
    if (w.includes("zondag")) return "zo";
    return null;
  }
  return (
    <div className="kalender-grid">
      {DAYS.map((d) => {
        const items = ACTIVITIES.filter((a) => dayOf(a) === d.id);
        return (
          <div key={d.id} className="kalender-col">
            <h3>{d.label}</h3>
            {items.length === 0 && <div className="muted" style={{ fontSize: "0.9rem" }}>—</div>}
            {items.map((a) => {
              const time = (a.wanneer.match(/\d{1,2}:\d{2}/g) || [])[0] || "";
              return (
                <button
                  key={a.id}
                  className="kal-item"
                  style={{ background: catOf(a.cat).color + "1a", borderLeftColor: catOf(a.cat).color }}
                  onClick={() => setPage && setPage({ kind: "activiteit", id: a.id })}
                >
                  <strong>{a.name}</strong>
                  <span className="muted" style={{ fontSize: "0.82rem" }}>{time}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ============ PARTNERS ============ */
function Partners() {
  const partners = [
    { n: "Bewonersvereniging Noordelijk Scheveningen", short: "BNS", slug: "bns", url: "bnsscheveningen.nl", desc: "Behartigt de belangen van bewoners van Noordelijk Scheveningen — overleg met gemeente, ruimtelijke ordening, leefbaarheid." },
    { n: "Bibliotheek Scheveningen", short: "Bibliotheek", slug: "bibliotheek", url: "bibliotheekdenhaag.nl", desc: "Onderdeel van Bibliotheek Den Haag. Locatie voor lezen, leren, ontmoeten en veel TIB-activiteiten." },
    { n: "Stichting Ichthus", short: "Ichthus", slug: "ichthus", url: "ichthusscheveningen.nl", desc: "Buurtcentrum in de Vissershaven. Gastvrij thuis voor koffieochtenden, soepmiddagen en bingo." },
    { n: "Welzijn Scheveningen", short: "Welzijn", slug: "welzijn", url: "welzijnscheveningen.nl", desc: "Welzijnswerk in de wijk — van eenzaamheidsbestrijding tot dagactiviteiten voor ouderen." },
  ];
  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Partners</span>
          <h1>Vier partners, één wijk.</h1>
          <p>Thuis in de Buurt werkt nauw samen met vier vaste partners. Samen vormen we de basis voor activiteiten en initiatieven in Noordelijk Scheveningen.</p>
        </div>
      </section>
      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {partners.map((p, i) => (
              <article key={i} style={{ background: "white", borderRadius: 18, padding: 32, border: "1px solid var(--tib-line)", display: "flex", flexDirection: "column", gap: 16 }}>
                <Placeholder id={"partner-logo-" + p.slug} label={"Logo " + p.short} radius={10} fit="contain" style={{ width: 200, height: 90 }} />
                <h3 style={{ fontSize: "1.4rem" }}>{p.n}</h3>
                <p style={{ margin: 0, color: "var(--tib-ink-soft)" }}>{p.desc}</p>
                <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                  <a href={`https://${p.url}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">{p.url} ↗</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============ NETWERKEN ============ */
function Netwerken({ setPage }) {
  const [search, setSearch] = useStateOt("");
  const networks = [
    {
      id: "geriatrisch",
      n: "Geriatrisch Netwerk Scheveningen",
      desc: "Samenwerking tussen huisartsen, wijkverpleging en welzijn rond zorg voor kwetsbare ouderen.",
      focus: "Zorg & welzijn",
      area: "Heel Scheveningen",
      contact: "Dr. Annelies Verhoef",
      email: "geriatrisch@scheveningen.nl",
      phone: "070 416 22 30",
      link: "geriatrischnetwerk.nl",
      meets: "Maandelijks · 2ᵉ dinsdag · Bibliotheek Scheveningen",
      voorWie: "Huisartsen, wijkverpleegkundigen, mantelzorgers, casemanagers dementie",
      toegankelijk: "Toegankelijk voor mensen met mobiliteitshulpmiddelen",
    },
    {
      id: "ouder-worden",
      n: "Ouder Worden voor Beginners",
      desc: "Maandelijkse gespreksgroep voor 60-plussers over thema's als zelfstandig blijven wonen, sociale contacten en gezondheid.",
      focus: "Sociaal",
      area: "Noordelijk Scheveningen",
      contact: "Margriet Bouwmeester",
      email: "ouderworden@thuisindebuurt.org",
      phone: "06 23 45 67 81",
      meets: "Eerste donderdag van de maand · 14:00 – 16:00 · Ichthus",
      voorWie: "Iedereen vanaf 60 jaar — ervaring niet nodig",
      toegankelijk: "Begane grond · ringleiding aanwezig",
    },
    {
      id: "mantelzorg",
      n: "Netwerk Mantelzorg Scheveningen",
      desc: "Ondersteuning en uitwisseling voor mantelzorgers in de wijk — koffie, advies en kortingsregelingen.",
      focus: "Zorg",
      area: "Heel Scheveningen + omliggende wijken",
      contact: "Welzijn Scheveningen — Yvonne ten Brink",
      email: "mantelzorg@welzijnscheveningen.nl",
      phone: "070 416 22 22",
      link: "welzijnscheveningen.nl/mantelzorg",
      meets: "Inloop iedere woensdag 10:00 – 12:00",
      voorWie: "Iedereen die zorgt voor een naaste — geen aanmelding nodig",
      toegankelijk: "Volledig rolstoeltoegankelijk",
    },
    {
      id: "cultuur",
      n: "Cultuur Noordelijk Scheveningen",
      desc: "Overleg tussen culturele initiatieven, theater, muziek en buurtfotografen — onderlinge afstemming en gezamenlijke promotie.",
      focus: "Cultuur",
      area: "Statenkwartier · Belgisch Park · Vissershaven",
      contact: "Paul Renema",
      email: "cultuur@thuisindebuurt.org",
      phone: "06 34 56 78 90",
      meets: "Tweemaandelijks · Theater Vlieger",
      voorWie: "Culturele initiatieven, kunstenaars en buurtorganisaties in Noordelijk Scheveningen",
      toegankelijk: "Theater Vlieger heeft een lift en aangepast toilet",
    },
  ];

  const q = search.trim().toLowerCase();
  const filtered = q
    ? networks.filter((n) =>
        (n.n + " " + n.desc + " " + n.focus + " " + n.voorWie).toLowerCase().includes(q)
      )
    : networks;

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Netwerken</span>
          <h1>Actieve netwerken in de wijk.</h1>
          <p>Naast onze vier vaste partners bestaan er meerdere netwerken die zich inzetten voor specifieke thema's. Allemaal verankerd in Noordelijk Scheveningen.</p>
          <div className="field" style={{ maxWidth: 420, marginTop: 18 }}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam, thema of doelgroep…"
              aria-label="Zoek in netwerken"
            />
          </div>
        </div>
      </section>
      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {filtered.length === 0 && (
            <div className="callout">Geen netwerken gevonden voor "{search}". Probeer een ander woord.</div>
          )}
          {filtered.map((n) => (
            <article key={n.id} className="netwerk-card">
              <div className="netwerk-head">
                <div className="netwerk-avatar" aria-hidden="true">
                  {n.n.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <h3>{n.n}</h3>
                  <p style={{ margin: "4px 0 0", color: "var(--tib-ink-soft)" }}>{n.desc}</p>
                </div>
                <span className="badge">{n.focus}</span>
              </div>

              <dl className="netwerk-info">
                <div><dt>Voor wie</dt><dd>{n.voorWie}</dd></div>
                <div><dt>Werkgebied</dt><dd>{n.area}</dd></div>
                <div><dt>Wanneer</dt><dd>{n.meets}</dd></div>
                <div><dt>Toegankelijkheid</dt><dd>{n.toegankelijk}</dd></div>
                <div><dt>Contactpersoon</dt><dd>{n.contact}</dd></div>
              </dl>

              <div className="netwerk-actions">
                {n.email && <a className="btn btn-primary btn-sm" href={"mailto:" + n.email}>✉ Mail sturen</a>}
                {n.phone && <a className="btn btn-soft btn-sm" href={"tel:" + n.phone.replace(/\s/g, "")}>☎ {n.phone}</a>}
                {n.link && <a className="btn btn-ghost btn-sm" href={"https://" + n.link} target="_blank" rel="noopener noreferrer">{n.link} ↗</a>}
                <button className="btn btn-soft btn-sm" onClick={() => setPage && setPage("doemee")}>Aansluiten</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ============ NIEUWS ============ */
function Nieuws({ setPage }) {
  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Nieuws uit de buurt</span>
          <h1>Wat speelt er hier?</h1>
          <p>Nieuws over winkeliers, bewonersinitiatieven en restaurants. Voor gemeente-nieuws verwijzen we naar onze partner <a href="https://bnsscheveningen.nl" target="_blank" rel="noopener noreferrer">BNS</a>.</p>
        </div>
      </section>
      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container">
          <div className="cards-row">
            {NEWS.map((n) => (
              <article
                key={n.id}
                className="clubcard is-clickable"
                onClick={() => setPage && setPage({ kind: "nieuws", id: n.id })}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" && setPage) setPage({ kind: "nieuws", id: n.id }); }}
              >
                <Placeholder id={"nieuws-photo-" + n.id} label={"Foto bij " + n.title} variant={n.v} />
                <div className="clubcard-body">
                  <div className="meta">
                    <span className="badge">{n.tag}</span>
                    <span className="muted">{n.date}</span>
                  </div>
                  <h3>{n.title}</h3>
                  <p>{n.lead}</p>
                  <div className="clubcard-foot">
                    <span className="btn btn-soft btn-sm">Lees verder →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============ DOE MEE ============ */
function DoeMee({ voice }) {
  const you = voice === "u" ? "u" : "je";
  const [mode, setMode] = useStateOt("tibber");
  const [done, setDone] = useStateOt(false);
  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Doe mee</span>
          <h1>Word onderdeel van de buurt.</h1>
          <p>Wat past het beste bij {you}? Kies een optie en we helpen {you} verder.</p>
          <div className="seg" style={{ marginTop: 18 }}>
            <button className={mode === "tibber" ? "active" : ""} onClick={() => { setMode("tibber"); setDone(false); }}>TIBber worden</button>
            <button className={mode === "activiteit" ? "active" : ""} onClick={() => { setMode("activiteit"); setDone(false); }}>Activiteit aanleveren</button>
            <button className={mode === "partner" ? "active" : ""} onClick={() => { setMode("partner"); setDone(false); }}>Voor partners</button>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32 }}>
          <div className="form-card">
            {done ? (
              <div className="callout"><strong>Dank je wel!</strong> We nemen binnen een paar dagen contact op via {you === "u" ? "uw" : "je"} e-mailadres.</div>
            ) : (
              <form className="form-grid" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
                <div className="field">
                  <label>Naam</label>
                  <input placeholder="Voornaam en achternaam" required />
                </div>
                <div className="field">
                  <label>E-mailadres</label>
                  <input type="email" placeholder="je@e-mailadres.nl" required />
                </div>
                {mode === "tibber" && (
                  <div className="field full">
                    <label>Waar wil {you} aan bijdragen?</label>
                    <div className="chip-row" style={{ marginTop: 4 }}>
                      {(function(){try{var d=JSON.parse(localStorage.getItem("tib-cms-data")||"{}");return Array.isArray(d.contactOpties)&&d.contactOpties.length?d.contactOpties:["Koffie & Soep","Buurtatlas","Clubjes-redactie","Communicatie","Anders"];}catch(e){return ["Koffie & Soep","Buurtatlas","Clubjes-redactie","Communicatie","Anders"];}})().map((t) => (
                        <label key={t} className="chip" style={{ cursor: "pointer" }}>
                          <input type="checkbox" style={{ accentColor: "var(--tib-blue)" }} /> {t}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {mode === "activiteit" && (
                  <>
                    <div className="field"><label>Naam activiteit</label><input required /></div>
                    <div className="field"><label>Datum & tijd</label><input type="text" placeholder="dd-mm-jjjj 19:00" required /></div>
                    <div className="field full"><label>Beschrijving</label><textarea required /></div>
                  </>
                )}
                {mode === "partner" && (
                  <>
                    <div className="field"><label>Organisatie</label><input required /></div>
                    <div className="field"><label>Website</label><input placeholder="https://" /></div>
                    <div className="field full"><label>Wat zou {you} willen samen doen?</label><textarea required /></div>
                  </>
                )}
                <div className="field full">
                  <label>Bericht (optioneel)</label>
                  <textarea placeholder="Vertel meer…"></textarea>
                </div>
                <div className="field full" style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary">Verstuur</button>
                </div>
              </form>
            )}
          </div>

          <aside style={{ background: "var(--tib-blue-soft)", borderRadius: 18, padding: 28 }}>
            <h3 style={{ marginBottom: 12 }}>Wat gebeurt er daarna?</h3>
            <ol style={{ paddingLeft: 20, color: "var(--tib-ink-soft)", display: "flex", flexDirection: "column", gap: 10 }}>
              <li>We nemen binnen 3 werkdagen contact op via e-mail.</li>
              <li>Korte kennismaking — telefonisch of op de koffie bij Ichthus.</li>
              <li>{you === "u" ? "U" : "Je"} kiest waar {you} aan wil bijdragen.</li>
              <li>Welkom in de wijk!</li>
            </ol>
            <p style={{ marginTop: 20, color: "var(--tib-ink-soft)", fontSize: "0.95rem" }}>
              Liever direct mailen? <a href="mailto:info@thuisindebuurt.org">info@thuisindebuurt.org</a>
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ============ DONEREN ============ */
function Doneren({ voice, showToast, setPage }) {
  const you = voice === "u" ? "u" : "je";
  const [amt, setAmt] = useStateOt(25);
  const [custom, setCustom] = useStateOt("");
  const [freq, setFreq] = useStateOt("eenmalig");
  function go() {
    const a = custom ? Number(custom) : amt;
    showToast && showToast(`Bedankt! In een echte site ga je nu door naar Donorbox voor € ${a} (${freq}).`);
  }
  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Doneren</span>
          <h1>{(window.DONEREN_DATA&&window.DONEREN_DATA.paginaTitel)||"De buurt mogelijk maken."}</h1>
          <p>{(window.DONEREN_DATA&&window.DONEREN_DATA.paginaIntro)||"TIB draait op vrijwilligers en kleine bijdragen. Met een donatie maakt u alle sociale activiteiten zoals de jaarlijkse Walking Dinner mogelijk."}</p>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 30 }}>
          <div className="form-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--tib-cream-deep)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--tib-line)" }}>
              <strong style={{ fontSize: "0.95rem" }}>Donorbox · donorbox.org/thuis-in-de-buurt-donaties</strong>
              <span className="muted" style={{ fontSize: "0.85rem" }}>Beveiligde verbinding</span>
            </div>
            <div style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 16 }}>Eenmalig of maandelijks?</h2>
              <div className="seg" style={{ marginBottom: 22 }}>
                <button className={freq === "eenmalig" ? "active" : ""} onClick={() => setFreq("eenmalig")}>Eenmalig</button>
                <button className={freq === "maandelijks" ? "active" : ""} onClick={() => setFreq("maandelijks")}>Maandelijks</button>
              </div>
              <div className="amt-selectable" style={{ marginBottom: 18 }}>
                {[5, 10, 25, 50, 100].map((a) => (
                  <button
                    key={a}
                    className={"btn " + ((!custom && amt === a) ? "btn-primary selected" : "btn-soft")}
                    onClick={() => { setAmt(a); setCustom(""); }}
                  >€ {a}</button>
                ))}
              </div>
              <div className="field" style={{ marginBottom: 18 }}>
                <label>Of een ander bedrag</label>
                <input
                  placeholder="€ …"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={go}>
                Naar Donorbox → € {custom || amt}
              </button>
              <p className="muted" style={{ fontSize: "0.85rem", marginTop: 14, marginBottom: 0 }}>
                Donaties zijn aftrekbaar (ANBI-status). {you === "u" ? "U" : "Je"} ontvangt automatisch een bevestiging.
              </p>
            </div>
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ background: "white", borderRadius: 18, padding: 28, border: "1px solid var(--tib-line)" }}>
              <h3 style={{ marginBottom: 10 }}>{(window.DONEREN_DATA&&window.DONEREN_DATA.sectieBoek)||"Of bied steun door het kopen van het boek"}</h3>
              <div style={{ display: "flex", gap: 14 }}>
                <Placeholder id="boek-cover" label="Boek-cover" style={{ width: 80, height: 110, borderRadius: 8, flex: "none" }} radius={8} />
                <div>
                  <strong style={{ display: "block", marginBottom: 4 }}>Leven is spelen</strong>
                  <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>Margreet Jonkers · € 20,00.<br />De opbrengst gaat volledig naar TIB.</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setPage && setPage("boek")}>Meer info & bestellen →</button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "var(--tib-green-soft)", borderRadius: 18, padding: 28 }}>
              <h3 style={{ marginBottom: 10 }}>{(window.DONEREN_DATA&&window.DONEREN_DATA.sectieWaar)||"Waar gaat uw hulp naartoe?"}</h3>
              <ul style={{ paddingLeft: 18, color: "var(--tib-ink-soft)", display: "flex", flexDirection: "column", gap: 8, margin: 0 }}>
                <li>Koffie, soep en huur voor wekelijkse activiteiten</li>
                <li>Drukwerk: posters, flyers, Walking Dinner-routekaarten</li>
                <li>Materialen voor clubjes (bingoballen, schaakborden…)</li>
                <li>Onkostenvergoeding vrijwilligers</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Agenda, Activiteiten, Partners, Netwerken, Nieuws, DoeMee, Doneren });
