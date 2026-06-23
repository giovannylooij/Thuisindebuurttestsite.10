// screens/contact.jsx — Contactpagina
const { useState: useStateCt } = React;

function Contact({ voice, setPage, showToast }) {
  const you = voice === "u" ? "u" : "je";
  const You = voice === "u" ? "U" : "Je";
  const yourw = voice === "u" ? "uw" : "jouw";

  const [form, setForm] = useStateCt({ naam: "", email: "", onderwerp: "", bericht: "" });
  const [sent, setSent] = useStateCt(false);
  function setF(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  function submit(e) {
    e.preventDefault();
    setSent(true);
    showToast && showToast("Bedankt voor " + yourw + " bericht — we reageren binnen 3 werkdagen.");
  }

  const _defaultContacts = [
    { role: "Algemene informatie", desc: "Voor alle vragen over Thuis in de Buurt — meedoen, een clubje starten, samenwerken.", email: "info@thuisindebuurt.org", icon: "✉" },
    { role: "Webredactie", desc: "Voor vragen over de site, tekst- of fotosuggesties, of een nieuw clubje aanmelden.", email: "webredactie@thuisindebuurt.org", icon: "✎" },
    { role: "Doneren & boek", desc: "Vragen over donaties of het boek 'Leven is spelen' van Margreet Jonkers.", email: "doneren@thuisindebuurt.org", icon: "♥" },
  ];
  const contacts = (window.CONTACT_DATA && Array.isArray(window.CONTACT_DATA.cards) && window.CONTACT_DATA.cards.length > 0)
    ? window.CONTACT_DATA.cards
    : _defaultContacts;

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <span className="eyebrow">Contact</span>
          <h1>{(window.CONTACT_DATA && window.CONTACT_DATA.titel) || "Neem contact op."}</h1>
          <p style={{ fontSize: "1.15rem", maxWidth: "60ch" }}>
            {(window.CONTACT_DATA && window.CONTACT_DATA.intro)
              ? window.CONTACT_DATA.intro
              : <>Heb {you} een vraag, suggestie of zin om iets bij te dragen? Stuur {you === "u" ? "ons" : "ons"} een bericht — we reageren binnen drie werkdagen.</>}
          </p>
        </div>
      </section>

      {/* Contact cards per onderwerp */}
      <section style={{ paddingBottom: 30 }}>
        <div className="tib-container">
          <div className="contact-cards">
            {contacts.filter(function(c){return c.visible!==false;}).map((c, i) => (
              <article key={i} className="contact-tile">
                <span className="contact-tile-icon" aria-hidden="true">{c.icon}</span>
                <h3>{c.role}</h3>
                <p>{c.desc}</p>
                <a href={"mailto:" + c.email} className="contact-mail-link">{c.email}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Hoofdblok: form + side info */}
      <section className="section section-band">
        <div className="tib-container">
          <div className="contact-main">
            <div className="form-card">
              <h2 style={{ marginBottom: 8 }}>Stuur ons een bericht</h2>
              <p className="muted" style={{ marginBottom: 22 }}>
                Vul het formulier in en kies een onderwerp — we zorgen dat {yourw} bericht bij de juiste persoon terechtkomt.
              </p>

              {sent ? (
                <div className="callout">
                  <strong>Bedankt voor {yourw} bericht!</strong><br />
                  We hebben het ontvangen en reageren binnen 3 werkdagen via <strong>{form.email}</strong>.
                </div>
              ) : (
                <form className="form-grid" onSubmit={submit}>
                  <div className="field">
                    <label>Naam *</label>
                    <input value={form.naam} onChange={(e) => setF("naam", e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>E-mailadres *</label>
                    <input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} required />
                  </div>
                  <div className="field full">
                    <label>Onderwerp *</label>
                    <select value={form.onderwerp} onChange={(e) => setF("onderwerp", e.target.value)} required>
                      <option value="" disabled>Kies een onderwerp</option>
                      <option value="info">Algemene informatie</option>
                      <option value="clubje">Een clubje aanmelden</option>
                      <option value="activiteit">Een activiteit aanmelden</option>
                      <option value="vrijwilliger">Vrijwilliger worden / TIBber</option>
                      <option value="partner">Voor partners en netwerken</option>
                      <option value="website">Tip voor de webredactie</option>
                      <option value="boek">Het boek "Leven is spelen"</option>
                      <option value="anders">Anders</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label>Bericht *</label>
                    <textarea
                      value={form.bericht}
                      onChange={(e) => setF("bericht", e.target.value)}
                      placeholder="Vertel hier wat je kwijt wil — vraag, suggestie of idee."
                      rows={6}
                      required
                    ></textarea>
                  </div>
                  <div className="field full" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span className="muted" style={{ fontSize: "0.88rem" }}>
                      Gemarkeerd met * zijn verplichte velden.
                    </span>
                    <button type="submit" className="btn btn-primary">Bericht versturen →</button>
                  </div>
                </form>
              )}
            </div>

            <aside className="contact-aside">
              <div className="contact-info-card">
                <h3 style={{ marginBottom: 14 }}>Snelle antwoorden</h3>
                <details>
                  <summary>Hoe meld ik een clubje aan?</summary>
                  <p>Ga naar de pagina <a href="#" onClick={(e) => { e.preventDefault(); setPage("clubjes"); }}>Clubjes</a> en klik op "Meld je clubje aan", of stuur een mail naar webredactie@thuisindebuurt.org.</p>
                </details>
                <details>
                  <summary>Hoe word ik TIBber?</summary>
                  <p>Vul het formulier op de pagina <a href="#" onClick={(e) => { e.preventDefault(); setPage("doemee"); }}>Doe mee</a> in — we nemen binnen 3 werkdagen contact op voor een kennismakingsgesprek.</p>
                </details>
                <details>
                  <summary>Hoe doneer ik?</summary>
                  <p>Op de <a href="#" onClick={(e) => { e.preventDefault(); setPage("doneren"); }}>Doneren</a>-pagina kun {you} via Donorbox een eenmalige of maandelijkse bijdrage doen. Of bestel het <a href="#" onClick={(e) => { e.preventDefault(); setPage("boek"); }}>boek</a> — de opbrengst gaat volledig naar TIB.</p>
                </details>
                <details>
                  <summary>Komen jullie ook bij mensen thuis langs?</summary>
                  <p>Liever zien we {you} in een buurtcafé of bij Ichthus voor een kopje koffie, maar voor een eerste kennismaking komen we zeker langs als dat beter uitkomt.</p>
                </details>
              </div>

              <div className="contact-where">
                <h3>Waar vind je ons?</h3>
                <p style={{ marginBottom: 14, color: "var(--tib-ink-soft)" }}>
                  We hebben geen eigen pand — onze activiteiten vinden plaats bij onze partners. Kom langs bij:
                </p>
                <ul className="contact-loc-list">
                  <li>
                    <strong>Bibliotheek Scheveningen</strong>
                    <span>Koffieochtend 50+ · iedere donderdag 10:00</span>
                  </li>
                  <li>
                    <strong>Stichting Ichthus</strong>
                    <span>Koffie &amp; Soep · iedere dinsdag 11:00</span>
                  </li>
                </ul>
                <button className="btn btn-soft" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} onClick={() => setPage("buurtatlas")}>
                  Bekijk de Buurtatlas →
                </button>
              </div>

              <div className="contact-social">
                <h3>Volg ons</h3>
                <div className="social-row">
                  <a href="https://facebook.com/thuisindebuurt" target="_blank" rel="noopener noreferrer" className="social-pill">
                    <span className="social-icon">f</span>
                    <span>Facebook</span>
                  </a>
                  <a href="https://bnsscheveningen.nl" target="_blank" rel="noopener noreferrer" className="social-pill">
                    <span className="social-icon">B</span>
                    <span>BNS-website</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer-CTA */}
      <section className="section">
        <div className="tib-container">
          <div className="contact-cta">
            <div>
              <h2 style={{ marginBottom: 10 }}>Liever meteen meedoen?</h2>
              <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: "44ch", marginBottom: 0 }}>
                Geen zin om een mail te wachten? Schrijf {you} direct in als TIBber, dan plannen we een kennismakingsgesprek.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={() => setPage("doemee")}>Word TIBber →</button>
              <button className="btn btn-ghost btn-lg" onClick={() => setPage("clubjes")}>Bekijk de clubjes</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Contact });
