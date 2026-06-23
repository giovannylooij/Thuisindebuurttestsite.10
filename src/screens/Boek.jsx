// screens/boek.jsx — Bestelpagina voor het boek "Leven is spelen"
const { useState: useStateBk } = React;

function Boek({ voice, setPage, showToast }) {
  const you = voice === "u" ? "u" : "je";
  const You = voice === "u" ? "U" : "Je";
  const yourw = voice === "u" ? "uw" : "jouw";

  const PRICE = 20.00;
  const [qty, setQty] = useStateBk(1);
  const [pay, setPay] = useStateBk("ideal");
  const [form, setForm] = useStateBk({ voornaam: "", achternaam: "", straat: "", postcode: "", plaats: "", telefoon: "", email: "" });
  const [submitted, setSubmitted] = useStateBk(false);

  function setF(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  const totaal = (PRICE * qty).toFixed(2);

  function submit(e) {
    e.preventDefault();
    setSubmitted(true);
    showToast && showToast(`Bestelling ontvangen: ${qty}× "Leven is spelen" voor € ${totaal} via ${pay === "ideal" ? "iDEAL" : "Overboeking"}.`);
  }

  return (
    <main>
      <section className="page-head">
        <div className="tib-container">
          <nav aria-label="Kruimelpad" className="crumbs">
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("home"); }}>Home</a>
            <span>›</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("doneren"); }}>Doneren</a>
            <span>›</span>
            <span className="current">Leven is spelen</span>
          </nav>
          <span className="eyebrow">Boek · Margreet Jonkers</span>
          <h1>Bestel nu het boek "Leven is spelen".</h1>
          <p style={{ fontSize: "1.18rem", maxWidth: "60ch" }}>
            Het inspirerende en informatieve boek van Margreet Jonkers (77).
            Met {yourw} bestelling steun {you} ook Thuis in de Buurt.
          </p>
        </div>
      </section>

      {/* Intro met cover */}
      <section style={{ paddingBottom: 30 }}>
        <div className="tib-container">
          <div className="boek-intro">
            <div className="boek-cover-wrap">
              <Placeholder id="boek-detail-cover" label="Boekomslag Leven is spelen" radius={10} style={{ aspectRatio: "2 / 3", height: "auto" }} />
              <div className="boek-pricetag">€ 20,00<span>incl. verzending</span></div>
            </div>
            <div className="boek-copy">
              <p className="boek-lead">
                Margreet Jonkers kreeg als baby polio en raakte grotendeels verlamd.
                Dankzij haar positieve inslag en onvermoeibare discipline kreeg ze haar
                leven goed op de rails.
              </p>
              <p>
                Op haar oude dag verbaast ze zich erover hoe goed ze het heeft gered als
                zwaar gehandicapt persoon. <em>"Elke dag feest"</em>, zegt ze in het voorwoord
                van haar boek <em>Leven is spelen</em>, dat ze schreef over het ambacht van
                invalide zijn.
              </p>
              <p>
                Margreet was nog geen jaar oud toen ze werd besmet met polio. Door het virus
                raakte ze verlamd aan armen en benen. Maar bij de pakken neer zitten is niets
                voor haar. Het leven is élke dag een feest voor deze moedige vrouw, die ervoor
                zorgt dat ze er elke dag op haar best uitziet. Mét op haar lippen altijd een
                rood lippenstiftje — haar stiekeme verslaving.
              </p>
              <blockquote className="boek-pull">
                "Elke dag feest"
                <cite>— Margreet Jonkers, voorwoord</cite>
              </blockquote>
              <a
                href="https://www.ad.nl/den-haag/margreet-77-kan-door-polio-amper-bewegen-maar-geniet-van-elke-dag-altijd-lippenstiftje-op~a49cacc4/"
                target="_blank"
                rel="noopener noreferrer"
                className="boek-article-link"
              >
                <strong>Lees het interview in het AD ↗</strong>
                <span>"Margreet (77) kan door polio amper bewegen, maar geniet van elke dag" — www.ad.nl</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bestelformulier */}
      <section className="section section-band">
        <div className="tib-container">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "start" }} className="boek-order-grid">
            <div className="form-card">
              <h2 style={{ marginBottom: 8 }}>Bestelformulier</h2>
              <p className="muted" style={{ marginBottom: 22 }}>
                Het boek wordt {you} toegestuurd na inzending van onderstaand formulier.
                Betaling via Mollie (iDEAL of overboeking).
              </p>

              {submitted ? (
                <div className="callout">
                  <strong>Bedankt voor {yourw} bestelling!</strong><br />
                  We ontvangen de betaling van € {totaal} via {pay === "ideal" ? "iDEAL" : "overboeking"} en sturen het boek binnen 5 werkdagen toe.
                </div>
              ) : (
                <form className="form-grid" onSubmit={submit}>
                  <div className="field">
                    <label>Voornaam *</label>
                    <input value={form.voornaam} onChange={(e) => setF("voornaam", e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Achternaam *</label>
                    <input value={form.achternaam} onChange={(e) => setF("achternaam", e.target.value)} required />
                  </div>
                  <div className="field full">
                    <label>Straatnaam en huisnummer *</label>
                    <input value={form.straat} onChange={(e) => setF("straat", e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Postcode *</label>
                    <input value={form.postcode} onChange={(e) => setF("postcode", e.target.value.toUpperCase())} placeholder="1234 AB" required />
                  </div>
                  <div className="field">
                    <label>Plaatsnaam *</label>
                    <input value={form.plaats} onChange={(e) => setF("plaats", e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Telefoon</label>
                    <input type="tel" value={form.telefoon} onChange={(e) => setF("telefoon", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>E-mail *</label>
                    <input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} required />
                  </div>

                  {/* Product + qty + totaal */}
                  <div className="field full">
                    <label>Bestelling</label>
                    <div className="order-row">
                      <div>
                        <strong>Leven is spelen</strong>
                        <div className="muted" style={{ fontSize: "0.9rem" }}>Boek van Margreet Jonkers · € {PRICE.toFixed(2)}</div>
                      </div>
                      <div className="qty-stepper">
                        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Minder">−</button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Meer">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="field full" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "var(--tib-blue-soft)", borderRadius: 12 }}>
                    <strong style={{ fontSize: "1.1rem" }}>Totaal (incl. verzending)</strong>
                    <strong style={{ fontSize: "1.4rem", color: "var(--tib-blue-deep)", fontFamily: "var(--font-display)" }}>€ {totaal}</strong>
                  </div>

                  <div className="field full">
                    <label>Betaalmethode *</label>
                    <div className="pay-options">
                      <label className={"pay-opt " + (pay === "ideal" ? "selected" : "")}>
                        <input type="radio" name="pay" checked={pay === "ideal"} onChange={() => setPay("ideal")} />
                        <span className="pay-logo pay-ideal">iDEAL</span>
                        <span className="pay-text">iDEAL · Wero</span>
                      </label>
                      <label className={"pay-opt " + (pay === "bank" ? "selected" : "")}>
                        <input type="radio" name="pay" checked={pay === "bank"} onChange={() => setPay("bank")} />
                        <span className="pay-logo pay-bank">€</span>
                        <span className="pay-text">Overboeking</span>
                      </label>
                    </div>
                  </div>

                  <div className="field full">
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                      Bestelling plaatsen · € {totaal}
                    </button>
                    <p className="muted" style={{ fontSize: "0.82rem", marginTop: 12, textAlign: "center", margin: "12px 0 0" }}>
                      Betaling naar Thuis in de Buurt via Stichting Mollie Payments.
                    </p>
                  </div>
                </form>
              )}
            </div>

            <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid var(--tib-line)" }}>
                <h3 style={{ marginBottom: 10 }}>Waarom dit boek?</h3>
                <p className="muted" style={{ margin: 0, fontSize: "0.98rem" }}>
                  Een persoonlijk verhaal én een handleiding voor wie te maken heeft met fysieke beperkingen.
                  Voor mantelzorgers, familie, vrijwilligers en iedereen die geïnteresseerd is in een positieve kijk op het leven.
                </p>
              </div>
              <div style={{ background: "var(--tib-green-soft)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ marginBottom: 10 }}>Liever direct doneren?</h3>
                <p style={{ margin: "0 0 12px", color: "var(--tib-ink-soft)" }}>
                  Geen zin in het boek? Geen probleem — een directe donatie steunt TIB net zo goed.
                </p>
                <button className="btn btn-secondary" onClick={() => setPage("doneren")}>Naar doneren →</button>
              </div>
              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid var(--tib-line)" }}>
                <h3 style={{ marginBottom: 10 }}>Specificaties</h3>
                <dl className="boek-spec">
                  <dt>Auteur</dt><dd>Margreet Jonkers</dd>
                  <dt>Prijs</dt><dd>€ 20,00 incl. verzending</dd>
                  <dt>Verzending</dt><dd>Binnen Nederland · 5 werkdagen</dd>
                  <dt>Uitgever</dt><dd>Eigen beheer · Den Haag</dd>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Boek });
