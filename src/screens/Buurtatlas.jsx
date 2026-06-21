// screens/buurtatlas.jsx — Buurtatlas met kaart en categorie-filter
const { useState: useStateBa, useEffect: useEffectBa, useRef: useRefBa, useMemo: useMemoBa } = React;

const ATLAS_CATEGORIES = [
  { id: "bewoners", label: "Bewonersinitiatieven", color: "#3f8f7a" },
  { id: "winkel", label: "Wijkwinkel", color: "#2a6fb5" },
  { id: "zorg", label: "Zorg & Welzijn", color: "#b94842" },
  { id: "vereniging", label: "Verenigingen", color: "#7e4ca3" },
  { id: "eten", label: "Eten & Drinken", color: "#d97a2c" },
  { id: "org", label: "Partners", color: "#7a7363" },
  { id: "kunst", label: "Kunst & Cultuur", color: "#a8729a" },
];

const ATLAS_PLACES = [
  { id: 1, name: "Bewonersvereniging Noordelijk Scheveningen (BNS)", cat: "bewoners", addr: "Statenkwartier", lat: 52.107, lng: 4.281, link: "bnsscheveningen.nl", phone: "070 354 10 81", hours: "Spreekuur woensdag 14:00 – 16:00" },
  { id: 2, name: "Buurttuin Achter Ichthus", cat: "bewoners", addr: "Vissershaven, achter Duinstraat 12", lat: 52.100, lng: 4.279, hours: "Woensdag 10:00 – 12:00 (mrt – okt)", phone: "06 56 78 90 12" },
  { id: 3, name: "Repair Café Scheveningen", cat: "bewoners", addr: "Bibliotheek Scheveningen", lat: 52.103, lng: 4.281, hours: "2ᵉ zaterdag van de maand · 13:00 – 16:00", link: "repaircafe.nl" },
  { id: 4, name: "Boekhandel De Vries", cat: "winkel", addr: "Gentsestraat 38", lat: 52.106, lng: 4.286, phone: "070 354 12 34", link: "boekhandeldevries.nl", hours: "Ma – za 09:00 – 18:00" },
  { id: 5, name: "Bakker Vermeer", cat: "winkel", addr: "Frederik Hendriklaan 132", lat: 52.099, lng: 4.276, phone: "070 355 22 33", hours: "Ma – za 07:30 – 18:00" },
  { id: 6, name: "Welzijn Scheveningen", cat: "zorg", addr: "Scheveningseweg 56", lat: 52.101, lng: 4.288, link: "welzijnscheveningen.nl", phone: "070 416 22 22", hours: "Ma – vr 09:00 – 17:00" },
  { id: 7, name: "Geriatrisch Netwerk Scheveningen", cat: "zorg", addr: "Bibliotheek Scheveningen", lat: 52.103, lng: 4.281, link: "geriatrischnetwerk.nl", phone: "070 416 22 30" },
  { id: 8, name: "Tennisvereniging De Duinen", cat: "vereniging", addr: "Duinweg 14", lat: 52.110, lng: 4.272, link: "tvdeduinen.nl", phone: "070 358 14 00", hours: "Banen open 07:00 – 23:00" },
  { id: 9, name: "Restaurant De Pier", cat: "eten", addr: "Strandweg 1", lat: 52.108, lng: 4.273, link: "depier.nl", phone: "070 305 10 00", hours: "Di – zo 12:00 – 22:00" },
  { id: 10, name: "Strandtent De Fuut", cat: "eten", addr: "Strand Zuid, paviljoen 4", lat: 52.097, lng: 4.270, phone: "06 23 12 34 56", hours: "April – oktober · 09:00 – zonsondergang" },
  { id: 11, name: "Stichting Ichthus", cat: "org", addr: "Duinstraat 12", lat: 52.099, lng: 4.283, link: "ichthusscheveningen.nl", phone: "070 355 33 22", hours: "Wo – vr 10:00 – 16:00" },
  { id: 12, name: "Theater Vlieger", cat: "kunst", addr: "Belgisch Park, Vliegerstraat 4", lat: 52.106, lng: 4.290, link: "theatervlieger.nl", phone: "070 355 88 99" },
  { id: 13, name: "Bibliotheek Scheveningen", cat: "kunst", addr: "Frederik Hendriklaan 274", lat: 52.099, lng: 4.279, link: "bibliotheekdenhaag.nl", phone: "070 353 49 00", hours: "Ma – vr 10:00 – 20:00 · Za 10:00 – 17:00" },
  { id: 14, name: "Muziek & Dans Vereniging Scheveningen", cat: "kunst", addr: "Statenkwartier, Frederikstraat 22", lat: 52.105, lng: 4.284, phone: "06 34 56 78 90" },
];

function atlasCat(id) { return ATLAS_CATEGORIES.find((c) => c.id === id) || ATLAS_CATEGORIES[6]; }

function matchPartner(atlasName, partnerNaam) {
  const a = atlasName.toLowerCase();
  const p = (partnerNaam || '').toLowerCase().trim();
  if (!p) return false;
  if (a === p || a.includes(p) || p.includes(a)) return true;
  const firstWord = p.split(/\s+/)[0];
  return firstWord.length >= 2 && a.includes(firstWord);
}

function AtlasMap({ items }) {
  const ref = useRefBa(null);
  const mapRef = useRefBa(null);
  const layerRef = useRefBa(null);
  useEffectBa(() => {
    if (!ref.current || !window.L) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([52.103, 4.282], (function(){try{var d=JSON.parse(localStorage.getItem("tib-cms-data")||"{}");return typeof d.atlasZoom==="number"?d.atlasZoom:14;}catch(e){return 14;}})());
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap"
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); };
  }, []);
  useEffectBa(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    items.forEach((p) => {
      const c = atlasCat(p.cat);
      L.circleMarker([p.lat, p.lng], {
        radius: 8, color: "white", weight: 2,
        fillColor: c.color, fillOpacity: 0.95,
      }).bindPopup(`
        <div style="font-family:'Source Sans 3',sans-serif; min-width:200px;">
          <div style="display:inline-block; padding:3px 10px; border-radius:999px; background:${c.color}; color:white; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;">${c.label}</div>
          <h4 style="margin:8px 0 4px; font-family:'Lora',serif; font-size:1.05rem;">${p.name}</h4>
          <div style="font-size:0.88rem; color:#7a8392; margin-bottom: 6px;">${p.addr}</div>
          ${p.phone ? `<div style="font-size:0.88rem; color:#4a5563; margin-bottom: 4px;">☎ <a href="tel:${p.phone.replace(/\s/g, '')}" style="color:#1a4a7a;">${p.phone}</a></div>` : ""}
          ${p.hours ? `<div style="font-size:0.84rem; color:#7a8392; margin-bottom: 6px;">🕓 ${p.hours}</div>` : ""}
          ${p.link ? `<a href="https://${p.link}" target="_blank" style="display:inline-block; font-size:0.88rem; color:#1a4a7a; font-weight:600; margin-top:4px;">${p.link} ↗</a>` : ""}
        </div>
      `).addTo(layerRef.current);
    });
  }, [items]);
  return (
    <div className="map-host">
      <div ref={ref} style={{ position: "absolute", inset: 0 }}></div>
    </div>
  );
}

function Buurtatlas({ voice }) {
  const [places, setPlaces] = useStateBa(() => ATLAS_PLACES.map(p => ({ ...p })));
  const [active, setActive] = useStateBa(new Set(ATLAS_CATEGORIES.map((c) => c.id)));
  const you = voice === "u" ? "u" : "je";

  useEffectBa(() => {
    const sb = window._tibSupabase;
    if (!sb) return;
    sb.from('partners').select('naam, adres, lat, lng').eq('actief', true).then(({ data, error }) => {
      if (error || !data) return;
      setPlaces(prev => prev.map(p => {
        const match = data.find(partner => matchPartner(p.name, partner.naam));
        if (!match) return p;
        return {
          ...p,
          cat: 'org',
          addr: match.adres || p.addr,
          lat: match.lat ? parseFloat(match.lat) : p.lat,
          lng: match.lng ? parseFloat(match.lng) : p.lng,
        };
      }));
    });
  }, []);

  const counts = useMemoBa(() => {
    const m = {};
    ATLAS_CATEGORIES.forEach(c => { m[c.id] = 0; });
    places.forEach(p => { if (m[p.cat] !== undefined) m[p.cat]++; });
    return m;
  }, [places]);

  const items = useMemoBa(() => places.filter((p) => active.has(p.cat)), [active, places]);
  function only(id) { setActive(new Set([id])); }
  function toggle(id) {
    setActive((s) => {
      if (s.size === 1 && s.has(id)) return new Set(ATLAS_CATEGORIES.map((c) => c.id));
      return new Set([id]);
    });
  }
  function all() { setActive(new Set(ATLAS_CATEGORIES.map((c) => c.id))); }

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Buurtatlas</span>
          <h1>Alles in de wijk, op één kaart.</h1>
          <p>Van de bakker op de hoek tot het Geriatrisch Netwerk. Klik op een stip voor meer informatie en een directe link naar de website.</p>
        </div>
      </section>

      <section style={{ paddingBottom: 30 }}>
        <div className="tib-container">
          <div className="callout" style={{ marginBottom: 18 }}>
            <strong>💡 Tip:</strong> klik op een stip in de kaart voor adres, telefoon en openingstijden. Gebruik de filters hieronder om alleen bepaalde soorten plekken te zien.
          </div>
          <AtlasMap items={items} />

          <div style={{ marginTop: 24 }}>
            <div className="chip-row">
              <button className={"chip " + (active.size === ATLAS_CATEGORIES.length ? "active" : "")} onClick={all}>
                Alle categorieën · {places.length}
              </button>
              {ATLAS_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={"chip " + (active.size === 1 && active.has(c.id) ? "active" : "")}
                  onClick={() => toggle(c.id)}
                >
                  <span className="swatch" style={{ background: c.color }}></span>
                  {c.label} · {counts[c.id] || 0}
                </button>
              ))}
            </div>
          </div>

          <div className="places-list" style={{ marginTop: 28 }}>
            {items.map((p) => {
              const c = atlasCat(p.cat);
              return (
                <div key={p.id} className="place-item">
                  <span className="pin" style={{ background: c.color }}></span>
                  <div>
                    <h4>{p.name}</h4>
                    <div className="meta">{p.addr}</div>
                    {(p.phone || p.hours) && (
                      <div className="place-extra">
                        {p.phone && <span>☎ <a href={"tel:" + p.phone.replace(/\s/g, "")}>{p.phone}</a></span>}
                        {p.hours && <span>🕓 {p.hours}</span>}
                      </div>
                    )}
                  </div>
                  <span className="badge" style={{ background: "transparent", color: c.color, border: "1px solid currentColor" }}>
                    {c.label}
                  </span>
                  {p.link ? (
                    <a className="btn btn-soft btn-sm" href={`https://${p.link}`} target="_blank" rel="noopener noreferrer">Bezoek site ↗</a>
                  ) : (
                    <span className="muted" style={{ fontSize: "0.9rem" }}>—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Buurtatlas });
