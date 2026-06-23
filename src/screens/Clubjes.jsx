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

    // Groepeer per uniek adres (zelfde lat/lng)
    const groups = {};
    items.forEach((c) => {
      if (!c.lat || !c.lng) return;
      const key = parseFloat(c.lat).toFixed(5) + ',' + parseFloat(c.lng).toFixed(5);
      if (!groups[key]) groups[key] = { lat: parseFloat(c.lat), lng: parseFloat(c.lng), clubs: [] };
      groups[key].clubs.push(c);
    });

    Object.values(groups).forEach(({ lat, lng, clubs }) => {
      const firstCat = catOf(clubs[0].cat);
      const markerColor = clubs.length > 1 ? '#4a5563' : firstCat.color;

      const marker = L.circleMarker([lat, lng], {
        radius: clubs.length > 1 ? 11 : 9,
        color: "white",
        weight: 2,
        fillColor: markerColor,
        fillOpacity: 0.95,
      });

      const popupDiv = document.createElement("div");
      popupDiv.style.fontFamily = "'Source Sans 3', sans-serif";
      popupDiv.style.minWidth = "220px";

      const adres = clubs[0].waar || '';
      const clubsHtml = clubs.map(c => {
        const cc = catOf(c.cat);
        return `<div class="js-open-club" data-id="${c.id}" style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #e5e7eb;cursor:pointer;">
          <span style="width:9px;height:9px;border-radius:50%;background:${cc.color};flex-shrink:0;"></span>
          <span style="color:#1a4a7a;font-weight:600;font-size:0.92rem;text-decoration:underline;">${c.name}</span>
        </div>`;
      }).join('');

      popupDiv.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:#7a8392;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">
          ${clubs.length} buurtgroep${clubs.length !== 1 ? 'en' : ''}
        </div>
        ${clubsHtml}
        <div style="font-size:0.82rem;color:#7a8392;margin-top:8px;">📍 ${adres}</div>
      `;

      popupDiv.querySelectorAll('.js-open-club').forEach(el => {
        el.addEventListener('click', () => onOpen && onOpen(parseInt(el.dataset.id, 10)));
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

const ICONEN = [
  { label: 'wandelen', bestand: 'wandelen.png' },
  { label: 'fietsen', bestand: 'fietsen.png' },
  { label: 'koffie', bestand: 'koffie.png' },
  { label: 'eten', bestand: 'eten.png' },
  { label: 'gamen', bestand: 'gamen.png' },
  { label: 'layout', bestand: 'layout.png' },
  { label: 'puzzel', bestand: 'puzzel.png' },
  { label: 'muziek-noot', bestand: 'muziek-noot.png' },
  { label: 'zingen', bestand: 'zingen.png' },
  { label: 'muziek', bestand: 'muziek.png' },
  { label: 'bewegen', bestand: 'bewegen.png' },
  { label: 'vinyl', bestand: 'vinyl.png' },
  { label: 'sport', bestand: 'sport.png' },
  { label: 'golven', bestand: 'golven.png' },
  { label: 'bloemen', bestand: 'bloemen.png' },
  { label: 'natuur', bestand: 'natuur.png' },
  { label: 'bomen', bestand: 'bomen.png' },
  { label: 'boom', bestand: 'boom.png' },
  { label: 'kunst', bestand: 'kunst.png' },
  { label: 'knippen', bestand: 'knippen.png' },
  { label: 'kleding', bestand: 'kleding.png' },
  { label: 'lezen', bestand: 'lezen.png' },
  { label: 'bibliotheek', bestand: 'bibliotheek.png' },
  { label: 'educatie', bestand: 'educatie.png' },
  { label: 'taal', bestand: 'taal.png' },
  { label: 'laptop', bestand: 'laptop.png' },
  { label: 'tablet', bestand: 'tablet.png' },
  { label: 'koken', bestand: 'koken.png' },
  { label: 'pan', bestand: 'pan.png' },
  { label: 'winkelen', bestand: 'winkelen.png' },
  { label: 'winkel', bestand: 'winkel.png' },
  { label: 'gezondheid', bestand: 'gezondheid.png' },
  { label: 'hartslag', bestand: 'hartslag.png' },
  { label: 'zorg', bestand: 'zorg.png' },
  { label: 'medisch', bestand: 'medisch.png' },
  { label: 'toegankelijkheid', bestand: 'toegankelijkheid.png' },
  { label: 'thuis-toevoegen', bestand: 'thuis-toevoegen.png' },
  { label: 'thuis', bestand: 'thuis.png' },
  { label: 'kaart', bestand: 'kaart.png' },
  { label: 'groep', bestand: 'groep.png' },
  { label: 'chat', bestand: 'chat.png' },
  { label: 'samenwerken', bestand: 'samenwerken.png' },
  { label: 'handdruk', bestand: 'handdruk.png' },
  { label: 'agenda', bestand: 'agenda.png' },
  { label: 'locatie', bestand: 'locatie.png' },
  { label: 'auto', bestand: 'auto.png' },
  { label: 'bus', bestand: 'bus.png' },
  { label: 'school', bestand: 'school.png' },
  { label: 'museum', bestand: 'museum.png' },
  { label: 'theater', bestand: 'theater.png' },
  { label: 'film', bestand: 'film.png' },
  { label: 'feest', bestand: 'feest.png' },
  { label: 'computer', bestand: 'computer.png' },
  { label: 'wifi', bestand: 'wifi.png' },
  { label: 'veiligheid', bestand: 'veiligheid.png' },
  { label: 'portemonnee', bestand: 'portemonnee.png' },
  { label: 'info', bestand: 'info.png' },
  { label: 'zoeken', bestand: 'zoeken.png' },
  { label: 'mail', bestand: 'mail.png' },
  { label: 'telefoon', bestand: 'telefoon.png' },
  { label: 'favoriet', bestand: 'favoriet.png' },
  { label: 'ster', bestand: 'ster.png' },
  { label: 'nieuws', bestand: 'nieuws.png' },
  { label: 'camera', bestand: 'camera.png' },
];
const ICOON_BASE_URL = 'https://bxklumejqczcmhrpzstt.supabase.co/storage/v1/object/public/icons/';

function ClubjeForm({ onClose }) {
  const [submitted, setSubmitted] = useStateCl(false);
  const [submitting, setSubmitting] = useStateCl(false);
  const [selectedIcon, setSelectedIcon] = useStateCl(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = e.target;
    setSubmitting(true);
    try {
      const sb = window._tibSupabase;
      if (sb) {
        const icoon = selectedIcon ? ICONEN.find(i => i.label === selectedIcon) : null;
        await sb.from('buurtgroep_aanvragen').insert([{
          naam_buurtgroep: fd.querySelector('#cn').value,
          categorie: fd.querySelector('#cc').value,
          beschrijving: fd.querySelector('#cd').value,
          contactpersoon: fd.querySelector('#cp').value,
          email_of_telefoon: fd.querySelector('#ce').value,
          locatie: fd.querySelector('#cl').value,
          icoon_url: icoon ? ICOON_BASE_URL + icoon.bestand : null,
          icoon_label: selectedIcon || null,
          status: 'nieuw',
        }]);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Aanmelding fout:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

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
        <form className="form-grid" onSubmit={handleSubmit}>
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
          <div className="field full">
            <label style={{ display: 'block', marginBottom: 8 }}>Kies een icoon voor je buurtgroep</label>
            {selectedIcon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, color: '#166534' }}>
                <img src={ICOON_BASE_URL + ICONEN.find(i => i.label === selectedIcon).bestand} style={{ width: 28, height: 28 }} alt={selectedIcon} />
                <span>{selectedIcon}</span>
                <span style={{ color: '#6b7280' }}>geselecteerd ✓</span>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, maxHeight: 280, overflowY: 'auto', padding: 6, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' }}>
              {ICONEN.map(icon => (
                <div
                  key={icon.label}
                  onClick={() => setSelectedIcon(icon.label)}
                  title={icon.label}
                  style={{ background: 'white', border: selectedIcon === icon.label ? '2px solid #2d6a4f' : '2px solid transparent', borderRadius: 10, padding: 6, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
                >
                  <img src={ICOON_BASE_URL + icon.bestand} alt={icon.label} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                  <span style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', maxWidth: '100%' }}>{icon.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="field full" style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexDirection: "row" }}>
            {onClose && <button type="button" className="btn btn-soft" onClick={onClose}>Annuleren</button>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Versturen…' : 'Verstuur aanmelding'}</button>
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
      const mapped = data.map(c => ({
        id: c.id,
        name: c.naam || 'Nieuw clubje',
        desc: c.omschrijving || '',
        cat: normCatCl(c.categorie || 'sociaal'),
        contact: c.contact || '',
        email: c.email || '',
        phone: c.telefoon || '',
        area: c.wijk || '',
        lat: c.lat != null ? parseFloat(c.lat) : null,
        lng: c.lng != null ? parseFloat(c.lng) : null,
        photo: null,
        icoon_url: c.icoon_url || null,
        icoon_label: c.icoon_label || null,
        voorWie: c.voor_wie || '',
        wat: c.categorie || '',
        waar: c.waar || '',
        wanneer: c.wanneer || '',
        kosten: c.kosten || '',
        contact_zichtbaar: c.contact_zichtbaar === true,
      }));
      setClubs(mapped);
      // Update window.CLUBJES zodat Detail component actuele data heeft
      window.CLUBJES && (window.CLUBJES.length = 0);
      if (window.CLUBJES) mapped.forEach(c => window.CLUBJES.push(c));
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
                    {c.icoon_url
                      ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", height: 90 }}>
                          <img src={c.icoon_url} alt={c.icoon_label || c.name} style={{ width: 56, height: 56, objectFit: "contain" }} />
                        </div>
                      : <Placeholder
                          id={"clubje-photo-" + c.id}
                          label={"Foto " + c.name}
                          variant={["sociaal", "buiten"].includes(c.cat) ? "green" : ""}
                        />
                    }
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
