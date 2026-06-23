// screens/detail.jsx — Detail-pagina voor Clubje / Activiteit / Agenda / Nieuws
// Geïnspireerd op thuisindebuurt.org/places/...

const { useEffect: useEffectDt, useRef: useRefDt, useState: useStateDt } = React;

function DetailMap({ lat, lng, label, color }) {
  const ref = useRefDt(null);
  useEffectDt(() => {
    if (!ref.current || !window.L) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "© OpenStreetMap"
    }).addTo(map);
    L.circleMarker([lat, lng], {
      radius: 11, color: "white", weight: 3,
      fillColor: color || "#1a4a7a", fillOpacity: 0.95,
    }).bindTooltip(label || "Hier", { permanent: true, direction: "top", offset: [0, -8] }).addTo(map);
    return () => map.remove();
  }, [lat, lng, label, color]);
  return <div className="map-host shorter"><div ref={ref} style={{ position: "absolute", inset: 0 }}></div></div>;
}

function InfoTable({ rows }) {
  return (
    <table className="info-table">
      <tbody>
        {rows.filter(r => r.v).map((r, i) => (
          <tr key={i}>
            <th>{r.k}</th>
            <td>{r.v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrevNextBar({ siblings, currentId, onNav }) {
  const idx = siblings.findIndex((s) => String(s.id) === String(currentId));
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  return (
    <div className="prev-next">
      {prev ? (
        <button className="pn pn-prev" onClick={() => onNav(prev.id)}>
          <span className="pn-arrow">←</span>
          <span>
            <span className="pn-label">Vorige</span>
            <span className="pn-title">{prev.name || prev.t || prev.title}</span>
          </span>
        </button>
      ) : <span></span>}
      {next ? (
        <button className="pn pn-next" onClick={() => onNav(next.id)}>
          <span>
            <span className="pn-label">Volgende</span>
            <span className="pn-title">{next.name || next.t || next.title}</span>
          </span>
          <span className="pn-arrow">→</span>
        </button>
      ) : <span></span>}
    </div>
  );
}

/* -------- Aanmeldformulier -------- */
function AanmeldFormulier({ item, type }) {
  const [naam, setNaam] = useStateDt('');
  const [email, setEmail] = useStateDt('');
  const [telefoon, setTelefoon] = useStateDt('');
  const [fout, setFout] = useStateDt('');
  const [succes, setSucces] = useStateDt(false);
  const [bezig, setBezig] = useStateDt(false);

  async function verstuur() {
    if (!naam.trim()) { setFout('Vul je naam in.'); return; }
    if (!email.trim() || !email.includes('@')) { setFout('Vul een geldig e-mailadres in.'); return; }
    setFout('');
    setBezig(true);

    const aanmelding = {
      naam: naam.trim(),
      email: email.trim(),
      telefoon: telefoon.trim() || null,
      type,
      status: 'nieuw',
    };
    if (type === 'clubje') aanmelding.clubje_id = item.id;
    if (type === 'activiteit') aanmelding.activiteit_id = item.id;

    const { error } = await window._tibSupabase.from('aanmeldingen').insert([aanmelding]);
    setBezig(false);
    if (error) { setFout('Er ging iets fout. Probeer het opnieuw.'); return; }
    setSucces(true);
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 10,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>Meld je aan</h3>
      {succes ? (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
          ✓ Je aanmelding is ontvangen! We nemen zo snel mogelijk contact met je op.
        </div>
      ) : (
        <>
          <input type="text" placeholder="Jouw naam *" value={naam} onChange={e => setNaam(e.target.value)} style={inputStyle} />
          <input type="email" placeholder="E-mailadres *" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="tel" placeholder="Telefoonnummer (optioneel)" value={telefoon} onChange={e => setTelefoon(e.target.value)} style={inputStyle} />
          {fout && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{fout}</p>}
          <button
            onClick={verstuur}
            disabled={bezig}
            style={{ background: '#2d6a4f', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: bezig ? 'default' : 'pointer', width: '100%', opacity: bezig ? 0.7 : 1 }}
          >
            {bezig ? 'Bezig...' : 'Aanmelden'}
          </button>
        </>
      )}
    </div>
  );
}

/* -------- Detail wrapper -------- */
function Detail({ route, setPage, voice }) {
  const you = voice === "u" ? "u" : "je";
  const { kind, id } = route;
  const [activeTab, setActiveTab] = useStateDt("profiel");

  let item, siblings, parentLabel, parentId, color, catLabel;

  if (kind === "clubje") {
    item = CLUBJES.find((c) => String(c.id) === String(id));
    siblings = CLUBJES;
    parentLabel = "Buurtgroepen"; parentId = "clubjes";
    if (item) { color = catOf(item.cat).color; catLabel = catOf(item.cat).label; }
  } else if (kind === "activiteit") {
    item = ACTIVITIES.find((a) => String(a.id) === String(id));
    siblings = ACTIVITIES;
    parentLabel = "Activiteiten"; parentId = "activiteiten";
    if (item) { color = catOf(item.cat).color; catLabel = item.group; }
  } else if (kind === "agenda") {
    item = AGENDA.find((a) => String(a.id) === String(id));
    siblings = AGENDA;
    parentLabel = "Agenda"; parentId = "agenda";
    color = "#1a4a7a"; if (item) catLabel = item.tag;
  } else if (kind === "nieuws") {
    item = NEWS.find((n) => String(n.id) === String(id));
    siblings = NEWS;
    parentLabel = "Nieuws"; parentId = "nieuws";
    color = "#3f8f7a"; if (item) catLabel = item.tag;
  }

  if (!item) {
    return (
      <main>
        <section className="page-head">
          <div className="tib-container">
            <p><a href="#" onClick={(e) => { e.preventDefault(); setPage(parentId || "home"); }}>← Terug</a></p>
            <h1>Niet gevonden</h1>
            <p>Het gevraagde item bestaat niet (meer).</p>
          </div>
        </section>
      </main>
    );
  }

  const title = item.name || item.t || item.title;
  const hasLocation = item.lat && item.lng;
  const showContactTab = kind === "clubje" && item.contact_zichtbaar === true;

  /* ---------- Build the info rows ---------- */
  let rows;
  let lead;
  if (kind === "clubje" || kind === "activiteit") {
    rows = [
      { k: "Voor wie", v: item.voorWie },
      { k: "Wat", v: item.wat },
      { k: "Waar", v: item.waar },
      { k: "Wanneer", v: item.wanneer },
      { k: "Kosten", v: item.kosten },
    ];
    lead = item.desc;
  } else if (kind === "agenda") {
    rows = [
      { k: "Voor wie", v: item.voorWie },
      { k: "Wat", v: item.wat },
      { k: "Waar", v: item.waar },
      { k: "Wanneer", v: item.wanneer },
      { k: "Kosten", v: item.kosten },
      { k: "Informatie", v: item.email ? <a href={"mailto:" + item.email}>{item.email}</a> : null },
    ];
    lead = item.desc;
  } else if (kind === "nieuws") {
    rows = [
      { k: "Datum", v: item.date },
      { k: "Rubriek", v: item.tag },
    ];
    lead = item.lead;
  }

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <nav aria-label="Kruimelpad" className="crumbs">
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("home"); }}>Home</a>
            <span>›</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setPage(parentId); }}>{parentLabel}</a>
            <span>›</span>
            <span className="current">{title}</span>
          </nav>

          <div className="detail-head">
            <div>
              {catLabel && (
                <span className="badge" style={{ background: color + "22", color: color, border: `1px solid ${color}55` }}>
                  <span className="swatch" style={{ background: color }}></span>
                  {catLabel}
                </span>
              )}
              <h1 style={{ marginTop: 14 }}>{title}</h1>
              {lead && <p style={{ fontSize: "1.15rem", color: "var(--tib-ink-soft)", maxWidth: "60ch" }}>{lead}</p>}
            </div>
            <div className="detail-photo">
              <Placeholder
                id={kind + "-detail-photo-" + item.id}
                label={"Foto: " + title}
                variant={["sociaal", "buiten"].includes(item.cat) ? "green" : ""} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 30 }}>
        <div className="tib-container">
          <div className="detail-tabs">
            <a
              href="#"
              className={activeTab === "profiel" ? "active" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("profiel"); }}
            >Profiel</a>
            {hasLocation && (
              <a
                href="#"
                className={activeTab === "kaart" ? "active" : ""}
                onClick={(e) => { e.preventDefault(); setActiveTab("kaart"); }}
              >Kaart</a>
            )}
            {showContactTab && (
              <a
                href="#"
                className={activeTab === "contact" ? "active" : ""}
                onClick={(e) => { e.preventDefault(); setActiveTab("contact"); }}
              >Contact</a>
            )}
          </div>
        </div>
      </section>

      {activeTab === "profiel" && (
        <section id="profile" style={{ paddingBottom: 60 }}>
          <div className="tib-container detail-grid">
            <div>
              <InfoTable rows={rows} />

              {kind === "nieuws" && (
                <div className="detail-body">
                  <p>{item.body}</p>
                </div>
              )}

              {(kind === "clubje" || kind === "activiteit" || kind === "agenda") && (
                <div className="detail-body">
                  <h2 style={{ fontSize: "1.4rem", marginTop: 18, marginBottom: 12 }}>Over deze {kind === "agenda" ? "activiteit" : kind}</h2>
                  <p>{item.desc || item.wat}</p>
                  {kind === "clubje" && (
                    <p style={{ marginTop: 14 }}>
                      Wil {you} aansluiten? {showContactTab ? "Klik op de tab 'Contact' voor de contactgegevens." : "Neem contact op met de organisator."} Geen verplichtingen — kom een keer kijken
                      en bepaal daarna of het wat voor {you === "u" ? "u" : "jou"} is.
                    </p>
                  )}
                  {(kind === "clubje" || kind === "activiteit") && (
                    <AanmeldFormulier item={item} type={kind} />
                  )}
                </div>
              )}
            </div>

            <aside className="detail-aside">
              {!showContactTab && item.contact && (
                <div className="contact-card">
                  <h3>Contact</h3>
                  <div className="contact-row">
                    <div className="avatar">{(item.contact || "?").split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
                    <div>
                      <strong>{item.contact}</strong>
                      {item.area && <div className="muted" style={{ fontSize: "0.92rem" }}>{item.area}</div>}
                    </div>
                  </div>
                  <div className="contact-actions">
                    {item.email && <a className="btn btn-primary" href={"mailto:" + item.email}>✉ Mail sturen</a>}
                    {item.phone && item.phone !== "—" && <a className="btn btn-soft" href={"tel:" + item.phone.replace(/\s/g, "")}>☎ {item.phone}</a>}
                  </div>
                </div>
              )}

              {kind === "clubje" && (
                <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPage("clubjes")}>
                  ← Alle buurtgroepen
                </button>
              )}
              {kind === "activiteit" && (
                <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPage("activiteiten")}>
                  ← Alle activiteiten
                </button>
              )}
            </aside>
          </div>
        </section>
      )}

      {activeTab === "kaart" && hasLocation && (
        <section style={{ paddingBottom: 60 }}>
          <div className="tib-container">
            <h2 style={{ marginBottom: 16 }}>Locatie</h2>
            <DetailMap lat={item.lat} lng={item.lng} label={title} color={color} />
            <p className="muted" style={{ fontSize: "0.9rem", marginTop: 10 }}>
              {item.waar || item.w || item.area}
            </p>
          </div>
        </section>
      )}

      {activeTab === "contact" && showContactTab && (
        <section style={{ paddingBottom: 60 }}>
          <div className="tib-container" style={{ maxWidth: 560 }}>
            <div className="contact-card">
              <h3>Contactgegevens</h3>
              {item.contact && (
                <div className="contact-row" style={{ marginBottom: 18 }}>
                  <div className="avatar">{(item.contact || "?").split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
                  <div>
                    <strong>{item.contact}</strong>
                    {item.area && <div className="muted" style={{ fontSize: "0.92rem" }}>{item.area}</div>}
                  </div>
                </div>
              )}
              <div className="contact-actions" style={{ flexDirection: "column", gap: 10 }}>
                {item.email && (
                  <a className="btn btn-primary" href={"mailto:" + item.email} style={{ justifyContent: "center" }}>
                    ✉ {item.email}
                  </a>
                )}
                {item.phone && item.phone !== "—" && (
                  <a className="btn btn-soft" href={"tel:" + item.phone.replace(/\s/g, "")} style={{ justifyContent: "center" }}>
                    ☎ {item.phone}
                  </a>
                )}
              </div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 18 }} onClick={() => setPage("clubjes")}>
              ← Alle buurtgroepen
            </button>
          </div>
        </section>
      )}

      <section style={{ paddingBottom: 60 }}>
        <div className="tib-container">
          <PrevNextBar
            siblings={siblings}
            currentId={item.id}
            onNav={(newId) => setPage({ kind, id: newId })}
          />
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Detail });
