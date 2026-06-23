// app.jsx — mounts the App, manages page state and Tweaks

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#1a4a7a",
  "accentColor": "#3f8f7a",
  "bgColor": "#faf3e6",
  "headingFont": "Lora",
  "bodyFont": "Source Sans 3",
  "density": "comfortable",
  "voice": "je",
  "logoStyle": "wordmark",
  "showHero": true,
  "showIntro": true,
  "showClubjes": true,
  "showAgenda": true,
  "showActiviteiten": true,
  "showPartners": true,
  "showDonate": true,
  "showFooter": true
}/*EDITMODE-END*/;

const HEADING_FONTS = ["Lora", "Playfair Display", "Georgia"];
const BODY_FONTS = ["Source Sans 3", "Nunito", "DM Sans"];

function applyTokens(t) {
  const r = document.documentElement.style;
  // Derive deep/soft variants from primary
  r.setProperty("--tib-blue", t.primaryColor);
  r.setProperty("--tib-blue-deep", shade(t.primaryColor, -0.22));
  r.setProperty("--tib-blue-soft", tint(t.primaryColor, 0.88));
  r.setProperty("--tib-green", t.accentColor);
  r.setProperty("--tib-green-soft", tint(t.accentColor, 0.85));
  r.setProperty("--tib-cream", t.bgColor);
  r.setProperty("--tib-cream-deep", shade(t.bgColor, -0.04));
  r.setProperty("--tib-line", shade(t.bgColor, -0.10));
  r.setProperty("--font-display", `'${t.headingFont}', Georgia, serif`);
  r.setProperty("--font-body", `'${t.bodyFont}', system-ui, sans-serif`);
  document.body.setAttribute("data-density", t.density);
}

/* Tiny color helpers */
function hexToRgb(h) {
  const m = h.replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}
function shade(hex, amount) { // amount -1..1; negative darker
  const [r, g, b] = hexToRgb(hex);
  const f = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  return rgbToHex([r + (f - r) * t, g + (f - g) * t, b + (f - b) * t]);
}
function tint(hex, amount) { return shade(hex, amount); }

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = useStateA("home");
  const [toast, setToast] = useStateA(null);

  useEffectA(() => { applyTokens(t); }, [t]);

  // De image-slot component zet `data-editable` als er een writeFile-host is
  // (preview-omgeving). Voor bezoekers van de demo willen we de Replace/Remove
  // knoppen niet zien — uploaden via klikken of slepen blijft werken. We
  // strippen die attribuut continu zodat shadow-DOM CSS hem niet meer toont.
  useEffectA(() => {
    function strip() {
      document.querySelectorAll("image-slot[data-editable]").forEach((s) => s.removeAttribute("data-editable"));
    }
    strip();
    const mo = new MutationObserver(strip);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-editable"] });
    return () => mo.disconnect();
  }, []);

  // scroll to top on page change
  useEffectA(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [page]);

  // toast auto-dismiss
  useEffectA(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const hideSection = (key) => setTweak(key, false);
  const showSection = (key) => setTweak(key, true);
  const screenProps = { setPage, voice: t.voice, showToast: setToast, tweaks: t, hideSection, showSection };

  // page may be a string or an object { kind, id } for detail pages
  const isDetail = page && typeof page === "object" && page.kind;

  return (
    <div className="tib-shell">
      <TopBar page={page} setPage={setPage} />

      {isDetail && <Detail route={page} {...screenProps} />}
      {!isDetail && page === "home" && <Home {...screenProps} />}
      {!isDetail && page === "clubjes" && <Clubjes {...screenProps} />}
      {!isDetail && page === "buurtatlas" && <Buurtatlas {...screenProps} />}
      {!isDetail && page === "agenda" && <Agenda {...screenProps} />}
      {!isDetail && page === "activiteiten" && <Activiteiten {...screenProps} />}
      {!isDetail && page === "partners" && <Partners {...screenProps} />}
      {!isDetail && page === "netwerken" && <Netwerken {...screenProps} />}
      {!isDetail && page === "nieuws" && <Nieuws {...screenProps} />}
      {!isDetail && page === "doemee" && <DoeMee {...screenProps} />}
      {!isDetail && page === "doneren" && <Doneren {...screenProps} />}
      {!isDetail && page === "boek" && <Boek {...screenProps} />}
      {!isDetail && page === "contact" && <Contact {...screenProps} />}

      {t.showFooter && <Footer setPage={setPage} showToast={setToast} />}

      {toast && <div className="toast" role="status">{toast}</div>}

      <TweaksPanel title="Tweaks · Thuis in de Buurt">
        <TweakSection label="Wat moet er op de homepage staan?" />
        <TweakToggle label="Hero (welkomstblok)" value={t.showHero} onChange={(v) => setTweak("showHero", v)} />
        <TweakToggle label="Intro 'Wat is TIB?'" value={t.showIntro} onChange={(v) => setTweak("showIntro", v)} />
        <TweakToggle label="Uitgelichte clubjes + kaart" value={t.showClubjes} onChange={(v) => setTweak("showClubjes", v)} />
        <TweakToggle label="Agenda-strip" value={t.showAgenda} onChange={(v) => setTweak("showAgenda", v)} />
        <TweakToggle label="Activiteiten-strip" value={t.showActiviteiten} onChange={(v) => setTweak("showActiviteiten", v)} />
        <TweakToggle label="Partners-strip" value={t.showPartners} onChange={(v) => setTweak("showPartners", v)} />
        <TweakToggle label="Doneer-blok" value={t.showDonate} onChange={(v) => setTweak("showDonate", v)} />
        <TweakToggle label="Footer onderaan" value={t.showFooter} onChange={(v) => setTweak("showFooter", v)} />
        <TweakSection label="Kleurenpalet" />
        <TweakColor
          label="Primair (blauw)"
          value={t.primaryColor}
          options={["#1a4a7a", "#15568a", "#2d6aa0", "#1f3e6b", "#264b5f"]}
          onChange={(v) => setTweak("primaryColor", v)}
        />
        <TweakColor
          label="Accent (groen)"
          value={t.accentColor}
          options={["#3f8f7a", "#4f9b7c", "#5fa672", "#377063", "#6cab46"]}
          onChange={(v) => setTweak("accentColor", v)}
        />
        <TweakColor
          label="Achtergrond"
          value={t.bgColor}
          options={["#faf3e6", "#f7f1e3", "#fbf7ee", "#f4ede0", "#f3f1eb", "#ffffff"]}
          onChange={(v) => setTweak("bgColor", v)}
        />

        <TweakSection label="Typografie" />
        <TweakSelect
          label="Koppen"
          value={t.headingFont}
          options={HEADING_FONTS}
          onChange={(v) => setTweak("headingFont", v)}
        />
        <TweakSelect
          label="Broodtekst"
          value={t.bodyFont}
          options={BODY_FONTS}
          onChange={(v) => setTweak("bodyFont", v)}
        />
        <TweakRadio
          label="Dichtheid"
          value={t.density}
          options={["cosy", "comfortable", "ruim"]}
          onChange={(v) => setTweak("density", v)}
        />

        <TweakSection label="Aanspreking" />
        <TweakRadio
          label="Tone of voice"
          value={t.voice}
          options={["je", "u"]}
          onChange={(v) => setTweak("voice", v)}
        />

        <TweakSection label="Pagina" />
        <TweakButton onClick={() => {
          let n = 0;
          try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i);
              if (k && k.startsWith("tib-hide-photo-")) { localStorage.removeItem(k); n++; }
            }
          } catch (e) {}
          setToast(n === 0 ? "Geen verborgen foto-plekken." : `${n} foto-plek${n === 1 ? "" : "ken"} teruggezet — herlaad de pagina om ze te zien.`);
        }}>Toon verborgen foto-plekken</TweakButton>
        <TweakSelect
          label="Spring naar"
          value={page}
          options={["home", "clubjes", "activiteiten", "agenda", "buurtatlas", "partners", "netwerken", "nieuws", "doemee", "doneren", "boek", "contact"]}
          onChange={(v) => setPage(v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
