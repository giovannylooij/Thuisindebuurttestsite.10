// screens/clubjes.jsx — Clubjes overzicht met filter, kaart en aanmeldformulier
const { useState: useStateCl, useEffect: useEffectCl, useRef: useRefCl, useMemo: useMemoCl } = React;

function ClubjesMap({ items, onOpen }) {
  const ref = useRefCl(null);
  const mapRef = useRefCl(null);
  const layerRef = useRefCl(null);

  useEffectCl(() => {
    if (!ref.current || !window.L) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([52.103, 4.282], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap"
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); };
  }, []);

  useEffectCl(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    items.forEach((c) => {
      const color = catOf(c.cat).color;
      const marker = L.circleMarker([c.lat, c.lng], {
        radius: 9,
        color: "white",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      });
      const popupDiv = document.createElement("div");
      popupDiv.style.fontFamily = "'Source Sans 3', sans-serif";
      popupDiv.style.minWidth = "200px";
      popupDiv.innerHTML = `
        <div style="display:inline-block; padding:3px 10px; border-radius:999px; background:${color}; color:white; font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;">${catOf(c.cat).label}</div>
        <h4 style="margin:8px 0 4px; font-family:'Lora',serif; font-size:1.05rem;">${c.name}</h4>
        <p style="margin:0 0 8px; font-size:0.92rem; color:#4a5563;">${c.desc}</p>
        <div style="font-size:0.82rem; color:#7a8392; margin-bottom: 10px;">${c.area} · ${c.contact}</div>
        <button class="js-open-club" style="background:${color}; color:white; border:none; padding:8px 14px; border-radius:999px; font-weight:600; cursor:pointer; font-family:inherit; font-size:0.9rem;">Bekijk clubje →</button>
      `;
      popupDiv.querySelector(".js-open-club").addEventListener("click", () => {
        onOpen && onOpen(c.id);
      });
      marker.bindPopup(popupDiv);
      marker.addTo(layerRef.current);
    });
  }, [items, onOpen]);

  return (
    <div className="map-host">
      <div ref={ref} style={{ position: "absolute", inset: 0 }}></div>
    </div>
  );
}

function ClubjeForm({ onClose }) {
  const [submitted, setSubmitted] = useStateCl(false);
  return (
    <div className="form-card">
      <h2 style={{ marginBottom: 8 }}>Meld je clubje aan</h2>
      <p className="muted" style={{ marginBottom: 22 }}>
        Margareth (beheerder) ontvangt je aanmelding en plaatst het clubje
        binnen een paar dagen op de site. Je krijgt een bevestiging per e-mail.
      </p>
      {submitted ? (
        <div className="callout">
          <strong>Bedankt!</strong> Je aanmelding is verzonden. We nemen binnen 3 werkdagen contact op.
        </div>
      ) : (
        <form className="form-grid" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div className="field">
            <label htmlFor="cn">Naam clubje</label>
            <input id="cn" placeholder="bijv. Schaakclub Wassenaarseweg" required />
          </div>
          <div className="field">
            <label htmlFor="cc">Categorie</label>
            <select id="cc" required defaultValue="">
              <option value="" disabled>Kies een categorie</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="cd">Korte beschrijving</label>
            <textarea id="cd" placeholder="Max. 3 regels — wat doen jullie, wanneer, voor wie?" />
            <span className="help">Houd het kort en uitnodigend.</span>
          </div>
          <div className="field">
            <label htmlFor="cp">Contactpersoon</label>
            <input id="cp" placeholder="Voornaam + achternaam" required />
          </div>
          <div className="field">
            <label htmlFor="ce">E-mail of telefoon</label>
            <input id="ce" placeholder="contact@…" required />
          </div>
          <div className="field">
            <label htmlFor="cl">Locatie / buurt</label>
            <input id="cl" placeholder="bijv. Statenkwartier, Belgisch Park…" />
          </div>
          <div className="field">
            <label>Profiel- of sfeerfoto</label>
            <image-slot id="club-form-photo" shape="rounded" radius="10" fit="contain" placeholder="Sleep een foto hier" style={{ height: 80, width: "100%" }}></image-slot>
          </div>
          <div className="field full" style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexDirection: "row" }}>
            {onClose && <button type="button" className="btn btn-soft" onClick={onClose}>Annuleren</button>}
            <button type="submit" className="btn btn-primary">Verstuur aanmelding</button>
          </div>
        </form>
      )}
    </div>
  );
}

function normCatCl(cat) {
  if (!cat) return (window.CATEGORIES || CATEGORIES)[0]?.id || 'sociaal';
  const cats = window.CATEGORIES || CATEGORIES;
  const lc = cat.trim().toLowerCase();
  // Match op label (bijv. "Lezen & leren" → id "lezen-leren")
  const byLabel = cats.find(c => (c.label || '').trim().toLowerCase() === lc);
  if (byLabel) return byLabel.id;
  // Fallback: match eerste woord op id prefix
  const word = lc.split(/[\s&]/)[0];
  const byPrefix = cats.find(c => c.id.split('-')[0] === word);
  return byPrefix ? byPrefix.id : (cats[0]?.id || 'sociaal');
}

function Clubjes({ setPage, voice }) {
  const you = voice === "u" ? "u" : "je";
  const yourw = voice === "u" ? "uw" : "jouw";
  const [active, setActive] = useStateCl(new Set(CATEGORIES.map((c) => c.id)));
  const [view, setView] = useStateCl("kaart"); // kaart | lijst
  const [showForm, setShowForm] = useStateCl(false);
  const [clubs, setClubs] = useStateCl(() => CLUBJES.map(c => ({ ...c, cat: normCatCl(c.cat) })));

  useEffectCl(() => {
    const sb = window._tibSupabase;
    if (!sb) return;
    sb.from('clubjes').select('*').eq('status', 'Gepubliceerd').then(({ data, error }) => {
      if (error || !data || data.length === 0) return;
      // Vervang statische data volledig door Supabase data
      setClubs(data.map(c => ({
        id: c.id,
        name: c.naam || 'Nieuw clubje',
        desc: c.omschrijving || '',
        cat: normCatCl(c.categorie || 'sociaal'),
        contact: c.contact || '',
        email: c.email || '',
        phone: c.telefoon || '',
        area: c.wijk || '',
        lat: c.lat ? parseFloat(c.lat) : 52.103,
        lng: c.lng ? parseFloat(c.lng) : 4.282,
        photo: null,
        voorWie: c.voor_wie || '',
        wat: c.categorie || '',
        waar: c.waar || '',
        wanneer: c.wanneer || '',
        kosten: c.kosten || '',
      })));
    });
  }, []);

  const items = useMemoCl(() => clubs.filter((c) => active.has(c.cat)), [active, clubs]);

  function toggle(id) {
    setActive((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (next.size === 0) return new Set(CATEGORIES.map((c) => c.id));
      return next;
    });
  }
  function only(id) { setActive(new Set([id])); }
  function all() { setActive(new Set(CATEGORIES.map((c) => c.id))); }

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Clubjes</span>
          <h1>Vind {yourw} clubje in de buurt.</h1>
          <p>Een clubje is een groepje buurtbewoners met een gedeelde interesse. Iedereen is welkom — of {you} nu nieuw bent in de wijk of er al jaren woont.</p>
        </div>
      </section>

      <section style={{ paddingBottom: 30 }}>
        <div className="tib-container">
          {/* Filterbar */}
          <div className="callout" style={{ marginBottom: 18, background: "var(--tib-green-soft)", borderLeftColor: "var(--tib-green)" }}>
            <strong>💡 Tip:</strong> klik op een categorie om alleen die te tonen. Klik nog eens om hem weer aan/uit te zetten. Klik op een stip in de kaart voor meer info.
          </div>
          <div className="chip-row" style={{ marginBottom: 20 }}>
            <button className={"chip " + (active.size === CATEGORIES.length ? "active" : "")} onClick={all}>
              Alle categorieën
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={"chip " + (active.has(c.id) && active.size < CATEGORIES.length ? "active" : "")}
                onClick={() => toggle(c.id)}
                onDoubleClick={() => only(c.id)}
              >
                <span className="swatch" style={{ background: c.color }}></span>
                {c.label}
              </button>
            ))}
            <div style={{ flex: 1 }}></div>
            <div className="seg" role="tablist">
              <button className={view === "kaart" ? "active" : ""} onClick={() => setView("kaart")}>Kaart</button>
              <button className={view === "lijst" ? "active" : ""} onClick={() => setView("lijst")}>Lijst</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {view === "kaart" && (
              <div className="mini-map-wrap" style={{ width: "100%", height: 420, minHeight: 0, position: "relative", top: "auto", alignSelf: "auto" }}>
                <ClubjesMap items={items} onOpen={(id) => setPage({ kind: "clubje", id })} />
              </div>
            )}
            <div>
              <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
                <h2 style={{ fontSize: "1.5rem" }}>{items.length} clubje{items.length === 1 ? "" : "s"} gevonden</h2>
                <button className="btn btn-secondary" onClick={() => setShowForm((s) => !s)}>
                  + Meld {yourw} clubje aan
                </button>
              </div>

              {showForm && <div style={{ marginBottom: 30 }}><ClubjeForm onClose={() => setShowForm(false)} /></div>}

              <div className="cards-row">
                {items.map((c) => (
                  <article
                    key={c.id}
                    className="clubcard is-clickable"
                    onClick={() => setPage({ kind: "clubje", id: c.id })}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setPage({ kind: "clubje", id: c.id }); }}
                  >
                    <Placeholder
                      id={"clubje-photo-" + c.id}
                      label={"Foto " + c.name}
                      variant={["sociaal", "buiten"].includes(c.cat) ? "green" : ""}
                    />
                    <div className="clubcard-body">
                      <div className="meta"><CatBadge cat={c.cat} /></div>
                      <h3 style={{display:"flex",alignItems:"center"}}>{window.getActivityIconJSX&&window.getActivityIconJSX(c.name)}<span>{c.name}</span></h3>
                      <p>{c.desc}</p>
                      <div className="clubcard-foot">
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{c.contact}</span>
                          <span className="muted" style={{ fontSize: "0.85rem" }}>{c.area}</span>
                        </div>
                        <a className="btn btn-soft btn-sm" href={"mailto:" + c.email} onClick={(e) => e.stopPropagation()}>Mail →</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {items.length === 0 && (
                <div className="callout">Geen clubjes binnen deze categorieën. Probeer een andere selectie of meld een nieuw clubje aan.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Clubjes, ClubjesMap, ClubjeForm });
