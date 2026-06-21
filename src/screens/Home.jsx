// screens/home.jsx — Homepage met AIDA-opbouw
const { useEffect: useEffectHome, useRef: useRefHome } = React;

function MiniMap({ height }) {
  const ref = useRefHome(null);
  useEffectHome(() => {
    if (!ref.current || !window.L) return;
    const map = L.map(ref.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      attributionControl: false
    }).setView([52.103, 4.282], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18
    }).addTo(map);
    // sample dots — sla items zonder coördinaten over
    CLUBJES.filter(c => c && c.lat != null && c.lng != null).slice(0, 9).forEach((c) => {
      const color = catOf(c.cat).color;
      L.circleMarker([c.lat, c.lng], {
        radius: 7,
        color: "white",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95
      }).addTo(map).bindTooltip(c.name);
    });
    return () => map.remove();
  }, []);
  return (
    <div className="mini-map-wrap" style={{ minHeight: height || 360, position: "relative", top: "auto", alignSelf: "auto" }}>
      <div ref={ref} style={{ position: "absolute", inset: 0 }}></div>
      <div className="legend" aria-label="Categorieën">
        {CATEGORIES.map((c) =>
        <div key={c.id} className="legend-row">
            <span className="legend-dot" style={{ background: c.color }}></span>
            <span>{c.label}</span>
          </div>
        )}
      </div>
    </div>);

}

function Home({ setPage, voice, tweaks, hideSection, showSection }) {
  const t = tweaks || {};
  const hide = hideSection || (() => {});
  const show = showSection || (() => {});
  const you = voice === "u" ? "u" : "je";
  const You = voice === "u" ? "U" : "Jij";
  const yourw = voice === "u" ? "uw" : "jouw";

  const SECTIONS = [
    { key: "showHero", label: "Hero" },
    { key: "showIntro", label: "Intro" },
    { key: "showClubjes", label: "Clubjes" },
    { key: "showAgenda", label: "Agenda" },
    { key: "showActiviteiten", label: "Activiteiten" },
    { key: "showPartners", label: "Partners" },
    { key: "showDonate", label: "Doneer-blok" },
  ];
  const hidden = SECTIONS.filter((s) => t[s.key] === false);

  const featured = CLUBJES.slice(0, 3);

  return (
    <main>
      {hidden.length > 0 && (
        <div className="hidden-strip">
          <div className="hidden-strip-inner">
            <span className="hidden-strip-label">Verborgen secties:</span>
            {hidden.map((s) => (
              <button
                key={s.key}
                className="chip"
                onClick={() => show(s.key)}
                title={"Terugzetten: " + s.label}
              >{s.label}</button>
            ))}
          </div>
        </div>
      )}
      {/* ============ HERO — Attention ============ */}
      {t.showHero !== false && (
      <section className="hero removable">
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showHero'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="hero-bg" aria-hidden="true"></div>
        <div className="tib-container hero-grid">
          <div>
            <span className="hero-eyebrow">Noordelijk Scheveningen</span>
            <h1>Ken {you} buurt,<br />voel {you} thuis.</h1>
            <p className="lead">
              Thuis in de Buurt brengt buurtgenoten samen.
              Ontdek clubjes om de hoek, sluit aan bij koffieochtenden,
              of start zelf iets nieuws. Allemaal vrijwilligers, allemaal buren.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => setPage("clubjes")}>
                Ontdek de Clubjes →
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => setPage("agenda")}>
                Bekijk de agenda
              </button>
            </div>
            <div className="pill-row" style={{ marginTop: 28 }}>
              <span className="pill">✦ {CLUBJES.length} actieve clubjes</span>
              <span className="pill">✦ {ACTIVITIES.length} terugkerende activiteiten</span>
              <span className="pill">✦ 4 vaste partners</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src={(typeof window !== "undefined" && "/images/logo.png") || "assets/tib-logo.png"} alt="Thuis in de Buurt — twee handen om een hart" className="hero-logo-img" />
          </div>
        </div>
      </section>)}

      {/* ============ INTRO — Interest ============ */}
      {t.showIntro !== false && (
      <section className="section section-band removable">
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showIntro'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="tib-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "center" }}>
            <div>
              <span className="eyebrow">Wat is Thuis in de Buurt?</span>
              <h2>Een buurtprikbord gemaakt door TIBbers.</h2>
            </div>
            <div>
              <p style={{ fontSize: "1.15rem", color: "var(--tib-ink-soft)" }}>
                Wij zijn een groep buurtbewoners de <strong>TIBbers</strong> — die zich
                inzet voor een warme, levendige wijk. Geen organisatie van bovenaf, maar
                een netwerk van mensen die elkaar willen leren kennen.
              </p>
              <p style={{ color: "var(--tib-ink-soft)" }}>
                Op deze site vind {you} álles wat er in Noordelijk Scheveningen te doen is:
                van clubjes en koffieochtenden tot de jaarlijkse Walking Dinner.
              </p>
              <div className="hero-cta" style={{ marginTop: 20 }}>
                <button className="btn btn-soft" onClick={() => setPage("doemee")}>Word ook TIBber</button>
              </div>
            </div>
          </div>
        </div>
      </section>)}

      {/* ============ CLUBJES — Desire ============ */}
      {t.showClubjes !== false && (
      <section className="section removable" style={{ background: '#ffffff' }}>
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showClubjes'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="tib-container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Clubjes om de hoek</span>
              <h2>Zoek {yourw} mensen, vind {yourw} ding.</h2>
            </div>
            <p>
              Een clubje is een groepje buurtbewoners met een gedeelde interesse —
              schaken, wandelen, lezen, fotograferen. Open voor iedereen die wil aansluiten.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
            <div className="cards-row" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {featured.map((c) =>
              <article
                key={c.id}
                className="clubcard is-clickable"
                onClick={() => setPage({ kind: "clubje", id: c.id })}
                tabIndex={0}
                onKeyDown={(e) => {if (e.key === "Enter") setPage({ kind: "clubje", id: c.id });}}>
                
                  <Placeholder
                  id={"clubje-photo-" + c.id}
                  label={"Foto " + c.name}
                  variant={["sociaal", "buiten"].includes(c.cat) ? "green" : ""} />
                
                  <div className="clubcard-body">
                    <div className="meta"><CatBadge cat={c.cat} /> · <span>{c.area}</span></div>
                    <h3>{c.name}</h3>
                    <p>{c.desc}</p>
                    <div className="clubcard-foot">
                      <span className="muted">Contact: {c.contact}</span>
                      <a className="btn btn-soft btn-sm" href={"mailto:" + c.email} onClick={(e) => e.stopPropagation()}>Mail →</a>
                    </div>
                  </div>
                </article>
              )}
            </div>
            <MiniMap height={480} />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={() => setPage("clubjes")}>
              Bekijk alle clubjes
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => setPage("clubjes")}>
              + Meld {yourw} clubje aan
            </button>
          </div>
        </div>
      </section>)}

      {/* ============ AGENDA preview ============ */}
      {t.showAgenda !== false && (
      <section className="section section-band removable" style={{ background: 'var(--tib-cream)' }}>
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showAgenda'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="tib-container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Binnenkort in de buurt</span>
              <h2>De eerstvolgende evenementen.</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => setPage("agenda")}>Hele agenda →</button>
          </div>
          <div className="agenda-row">
            {AGENDA.slice(0, 3).map((e) =>
            <article
              key={e.id}
              className="agenda-card is-clickable"
              onClick={() => setPage({ kind: "agenda", id: e.id })}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              onKeyDown={(ev) => {if (ev.key === "Enter") setPage({ kind: "agenda", id: e.id });}}>
              
                <div className="agenda-date">
                  <div className="day">{e.d}</div>
                  <div className="mo">{e.m}</div>
                </div>
                <div>
                  <h3>{e.t}</h3>
                  <div className="where">{e.w}</div>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>)}

      {/* ============ ACTIVITEITEN samenvatting ============ */}
      {t.showActiviteiten !== false && (
      <section className="section removable" style={{ background: '#ffffff' }}>
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showActiviteiten'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="tib-container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Elke week iets te doen</span>
              <h2>Terugkerende activiteiten.</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => setPage("activiteiten")}>Alle activiteiten →</button>
          </div>
          <div className="cards-row cards-4">
            {ACTIVITIES.slice(0, 4).map((a) =>
            <article
              key={a.id}
              className="clubcard is-clickable"
              onClick={() => setPage({ kind: "activiteit", id: a.id })}
              tabIndex={0}
              onKeyDown={(e) => {if (e.key === "Enter") setPage({ kind: "activiteit", id: a.id });}}>
              
                <Placeholder id={"activiteit-photo-" + a.id} label={"Foto " + a.name} variant={["sociaal", "buiten"].includes(a.cat) ? "green" : ""} />
                <div className="clubcard-body">
                  <h3>{a.name}</h3>
                  <p className="muted" style={{ margin: 0 }}>{a.wanneer.split(",")[0]}</p>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>)}

      {/* ============ PARTNERS ============ */}
      {t.showPartners !== false && (
      <section className="section section-band removable" style={{ background: 'var(--tib-cream)' }}>
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showPartners'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="tib-container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Samen met</span>
              <h2>Onze partners in de wijk.</h2>
            </div>
            <p>We werken nauw samen met vier vaste partners die diep in de buurt geworteld zijn.</p>
          </div>
          <div className="partner-grid">
            {[
            { n: "BNS", f: "Bewonersvereniging Noordelijk Scheveningen", short: "BNS", slug: "bns" },
            { n: "Bibliotheek Scheveningen", f: "Bibliotheek Den Haag", short: "Bibliotheek", slug: "bibliotheek" },
            { n: "Stichting Ichthus", f: "Buurtcentrum & ontmoeting", short: "Ichthus", slug: "ichthus" },
            { n: "Welzijn Scheveningen", f: "Zorg & welzijn in de wijk", short: "Welzijn", slug: "welzijn" }].
            map((p, i) =>
            <div key={i} className="partner-card">
                <span onClick={(e) => e.stopPropagation()} style={{ display: "block" }}>
                  <Placeholder id={"partner-logo-" + p.slug} label={"Logo " + p.short} radius={10} fit="contain" style={{ width: 160, height: 70 }} />
                </span>
                <a href="#" onClick={(e) => {e.preventDefault();setPage("partners");}} style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>{p.n}</a>
                <div className="muted" style={{ fontSize: "0.9rem" }}>{p.f}</div>
              </div>
            )}
          </div>
        </div>
      </section>)}

      {/* ============ DONATE — Action ============ */}
      {t.showDonate !== false && (
      <section className="section removable" style={{ background: '#ffffff' }}>
        <button className="section-remove" onClick={(e) => { e.stopPropagation(); hide('showDonate'); }} title="Verberg sectie" aria-label="Verberg deze sectie"></button>
        <div className="tib-container">
          <div className="donate-card">
            <div>
              <span className="eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>Steun de buurt</span>
              <h2>De buurt draait op vrijwilligers — en op kleine bijdragen.</h2>
              <p>
                Met een donatie maak {you} koffieochtenden, drukwerk en de jaarlijkse
                Walking Dinner mogelijk. Geen verplichting — élke euro telt.
              </p>
              <div className="donate-cta">
                <button className="btn btn-primary btn-lg" onClick={() => setPage("doneren")}>Doneer via Donorbox</button>
                <button className="btn btn-ghost btn-lg" onClick={() => setPage("boek")}>Boek "Leven is spelen"</button>
              </div>
            </div>
            <div className="donate-visual" aria-hidden="true">
              <div style={{ fontWeight: 600, opacity: 0.9 }}>Kies een bedrag</div>
              <div className="amt-row">
                <span className="amt">€ 5</span>
                <span className="amt">€ 10</span>
                <span className="amt featured">€ 25</span>
                <span className="amt">€ 50</span>
                <span className="amt">Anders</span>
              </div>
              <div style={{ marginTop: 12, fontSize: "0.85rem", opacity: 0.85 }}>
                Eenmalig of maandelijks · via Donorbox
              </div>
            </div>
          </div>
        </div>
      </section>)}
    </main>);

}

Object.assign(window, { Home, MiniMap });