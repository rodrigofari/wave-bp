const { useState, useMemo, useEffect, useCallback } = React;
const F = CitywaveFinance,
  H = CitywaveHospitality,
  V = CitywaveVAT,
  S = CitywaveScenarios;
const euro = (n, lang = "pt") =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(lang === "en" ? "en-GB" : "pt-PT", {
        maximumFractionDigits: 0,
      }).format(n) + " €"
    : "—";
const euro2 = (n, lang = "pt") =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(lang === "en" ? "en-GB" : "pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n) + " €"
    : "—";
const decimal = (n, d = 1, lang = "pt") =>
  Number.isFinite(n)
    ? new Intl.NumberFormat(lang === "en" ? "en-GB" : "pt-PT", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }).format(n)
    : "—";
const percentage = (n) =>
  Number.isFinite(n) ? decimal(n * 100, 1) + "%" : "—";
const signedClass = (n) => (n < 0 ? "negative" : n > 0 ? "positive" : "");
const sum = (a) => a.reduce((total, n) => total + n, 0);
const monthLabel = (index, lang) =>
  lang === "en"
    ? [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][index]
    : F.MONTHS[index];
function detailLabel(label, lang) {
  if (lang !== "en") return label;
  const words = {
    "Sessoes publicas": "Public sessions",
    "Surf Clinic (suplemento)": "Additional coaching",
    "Onda Privada": "Private wave",
    "Aluguer Equip.": "Equipment rental",
    "Eventos sem uso da onda": "Events without wave use",
    "Community Cards sem sessoes": "Community cards without sessions",
    Energia: "Energy",
    Pessoal: "Staff",
    Manutencao: "Maintenance",
    Agua: "Water",
    Seguro: "Insurance",
    Concessao: "Concession fee",
    Gestao: "Management",
    Outros: "Other",
    "Potencia e consumos auxiliares": "Capacity and auxiliary energy",
    "Comissoes de venda": "Sales commissions",
    "Material por utilizacao": "Equipment per visit",
    Instalacao: "Installation",
    Shipping: "Shipping",
    "Preparacao local": "Site preparation",
    Canalizacao: "Plumbing",
    Eletrica: "Electrical works",
    "Licencas e projeto": "Permits and design",
    "IVA não dedutível do investimento": "Non-recoverable investment VAT",
  };
  return words[label] || label.replace(/^Contingencia /, "Contingency ");
}
function warningLabel(label, lang) {
  if (lang !== "en") return label;
  if (label.startsWith("O cenario exige reforcos de capital"))
    return "This case requires additional equity; capital calls enter shareholder IRR and equity multiple.";
  if (label.startsWith("Mix de clientes soma"))
    return label
      .replace("Mix de clientes soma", "Customer mix totals")
      .replace("pesos normalizados para 100%", "weights normalized to 100%");
  if (label.startsWith("Mix de clientes vazio"))
    return "Customer mix is empty; enter at least one segment. Return metrics are unavailable.";
  if (label.startsWith("Procura de pico"))
    return label
      .replace("Procura de pico", "Peak demand")
      .replace("sessoes/dia", "sessions/day")
      .replace("excede a capacidade", "exceeds capacity")
      .replace(
        "Vendas limitadas a capacidade em cada mes",
        "Sales are capped at monthly capacity",
      );
  if (label.startsWith("A onda selecionada"))
    return "The selected wave exceeds the space allowed at this site.";
  if (label.startsWith("Financiamento"))
    return label
      .replace("Financiamento", "Funding")
      .replace("capital proprio", "equity")
      .replace(
        "ajuste para 100% com capital proprio positivo. Retornos indisponiveis",
        "set total funding to 100% with positive equity. Returns are unavailable",
      );
  if (label.startsWith("Os lugares para trabalhar"))
    return "Work-friendly seats are part of total bar seats; the calculation caps them at total capacity.";
  if (label.startsWith("A procura excede as horas-lugar"))
    return "Demand exceeds available seat-hours or visitors cannot complete their stay before closing. Only served visits earn revenue.";
  if (label.startsWith("Custos variaveis iguais"))
    return "Variable costs equal or exceed revenue; there is no operating break-even at these prices and margins.";
  return detailLabel(label, lang);
}
function Field({
  label,
  value,
  onChange,
  unit = "",
  min = 0,
  max = 100000000,
  step = 1,
  help,
}) {
  const [draft, setDraft] = useState(String(value)),
    [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  const parsed = (raw) => Number(raw.replace(",", "."));
  const commit = () => {
    const n = parsed(draft);
    const next =
      draft.trim() !== "" && Number.isFinite(n)
        ? Math.min(max, Math.max(min, n))
        : value;
    onChange(next);
    setDraft(String(next));
    setEditing(false);
  };
  return (
    <div className="field">
      <label title={help || label}>
        {label}
        {help && <small>{help}</small>}
      </label>
      <div className="input-wrap">
        <input
          aria-label={label}
          type="text"
          inputMode="decimal"
          value={draft}
          onFocus={() => setEditing(true)}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            const n = parsed(raw);
            if (raw.trim() !== "" && Number.isFinite(n) && n >= min && n <= max)
              onChange(n);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setDraft(String(value));
              e.currentTarget.blur();
            }
          }}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  );
}
function Fold({ title, children, open = false }) {
  const hints = {
    0: [
      "Defina a localização, o prazo da concessão e os dias de abertura.",
      "Set the site, concession term and opening days.",
    ],
    1: [
      "A duração e o horário limitam as sessões vendáveis; a sazonalidade reduz a procura média.",
      "Duration and opening hours cap saleable sessions; seasonality reduces average demand.",
    ],
    2: [
      "Introduza preços e mix por nível. Marcar IVA incluído transforma cada preço no valor final pago pelo cliente.",
      "Enter price and mix by level. VAT included treats each entered price as the final amount paid by the customer.",
    ],
    3: [
      "Na concessão, só renda e custos do proprietário entram na Lda. Na operação própria entram vendas e custos do bar.",
      "In concession mode, only rent and owner costs enter the company. In direct operation, bar sales and costs enter.",
    ],
    4: [
      "Energia é potência × carga média × horas × dias × tarifa, mesmo com sessões vazias.",
      "Energy is power × average load × hours × days × tariff, including empty sessions.",
    ],
    5: [
      "Inclui a compra da máquina, obras e receitas opcionais. Privadas substituem sessões públicas.",
      "Includes the machine, works and optional sales. Private bookings replace public sessions.",
    ],
    6: [
      "Dívida, capital próprio, crescimento e valor residual alimentam os fluxos, VAL e TIR.",
      "Debt, equity, growth and exit value feed cash flows, NPV and IRR.",
    ],
    7: [
      "A dedução reduz custos; o reembolso muda o calendário da caixa. Confirme o tratamento com contratos e faturas.",
      "Recovery reduces costs; refunds change cash timing. Confirm treatment against contracts and invoices.",
    ],
  };
  const number = Number(title.match(/^\d+/)?.[0]),
    en = /Site|Sessions|prices|Bar &|Energy|Investment|Funding|VAT/.test(title);
  const help = hints[number]?.[en ? 1 : 0] || title;
  return (
    <details className="fold" open={open}>
      <summary>
        {title}
        <span
          className="fold-help"
          role="img"
          aria-label={help}
          title={help}
          onClick={(e) => e.stopPropagation()}
        >
          i
        </span>
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}
function Metric({ label, value, note, negative = false }) {
  return (
    <div className="metric">
      <div className="eyebrow">{label}</div>
      <div className={`value mono ${negative ? "negative" : ""}`}>{value}</div>
      <small>{note}</small>
    </div>
  );
}
function ValueBar({ label, value, max, lang = "pt" }) {
  return (
    <div className="bar-row">
      <div className="bar-row-top">
        <span>{detailLabel(label, lang)}</span>
        <strong className="mono">{euro(value, lang)}</strong>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: `${Math.max(0, Math.min(100, max ? (value / max) * 100 : 0))}%`,
          }}
        />
      </div>
    </div>
  );
}
function MonthlyChart({ data, lang }) {
  const mx = Math.max(1, ...data.map((m) => m.rev), ...data.map((m) => m.opex));
  return (
    <div className="chart">
      <h2 className="section-title">
        {lang === "en"
          ? "Revenue and costs by month"
          : "Receita e custos por mês"}
      </h2>
      <div className="monthly-chart">
        {data.map((m, i) => (
          <div className="month-group" key={i}>
            <div className="month-bars">
              <div
                className="month-bar"
                title={`${monthLabel(i, lang)} · ${lang === "en" ? "Revenue" : "Receita"} ${euro(m.rev, lang)}`}
                style={{ height: `${(m.rev / mx) * 125}px` }}
              />
              <div
                className="month-bar cost"
                title={`${monthLabel(i, lang)} · ${lang === "en" ? "Costs" : "Custos"} ${euro(m.opex, lang)}`}
                style={{ height: `${(m.opex / mx) * 125}px` }}
              />
            </div>
            <div className="month-label">{monthLabel(i, lang)}</div>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-swatch" />
          {lang === "en" ? "Revenue" : "Receita"}
        </span>
        <span>
          <i className="legend-swatch cost" />
          {lang === "en" ? "Costs" : "Custos"}
        </span>
      </div>
    </div>
  );
}
function BreakChart({ title, points, keyName, current, lang }) {
  const values = points.map((p) => p[keyName]);
  const min = Math.min(0, ...values),
    max = Math.max(0, ...values),
    span = Math.max(1, max - min),
    width = 360,
    height = 150;
  const x = (i) => 28 + (i * (width - 38)) / Math.max(1, points.length - 1),
    y = (v) => 9 + ((max - v) / span) * (height - 30);
  const path = points
    .map(
      (p, i) =>
        (i ? "L" : "M") + x(i).toFixed(1) + "," + y(p[keyName]).toFixed(1),
    )
    .join(" ");
  let threshold = null;
  for (let i = 1; i < points.length; i++)
    if (points[i - 1][keyName] < 0 && points[i][keyName] >= 0) {
      const a = points[i - 1],
        b = points[i];
      threshold =
        a.volume +
        ((b.volume - a.volume) * -a[keyName]) / (b[keyName] - a[keyName]);
      break;
    }
  if (points[0]?.[keyName] >= 0) threshold = 0;
  const nearest = points.reduce(
    (best, p, i) =>
      !best ||
      Math.abs(p.input - current) < Math.abs(best.point.input - current)
        ? { point: p, index: i }
        : best,
    null,
  );
  return (
    <div className="mini-chart">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line
          x1="28"
          x2={width - 10}
          y1={y(0)}
          y2={y(0)}
          stroke="#8b96a2"
          strokeDasharray="4 4"
        />
        <path d={path} fill="none" stroke="#4f91c2" strokeWidth="2.5" />
        {nearest && (
          <circle
            cx={x(nearest.index)}
            cy={y(nearest.point[keyName])}
            r="4"
            fill="#db9242"
          />
        )}
        <text x="4" y={y(0) - 3} fill="#8b96a2" fontSize="9">
          0
        </text>
        <text x="28" y="146" fill="#8b96a2" fontSize="9">
          0
        </text>
        <text
          x={width - 18}
          y="146"
          textAnchor="end"
          fill="#8b96a2"
          fontSize="9"
        >
          {decimal(points.at(-1)?.volume || 0, 0, lang)}
        </text>
      </svg>
      <p>
        {lang === "en" ? "Current" : "Atual"}:{" "}
        <strong className={signedClass(nearest?.point[keyName])}>
          {euro(nearest?.point[keyName], lang)}
        </strong>{" "}
        · {lang === "en" ? "Zero at" : "Zero em"}:{" "}
        <strong>
          {threshold === null
            ? lang === "en"
              ? "beyond capacity"
              : "fora da capacidade"
            : decimal(threshold, 1, lang) +
              " " +
              (lang === "en" ? "people/day" : "pessoas/dia")}
        </strong>
      </p>
    </div>
  );
}
function App() {
  const [lang, setLang] = useState(() =>
    new URLSearchParams(location.search).get("lang") === "en" ? "en" : "pt",
  );
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("citywave-theme") === "dark" ? "dark" : "light",
  );
  const [wave, setWave] = useState(F.APP_INIT),
    [bar, setBar] = useState(H.APP_BAR_INIT),
    [shared, setShared] = useState(H.SHARED_INIT),
    [vat, setVat] = useState(V.VAT_INIT);
  const [tab, setTab] = useState("overview"),
    [scenario, setScenario] = useState("realistic");
  const t = (pt, en) => (lang === "en" ? en : pt);
  useEffect(() => {
    localStorage.setItem("citywave-theme", theme);
    document.body.style.background = theme === "dark" ? "#11161d" : "#f3f5f7";
  }, [theme]);
  useEffect(() => {
    CitywaveI18n.setLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const setW = useCallback((key, value) => {
    setScenario(null);
    setWave((p) => ({ ...p, [key]: value }));
  }, []);
  const setB = useCallback((key, value) => {
    setScenario(null);
    setBar((p) => ({ ...p, [key]: value }));
  }, []);
  const setSh = useCallback((key, value) => {
    setScenario(null);
    setShared((p) => ({ ...p, [key]: value }));
  }, []);
  const setV = useCallback(
    (key, value) => setVat((p) => ({ ...p, [key]: value, profile: "custom" })),
    [],
  );
  const applyVatProfile = (id) =>
    setVat((current) => ({ ...current, ...V.PROFILES[id] }));
  const applyScenario = (id) => {
    const p = S.build(id);
    setWave((w) => ({ ...p.wave, pricesIncludeVat: w.pricesIncludeVat }));
    setBar((b) => ({
      ...p.bar,
      pricesIncludeVat: b.pricesIncludeVat,
      concessionRentIncludesVat: b.concessionRentIncludesVat,
    }));
    setShared(p.shared);
    setScenario(id);
  };
  const setSite = (id) => {
    const site = F.SITES.find((x) => x.id === id);
    if (!site) return;
    setScenario(null);
    setWave((w) => {
      const size =
        site.id !== "custom" && w.waveSize > site.maxWave
          ? site.maxWave
          : w.waveSize;
      const spec = F.WAVES.find((x) => x.size === size);
      return {
        ...w,
        siteId: id,
        waveSize: size,
        citywaveCost: spec.basePrice,
        kwhMax: size === w.waveSize ? w.kwhMax : spec.kwh,
        pumpsCount: spec.pumps,
        sitePrep: site.id === "custom" ? w.sitePrep : site.sitePrep,
      };
    });
  };
  const vatResult = useMemo(
    () => V.calculate(wave, bar, shared, vat),
    [wave, bar, shared, vat],
  );
  const p = vatResult.project,
    w = p.wave,
    b = p.bar,
    c = p.combined;
  const presetResults = useMemo(
    () =>
      S.all().map((def) => ({
        def,
        result: V.calculate(
          { ...def.inputs.wave, pricesIncludeVat: wave.pricesIncludeVat },
          {
            ...def.inputs.bar,
            pricesIncludeVat: bar.pricesIncludeVat,
            concessionRentIncludesVat: bar.concessionRentIncludesVat,
          },
          def.inputs.shared,
          vat,
        ).project.combined,
      })),
    [
      wave.pricesIncludeVat,
      bar.pricesIncludeVat,
      bar.concessionRentIncludesVat,
      vat,
    ],
  );
  const sessionResults = useMemo(
    () =>
      [45, 60].map((minutes) => ({
        minutes,
        result: V.calculate(
          { ...wave, sessionMinutes: minutes },
          bar,
          shared,
          vat,
        ).project,
      })),
    [wave, bar, shared, vat],
  );
  const breakPoints = useMemo(() => {
    const limit = Math.max(
      w.maxSlotsDay / Math.min(...F.SF),
      wave.sessionsDay,
      1,
    );
    const inputs = [
      ...new Set([
        ...Array.from({ length: 49 }, (_, i) => (limit * i) / 48),
        wave.sessionsDay,
      ]),
    ].sort((a, z) => a - z);
    return inputs.map((input) => {
      const x = V.calculate(
        { ...wave, sessionsDay: input },
        bar,
        shared,
        vat,
      ).project;
      return {
        input,
        volume: x.wave.avgPeopleDay,
        ebitda: x.combined.ebitda,
        fcfe: x.combined.first.fcfe,
        npv: x.combined.npvProject,
      };
    });
  }, [wave, bar, shared, vat, w.maxSlotsDay]);
  const annualParticipants = sum(w.monthly.map((m) => m.people));
  const taxableFactor = (gross, rate, pct) =>
    gross ? 1 - pct / 100 + pct / 100 / (1 + rate / 100) : 1;
  const priceNet =
    wave.beginnerPrice *
    taxableFactor(wave.pricesIncludeVat, vat.waveSalesRate, vat.waveTaxablePct);
  const priceFinal = wave.pricesIncludeVat
    ? wave.beginnerPrice
    : wave.beginnerPrice *
      (1 + ((vat.waveTaxablePct / 100) * vat.waveSalesRate) / 100);
  const rentNet =
    bar.concessionRentMonth *
    taxableFactor(
      bar.concessionRentIncludesVat,
      vat.barSalesRate,
      vat.barTaxablePct,
    );
  const changeInv = (id, key, value) => {
    setScenario(null);
    setWave((x) => ({
      ...x,
      investors: x.investors.map((i) =>
        i.id === id ? { ...i, [key]: value } : i,
      ),
    }));
  };
  const W = (
    key,
    label,
    unit = "",
    min = 0,
    max = 100000000,
    step = 1,
    help,
  ) => (
    <Field
      key={key}
      label={label}
      value={wave[key]}
      onChange={(v) => setW(key, v)}
      unit={unit}
      min={min}
      max={max}
      step={step}
      help={help}
    />
  );
  const B = (
    key,
    label,
    unit = "",
    min = 0,
    max = 100000000,
    step = 1,
    help,
  ) => (
    <Field
      key={key}
      label={label}
      value={bar[key]}
      onChange={(v) => setB(key, v)}
      unit={unit}
      min={min}
      max={max}
      step={step}
      help={help}
    />
  );
  const Sh = (key, label, unit = "", min = 0, max = 100, step = 1) => (
    <Field
      key={key}
      label={label}
      value={shared[key]}
      onChange={(v) => setSh(key, v)}
      unit={unit}
      min={min}
      max={max}
      step={step}
    />
  );
  const Vat = (key, label, unit = "%", min = 0, max = 100, step = 1) => (
    <Field
      key={key}
      label={label}
      value={vat[key]}
      onChange={(v) => setV(key, v)}
      unit={unit}
      min={min}
      max={max}
      step={step}
    />
  );
  const revenueRows = [
    ...w.revBk
      .filter((x) => Math.abs(x.v) > 1e-9)
      .map((x) => ({ label: x.l, value: x.v })),
    {
      label:
        bar.operatingMode === "concession"
          ? t("Renda da concessão", "Bar concession rent")
          : t("Vendas do bar", "Bar sales"),
      value: b.annRev,
    },
  ];
  const costRows = [
    ...w.costBk
      .filter((x) => Math.abs(x.v) > 1e-9)
      .map((x) => ({ label: x.l, value: x.v })),
    {
      label: t("Custos diretos do proprietário/bar", "Owner/bar direct costs"),
      value:
        bar.operatingMode === "concession"
          ? b.fixedDirect
          : b.opex - b.sharedYear1,
    },
  ];
  const priceNames = [
    [
      t("Principiante", "Beginner"),
      "beginnerPrice",
      "beginnerPct",
      t("Material e instrutor incluídos", "Equipment and coach included"),
    ],
    [
      t("Intermédio", "Intermediate"),
      "intermediatePrice",
      "intermediatePct",
      t(
        "Material e acompanhamento incluídos",
        "Equipment and supervision included",
      ),
    ],
    [
      t("Avançado", "Advanced"),
      "advancedPrice",
      "advancedPct",
      t("Material próprio; aluguer opcional", "Own equipment; optional rental"),
    ],
    [
      t("Crianças", "Children"),
      "kidsPrice",
      "kidsPct",
      t("Material e instrutor incluídos", "Equipment and coach included"),
    ],
  ];
  const projectPV = sum(c.years.map((y) => y.fcff / (1 + c.wacc) ** y.y));
  const warningList = [
    ...p.warnings.filter((x) => !x.startsWith("Bar em concessão:")),
  ];
  const tabs = [
    ["overview", t("Resumo", "Overview")],
    ["revenue", t("Receitas", "Revenue")],
    ["costs", t("Custos e CAPEX", "Costs & CAPEX")],
    ["vat", t("IVA e caixa", "VAT & cash")],
    ["investors", t("Investidores", "Investors")],
    ["projection", t("P&L", "P&L")],
    ["analysis", t("Análise", "Analysis")],
  ];
  return (
    <div className={`app ${theme}`}>
      <header className="top">
        <div>
          <div className="eyebrow">Citywave · Funchal · Madeira</div>
          <h1>
            {t(
              "Simulador financeiro do projeto",
              "Project financial simulator",
            )}
          </h1>
          <p>
            {t(
              "Sessões de grupo + bar com espaço para trabalhar. Um único modelo, com resultados consolidados e componentes identificadas.",
              "Group sessions + bar with space to work. One model, with consolidated results and visible component contributions.",
            )}
          </p>
        </div>
        <div className="top-actions">
          <button
            className="pill"
            aria-pressed={lang === "pt"}
            onClick={() => setLang("pt")}
          >
            PT
          </button>
          <button
            className="pill"
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            className="pill"
            onClick={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
          >
            {theme === "dark"
              ? "☀ " + t("Claro", "Light")
              : "◐ " + t("Escuro", "Dark")}
          </button>
        </div>
      </header>
      <div className="scenario-strip">
        <span className="eyebrow">{t("Cenários", "Scenarios")}</span>
        {presetResults.map(({ def, result }) => (
          <button
            key={def.id}
            className="scenario-button"
            aria-pressed={scenario === def.id}
            onClick={() => applyScenario(def.id)}
            title={def.explanation[lang]}
          >
            {def.title[lang]} · {euro(result.npvProject, lang)}
          </button>
        ))}
        <label className="check-row" style={{ marginLeft: "auto" }}>
          <input
            type="checkbox"
            checked={wave.pricesIncludeVat}
            onChange={(e) => setW("pricesIncludeVat", e.target.checked)}
          />
          {t("Preços das sessões incluem IVA", "Session prices include VAT")}
        </label>
      </div>
      <p className="scenario-note">
        {scenario
          ? S.definitions.find((x) => x.id === scenario)?.explanation[lang]
          : t(
              "Simulação personalizada. Todos os resultados refletem as alterações abaixo.",
              "Custom simulation. Every result reflects the inputs below.",
            )}{" "}
        {t(
          "Cenários ilustrativos, não previsões de procura.",
          "Illustrative scenarios, not demand forecasts.",
        )}
      </p>
      <div className="metric-strip">
        <Metric
          label={t("Receita ano 1", "Year 1 revenue")}
          value={euro(c.annRev, lang)}
          note={t(
            "Onda + renda/vendas do bar, sem IVA",
            "Wave + bar rent/sales, net of VAT",
          )}
        />
        <Metric
          label={t("EBITDA ano 1", "Year 1 EBITDA")}
          value={euro(c.ebitda, lang)}
          note={percentage(c.margin)}
          negative={c.ebitda < 0}
        />
        <Metric
          label={t("VAL do projeto", "Project NPV")}
          value={euro(c.npvProject, lang)}
          note={t(
            `Taxa de desconto ${percentage(c.wacc)}`,
            `Discount rate ${percentage(c.wacc)}`,
          )}
          negative={c.npvProject < 0}
        />
        <Metric
          label={t("TIR do projeto", "Project IRR")}
          value={percentage(c.projectIRR)}
          note={t(
            `Prazo ${wave.concessionYears} anos`,
            `Horizon ${wave.concessionYears} years`,
          )}
          negative={c.projectIRR < 0}
        />
        <Metric
          label={t("Investimento inicial", "Initial investment")}
          value={euro(c.investment, lang)}
          note={t(
            "Onda + CAPEX do proprietário no bar",
            "Wave + owner-funded bar CAPEX",
          )}
        />
        <Metric
          label={t("Payback FCFF", "FCFF payback")}
          value={
            Number.isFinite(c.payback)
              ? decimal(c.payback, 1, lang) + " " + t("anos", "years")
              : "—"
          }
          note={t(
            "Fluxos nominais acumulados",
            "Cumulative nominal cash flows",
          )}
        />
      </div>
      <p className="context-line">
        {t("Caso atual", "Current case")}:{" "}
        <strong>
          {decimal(w.avgPeopleDay, 1, lang)}{" "}
          {t("participantes/dia aberto", "participants/open day")}
        </strong>{" "}
        · {wave.sessionMinutes} min · {wave.ridersPerSession}{" "}
        {t("pessoas/sessão", "people/session")} · {wave.opDays}{" "}
        {t("dias/ano", "days/year")} · {t("preços", "prices")}{" "}
        <strong>
          {wave.pricesIncludeVat
            ? t("finais com IVA", "final, VAT included")
            : t("antes de IVA", "before VAT")}
        </strong>{" "}
        · {t("bar", "bar")}:{" "}
        {bar.operatingMode === "concession"
          ? t("concessão", "concession")
          : t("exploração própria", "company-operated")}
      </p>
      <nav
        className="tabs"
        aria-label={t("Secções do simulador", "Simulator sections")}
      >
        {tabs.map(([id, label]) => (
          <button
            className="tab-button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            key={id}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="workspace">
        <aside className="sidebar">
          <p className="sidebar-intro">
            {t(
              "Altere os pressupostos. O resumo, os gráficos, o IVA, a dívida e o VAL recalculam imediatamente.",
              "Edit the assumptions. The overview, charts, VAT, debt and NPV recalculate immediately.",
            )}
          </p>
          <Fold title={t("0 · Local e prazo", "0 · Site & term")} open>
            <p className="fold-intro">
              {t(
                "O local junto ao Teleférico é a proposta do promotor. O uso do jardim depende de título e condições a formalizar com a Câmara Municipal do Funchal; o prazo e os 5% sobre a receita da onda são hipóteses, não termos acordados.",
                "The site near the cable car is the promoter's proposal. Use of the garden depends on rights and terms to be formalized with Funchal City Council; the term and 5% of wave revenue are assumptions, not agreed terms.",
              )}
            </p>
            {F.SITES.map((site) => (
              <button
                key={site.id}
                className="site-button"
                aria-pressed={wave.siteId === site.id}
                onClick={() => setSite(site.id)}
              >
                {site.label}
                <small>
                  {site.length
                    ? `${site.length}m · ${t("onda máx.", "max wave")} ${site.maxWave}m`
                    : t("Configuração manual", "Manual configuration")}
                </small>
              </button>
            ))}
            {W(
              "concessionYears",
              t("Anos de concessão", "Concession years"),
              "a",
              1,
              40,
              1,
            )}
            {W(
              "opDays",
              t("Dias de operação/ano", "Operating days/year"),
              "",
              0,
              365,
              1,
            )}
          </Fold>
          <Fold
            title={t("1 · Sessões e capacidade", "1 · Sessions & capacity")}
            open
          >
            <div className="select-line">
              <label className="hint">
                {t("Duração", "Duration")}
                <select
                  value={wave.sessionMinutes}
                  onChange={(e) =>
                    setW("sessionMinutes", Number(e.target.value))
                  }
                >
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </label>
              <label className="hint">
                {t("Onda", "Wave")}
                <select
                  value={wave.waveSize}
                  onChange={(e) => {
                    const x = F.WAVES.find(
                      (z) => z.size === Number(e.target.value),
                    );
                    if (x) {
                      setScenario(null);
                      setWave((v) => ({
                        ...v,
                        waveSize: x.size,
                        citywaveCost: x.basePrice,
                        kwhMax: x.kwh,
                        pumpsCount: x.pumps,
                      }));
                    }
                  }}
                >
                  {F.WAVES.map((x) => (
                    <option key={x.size} value={x.size}>
                      {x.size} m
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {W(
              "sessionGapMinutes",
              t("Intervalo entre sessões", "Gap between sessions"),
              "m",
              0,
              60,
              1,
            )}
            {W(
              "ridersPerSession",
              t("Pessoas por sessão", "People per session"),
              "",
              1,
              14,
              1,
            )}
            {W(
              "sessionsDay",
              t("Sessões de pico/dia", "Peak sessions/day"),
              "",
              0,
              30,
              0.1,
              t(
                `Capacidade ${w.maxSlotsDay}/dia; sazonalidade aplicada`,
                `Capacity ${w.maxSlotsDay}/day; seasonality applied`,
              ),
            )}
            {W(
              "operatingHoursDay",
              t("Horas de operação/dia", "Operating hours/day"),
              "h",
              1,
              24,
              0.5,
            )}
            <p className="hint">
              {t("Participantes públicos anuais", "Annual public participants")}
              : <strong>{decimal(annualParticipants, 0, lang)}</strong>.{" "}
              {t(
                "O limite de 14 pessoas requer validação operacional e de segurança.",
                "The 14-person cap requires operational and safety validation.",
              )}
            </p>
          </Fold>
          <Fold
            title={t("2 · Preços de sessão e IVA", "2 · Session prices & VAT")}
            open
          >
            <label className="check-row">
              <input
                type="checkbox"
                checked={wave.pricesIncludeVat}
                onChange={(e) => setW("pricesIncludeVat", e.target.checked)}
              />
              {t(
                "Valores introduzidos são preços finais com IVA",
                "Entered values are final prices including VAT",
              )}
            </label>
            {priceNames.map(([name, priceKey, pctKey]) => (
              <React.Fragment key={priceKey}>
                {W(priceKey, name, "€", 0, 1000, 0.01)}
                {W(pctKey, t("Mix de ", "Mix of ") + name, "%", 0, 100, 1)}
              </React.Fragment>
            ))}
            {W(
              "bonoPct",
              t("Clientes com desconto", "Customers with discount"),
              "%",
              0,
              100,
              1,
            )}
            {W(
              "bonoDiscount",
              t("Desconto médio", "Average discount"),
              "%",
              0,
              100,
              1,
            )}
            <p className="hint">
              {t("Exemplo principiante", "Beginner example")}:{" "}
              {euro2(priceNet, lang)} {t("receita líquida", "net revenue")} →{" "}
              {euro2(priceFinal, lang)}{" "}
              {t("pago pelo cliente", "paid by customer")}.{" "}
              {t(
                "O IVA é retirado da receita quando o valor introduzido já o inclui.",
                "VAT is removed from revenue when the entered price already includes it.",
              )}
            </p>
          </Fold>
          <Fold
            title={t("3 · Bar e espaço de trabalho", "3 · Bar & work area")}
          >
            <div className="select-line">
              <label className="hint">
                {t("Exploração", "Operation")}
                <select
                  value={bar.operatingMode}
                  onChange={(e) => setB("operatingMode", e.target.value)}
                >
                  <option value="concession">
                    {t("Concessão", "Concession")}
                  </option>
                  <option value="own">
                    {t("Própria", "Company-operated")}
                  </option>
                </select>
              </label>
            </div>
            {bar.operatingMode === "concession" ? (
              <>
                {B(
                  "concessionRentMonth",
                  t("Renda recebida/mês", "Rent received/month"),
                  "€",
                  0,
                  100000,
                  0.01,
                )}
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={bar.concessionRentIncludesVat}
                    onChange={(e) =>
                      setB("concessionRentIncludesVat", e.target.checked)
                    }
                  />
                  {t(
                    "Renda introduzida inclui IVA",
                    "Entered rent includes VAT",
                  )}
                </label>
                <p className="hint">
                  {t("Renda líquida para a Lda.", "Net rent for the company")}:{" "}
                  <strong>
                    {euro2(rentNet, lang)}/{t("mês", "month")}
                  </strong>
                </p>
                {B(
                  "concessionOwnerCostsMonth",
                  t("Custos retidos/mês", "Owner-retained costs/month"),
                  "€",
                  0,
                  30000,
                  0.01,
                )}
                {B(
                  "concessionFitoutCapex",
                  t("Obras pagas pela Lda.", "Company-funded fit-out"),
                  "€",
                  0,
                  2000000,
                  100,
                )}
                {B(
                  "concessionExitValue",
                  t("Valor residual no fim", "Residual exit value"),
                  "€",
                  0,
                  2000000,
                  100,
                )}
                {B(
                  "contingency",
                  t("Contingência obras", "Fit-out contingency"),
                  "%",
                  0,
                  50,
                  0.5,
                )}
                {B(
                  "revenueGrowth",
                  t("Crescimento da renda/ano", "Annual rent growth"),
                  "%",
                  -50,
                  100,
                  0.1,
                )}
                {B(
                  "costGrowth",
                  t(
                    "Crescimento custos proprietário",
                    "Annual owner-cost growth",
                  ),
                  "%",
                  -50,
                  100,
                  0.1,
                )}
                {B(
                  "maintCapexPct",
                  t("CAPEX manutenção do bar", "Bar maintenance CAPEX"),
                  "%",
                  0,
                  100,
                  0.1,
                )}
              </>
            ) : (
              <>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={bar.pricesIncludeVat}
                    onChange={(e) => setB("pricesIncludeVat", e.target.checked)}
                  />
                  {t(
                    "Consumos do bar incluem IVA",
                    "Bar spending includes VAT",
                  )}
                </label>
                {B("seats", t("Lugares totais", "Total seats"), "", 1, 300, 1)}
                {B(
                  "hoursDay",
                  t("Horas aberto/dia", "Opening hours/day"),
                  "h",
                  1,
                  24,
                  0.5,
                )}
                {B(
                  "opDays",
                  t("Dias aberto/ano", "Days open/year"),
                  "",
                  0,
                  365,
                  1,
                )}
                {B(
                  "externalDaily",
                  t("Visitantes externos/dia", "External visitors/day"),
                  "",
                  0,
                  1000,
                  1,
                )}
                {B(
                  "externalTicket",
                  t("Consumo externo/visita", "External spend/visit"),
                  "€",
                  0,
                  200,
                  0.01,
                )}
                {B(
                  "surfConversion",
                  t("Surfistas que consomem", "Surfers who buy"),
                  "%",
                  0,
                  100,
                  1,
                )}
                {B(
                  "surfTicket",
                  t("Consumo por surfista", "Spend per surfer"),
                  "€",
                  0,
                  200,
                  0.01,
                )}
                {B(
                  "companionsPerSurfer",
                  t("Acompanhantes/surfista", "Companions/surfer"),
                  "",
                  0,
                  10,
                  0.1,
                )}
                {B(
                  "companionConversion",
                  t("Acompanhantes que consomem", "Companions who buy"),
                  "%",
                  0,
                  100,
                  1,
                )}
                {B(
                  "companionTicket",
                  t("Consumo/acompanhante", "Spend/companion"),
                  "€",
                  0,
                  200,
                  0.01,
                )}
                {B(
                  "workSeats",
                  t("Lugares para trabalhar", "Work-friendly seats"),
                  "",
                  0,
                  300,
                  1,
                )}
                {B(
                  "workDaily",
                  t("Clientes a trabalhar/dia", "Working visitors/day"),
                  "",
                  0,
                  300,
                  1,
                )}
                {B(
                  "workTicket",
                  t("Consumo de quem trabalha", "Spend by working visitor"),
                  "€",
                  0,
                  200,
                  0.01,
                )}
                {B(
                  "cogsPct",
                  t("Custo de produtos", "Cost of goods"),
                  "%",
                  0,
                  100,
                  0.5,
                )}
                {B(
                  "staffCount",
                  t("Equipa exclusiva do bar", "Bar-only staff"),
                  "",
                  0,
                  50,
                  1,
                )}
                {B(
                  "salary",
                  t("Salário médio do bar", "Average bar wage"),
                  "€",
                  0,
                  10000,
                  1,
                )}
                {B(
                  "works",
                  t("Obras do bar", "Bar works"),
                  "€",
                  0,
                  2000000,
                  100,
                )}
                {B(
                  "equipment",
                  t("Equipamento do bar", "Bar equipment"),
                  "€",
                  0,
                  2000000,
                  100,
                )}
                {B(
                  "furniture",
                  t("Mobiliário", "Furniture"),
                  "€",
                  0,
                  2000000,
                  100,
                )}
                {B(
                  "wifiSockets",
                  t("Wi-Fi e tomadas", "Wi-Fi & sockets"),
                  "€",
                  0,
                  100000,
                  100,
                )}
                {B(
                  "permits",
                  t("Licenças do bar", "Bar permits"),
                  "€",
                  0,
                  100000,
                  100,
                )}
                {B(
                  "initialStock",
                  t("Stock inicial", "Initial stock"),
                  "€",
                  0,
                  100000,
                  100,
                )}
                {B(
                  "externalStay",
                  t("Permanência visita externa", "External visit length"),
                  "h",
                  0.1,
                  24,
                  0.1,
                )}
                {B(
                  "surfStay",
                  t("Permanência surfista", "Surfer visit length"),
                  "h",
                  0.1,
                  24,
                  0.1,
                )}
                {B(
                  "companionStay",
                  t("Permanência acompanhante", "Companion visit length"),
                  "h",
                  0.1,
                  24,
                  0.1,
                )}
                {B(
                  "workHours",
                  t("Janela de trabalho/dia", "Work hours/day"),
                  "h",
                  0,
                  24,
                  0.5,
                )}
                {B(
                  "workStay",
                  t("Permanência a trabalhar", "Working visit length"),
                  "h",
                  0.1,
                  24,
                  0.1,
                )}
                {B(
                  "seasonalPct",
                  t(
                    "Sazonalidade público externo",
                    "External visitor seasonality",
                  ),
                  "%",
                  0,
                  100,
                  1,
                )}
                {B(
                  "paymentPct",
                  t("Comissões de pagamento", "Payment fees"),
                  "%",
                  0,
                  100,
                  0.1,
                )}
                {B(
                  "concessionPct",
                  t("Concessão sobre vendas do bar", "Concession on bar sales"),
                  "%",
                  0,
                  100,
                  0.1,
                )}
                {B(
                  "mgmtPct",
                  t("Gestão sobre vendas do bar", "Management on bar sales"),
                  "%",
                  0,
                  100,
                  0.1,
                )}
                {B(
                  "utilitiesMonth",
                  t("Utilidades do bar/mês", "Bar utilities/month"),
                  "€",
                  0,
                  100000,
                  10,
                )}
                {B(
                  "rentMonth",
                  t("Renda/custo fixo do bar", "Bar rent/fixed cost"),
                  "€",
                  0,
                  100000,
                  10,
                )}
                {B(
                  "insuranceMonth",
                  t("Seguro do bar/mês", "Bar insurance/month"),
                  "€",
                  0,
                  100000,
                  10,
                )}
                {B(
                  "otherMonth",
                  t("Outros custos do bar/mês", "Other bar costs/month"),
                  "€",
                  0,
                  100000,
                  10,
                )}
                {B(
                  "contingency",
                  t("Contingência do bar", "Bar contingency"),
                  "%",
                  0,
                  100,
                  0.5,
                )}
                {B(
                  "depreciationYears",
                  t("Vida útil do bar", "Bar asset life"),
                  "a",
                  1,
                  100,
                  1,
                )}
                {B(
                  "maintCapexPct",
                  t("CAPEX manutenção do bar", "Bar maintenance CAPEX"),
                  "%",
                  0,
                  100,
                  0.1,
                )}
                {B(
                  "exitValue",
                  t("Valor residual do bar", "Bar exit value"),
                  "€",
                  -10000000,
                  10000000,
                  100,
                )}
                {B(
                  "revenueGrowth",
                  t("Crescimento das vendas do bar", "Bar sales growth"),
                  "%",
                  -50,
                  100,
                  0.1,
                )}
                {B(
                  "costGrowth",
                  t("Crescimento de custos do bar", "Bar cost growth"),
                  "%",
                  -50,
                  100,
                  0.1,
                )}
              </>
            )}
            <p className="hint">
              {bar.operatingMode === "concession"
                ? t(
                    "As vendas e os salários do concessionário não entram nas contas da Lda. O espaço para trabalhar integra o bar.",
                    "Concessionaire sales and wages are outside the company accounts. The work area is part of the bar.",
                  )
                : t(
                    "O trabalho no bar gera consumo por visita; não há passes nem aluguer de secretárias.",
                    "Working in the bar generates visit spending; no desk passes or memberships are sold.",
                  )}
            </p>
          </Fold>
          <Fold title={t("4 · Energia e operação", "4 · Energy & operations")}>
            {W(
              "kwhMax",
              t("Potência máxima", "Maximum power"),
              "kW",
              0,
              5000,
              1,
            )}
            {W(
              "avgPumpLoad",
              t("Carga média das bombas", "Average pump load"),
              "%",
              0,
              100,
              1,
            )}
            {W(
              "electricityRate",
              t("Custo de eletricidade", "Electricity cost"),
              "€/kWh",
              0,
              5,
              0.001,
            )}
            {W(
              "energyOtherMonth",
              t("Potência/consumos auxiliares", "Capacity & auxiliary energy"),
              "€/m",
              0,
              50000,
              10,
            )}
            {W("staffCount", t("Equipa da onda", "Wave team"), "", 0, 100, 1)}
            {W(
              "avgSalary",
              t("Salário mensal médio", "Average monthly wage"),
              "€",
              0,
              20000,
              10,
            )}
            {W(
              "ssRate",
              t("Encargos patronais", "Employer charges"),
              "%",
              0,
              100,
              0.01,
            )}
            {W(
              "waterMonth",
              t("Água mensal", "Monthly water"),
              "€",
              0,
              100000,
              10,
            )}
            {W(
              "maintMonth",
              t("Manutenção mensal", "Monthly maintenance"),
              "€",
              0,
              100000,
              10,
            )}
            {W(
              "insuranceYear",
              t("Seguro anual", "Annual insurance"),
              "€",
              0,
              1000000,
              100,
            )}
            {W(
              "marketingMonth",
              t("Marketing mensal", "Monthly marketing"),
              "€",
              0,
              100000,
              10,
            )}
            {W(
              "accountingMonth",
              t("Contabilidade mensal", "Monthly accounting"),
              "€",
              0,
              100000,
              10,
            )}
            {W(
              "miscMonth",
              t("Outros custos mensais", "Other monthly costs"),
              "€",
              0,
              100000,
              10,
            )}
            {W(
              "concessionRate",
              t("CMF: percentagem da receita da onda (hipótese)", "Funchal Council: share of wave revenue (assumption)"),
              "%",
              0,
              100,
              0.1,
            )}
            <p className="fold-intro">
              {t(
                "Este pagamento hipotético à Câmara é um custo da piscina. Para testar cedência sem percentagem, introduza 0%. O modelo ainda não tem renda municipal fixa. A renda do operador do bar é receita distinta da Lda.; confirme se o título municipal permite essa exploração por terceiro.",
                "This assumed Council payment is a pool cost. Enter 0% to test a site without revenue sharing. A fixed municipal rent is not yet modelled. Bar operator rent is separate company income; confirm that the municipal title permits a third-party operator.",
              )}
            </p>
            {W(
              "mgmtPct",
              t("Gestão sobre receita da onda", "Wave revenue management"),
              "%",
              0,
              100,
              0.1,
            )}
            {W(
              "distributionPct",
              t("Vendas por intermediários", "Intermediated sales"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "commissionPct",
              t("Comissão dos intermediários", "Intermediary commission"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "equipmentPerVisit",
              t("Material por participante", "Equipment per participant"),
              "€",
              0,
              1000,
              0.01,
            )}
            <p className="hint">
              {t("Custo anual da energia", "Annual energy cost")}:{" "}
              <strong>{euro(w.annEnergy, lang)}</strong>.{" "}
              {t(
                "600 kW é potência de pico; 100% de carga média é uma hipótese editável.",
                "600 kW is peak power; 100% average load is an editable assumption.",
              )}
            </p>
          </Fold>
          <Fold
            title={t(
              "5 · Investimento e receitas adicionais",
              "5 · Investment & extra revenue",
            )}
          >
            {W(
              "citywaveCost",
              t("Máquina Citywave", "Citywave machine"),
              "€",
              0,
              10000000,
              1000,
            )}
            {W(
              "installation",
              t("Instalação", "Installation"),
              "€",
              0,
              2000000,
              100,
            )}
            {W("shipping", t("Transporte", "Shipping"), "€", 0, 2000000, 100)}
            {W(
              "saltwaterUplift",
              t("Acréscimo água salgada", "Saltwater uplift"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "sitePrep",
              t("Preparação do local", "Site preparation"),
              "€",
              0,
              2000000,
              100,
            )}
            {W("plumbing", t("Canalização", "Plumbing"), "€", 0, 2000000, 100)}
            {W(
              "electrical",
              t("Instalação elétrica", "Electrical works"),
              "€",
              0,
              2000000,
              100,
            )}
            {W(
              "permits",
              t("Licenças e projeto", "Permits & design"),
              "€",
              0,
              2000000,
              100,
            )}
            {W(
              "contingency",
              t("Contingência", "Contingency"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "privatePct",
              t("Sessões privadas", "Private sessions"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "privatePrice",
              t("Preço sessão privada", "Private session price"),
              "€",
              0,
              10000,
              0.01,
            )}
            {W(
              "privateGroupSize",
              t("Pessoas por privada", "People per private session"),
              "",
              1,
              14,
              1,
            )}
            {W(
              "clinicPct",
              t("Coaching extra", "Additional coaching"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "clinicPrice",
              t("Preço coaching extra", "Additional coaching price"),
              "€",
              0,
              1000,
              0.01,
            )}
            {W(
              "rentalAdvancedPct",
              t("Avançados que alugam", "Advanced riders renting"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "rentalAdvancedPrice",
              t("Preço aluguer", "Rental price"),
              "€",
              0,
              1000,
              0.01,
            )}
            {W(
              "eventMonthly",
              t("Eventos sem onda/mês", "Events without wave/month"),
              "€",
              0,
              100000,
              0.01,
            )}
            {W(
              "communityCards",
              t("Cartões sem sessões/ano", "Cards without sessions/year"),
              "",
              0,
              100000,
              1,
            )}
            {W(
              "communityPrice",
              t("Preço cartão", "Card price"),
              "€",
              0,
              10000,
              0.01,
            )}
            <p className="hint">
              {t(
                "Sessões privadas substituem sessões públicas. Outras receitas adicionais começam a zero no caso-base.",
                "Private sessions replace public sessions. Other ancillary revenue starts at zero in the base case.",
              )}
            </p>
          </Fold>
          <Fold
            title={t(
              "6 · Financiamento e projeção",
              "6 · Funding & projection",
            )}
          >
            {W(
              "bankPct",
              t("Financiamento bancário", "Bank finance"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "loanRate",
              t("Taxa do empréstimo", "Loan interest rate"),
              "%",
              0,
              100,
              0.1,
            )}
            {W("loanYears", t("Prazo empréstimo", "Loan years"), "a", 1, 40, 1)}
            {W(
              "joaoPct",
              t("Capital João", "João cash contribution"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "rodrigoPct",
              t("Capital Rodrigo", "Rodrigo cash contribution"),
              "%",
              0,
              100,
              0.5,
            )}
            {W(
              "sweatPct",
              t("Peso sweat equity", "Sweat equity weight"),
              "",
              0,
              100,
              0.5,
            )}
            {W(
              "taxRate",
              t("Imposto efetivo assumido", "Assumed effective income tax"),
              "%",
              0,
              100,
              0.1,
            )}
            {W(
              "revenueGrowth",
              t("Crescimento receita/ano", "Annual revenue growth"),
              "%",
              -50,
              100,
              0.1,
            )}
            {W(
              "costGrowth",
              t("Crescimento custos/ano", "Annual cost growth"),
              "%",
              -50,
              100,
              0.1,
            )}
            {W(
              "depreciationYears",
              t("Vida útil depreciação", "Depreciation years"),
              "a",
              1,
              100,
              1,
            )}
            {W(
              "maintCapexPct",
              t("CAPEX de manutenção/ano", "Annual maintenance CAPEX"),
              "%",
              0,
              100,
              0.1,
            )}
            {W(
              "exitValue",
              t("Valor residual da onda", "Wave residual value"),
              "€",
              -10000000,
              10000000,
              100,
            )}
            {W(
              "distPct",
              t("Distribuição do lucro", "Profit distribution"),
              "%",
              0,
              100,
              1,
            )}
            {W(
              "rfRate",
              t("Taxa sem risco", "Risk-free rate"),
              "%",
              -10,
              50,
              0.1,
            )}
            {W(
              "marketPremium",
              t("Prémio de risco", "Equity risk premium"),
              "%",
              0,
              50,
              0.1,
            )}
            {W(
              "unleveredBeta",
              t("Beta sem dívida", "Unlevered beta"),
              "",
              0,
              10,
              0.01,
            )}
            {Sh(
              "barSharePct",
              t(
                "Custos comuns atribuídos ao bar",
                "Shared costs allocated to bar",
              ),
              "%",
              0,
              100,
              0.5,
            )}
            {Sh(
              "extraMonth",
              t(
                "Custos comuns adicionais/mês",
                "Additional shared costs/month",
              ),
              "€",
              0,
              100000,
              10,
            )}
          </Fold>
          <Fold title={t("7 · IVA e recuperação", "7 · VAT & recovery")}>
            {Vat("waveSalesRate", t("IVA nas sessões", "Session output VAT"))}
            {Vat("barSalesRate", t("IVA no bar/renda", "Bar/rent output VAT"))}
            {Vat(
              "waveTaxablePct",
              t("Vendas da onda tributadas", "Taxable wave sales"),
            )}
            {Vat(
              "waveRecoveryPct",
              t("IVA dedutível na onda", "Recoverable wave VAT"),
            )}
            {Vat(
              "barTaxablePct",
              t("Bar/renda tributados", "Taxable bar/rent sales"),
            )}
            {Vat(
              "barRecoveryPct",
              t("IVA dedutível no bar", "Recoverable bar VAT"),
            )}
            {Vat(
              "capexVatRate",
              t("IVA de investimento", "Investment input VAT"),
            )}
            {Vat(
              "opexVatRate",
              t("IVA dos custos elegíveis", "Eligible operating input VAT"),
            )}
            {Vat(
              "machineInvoicePct",
              t("IVA máquina pago na fatura", "Machine VAT paid on invoice"),
            )}
            {Vat(
              "otherInvoicePct",
              t("IVA de outras faturas pago", "Other investment VAT paid"),
            )}
            {Vat(
              "refundLagMonths",
              t("Prazo de reembolso", "Refund delay"),
              "m",
              0,
              24,
              1,
            )}
            <label className="check-row">
              <input
                type="checkbox"
                checked={vat.requestRefund}
                onChange={(e) => setV("requestRefund", e.target.checked)}
              />
              {t(
                "Pedir reembolso do crédito de IVA",
                "Request VAT credit refund",
              )}
            </label>
          </Fold>
        </aside>
        <main className="main">
          {warningList.length > 0 && (
            <div className="warning" role="status">
              {warningList.map((x, i) => (
                <div key={i}>{warningLabel(x, lang)}</div>
              ))}
            </div>
          )}
          {tab === "overview" && (
            <>
              <MonthlyChart data={c.monthly} lang={lang} />
              <div className="split">
                <div>
                  <h2 className="section-title">
                    {t("Investimento inicial", "Initial investment")}
                  </h2>
                  {w.capexBk.map((x, i) => (
                    <ValueBar
                      key={i}
                      label={x.l}
                      value={x.v}
                      max={Math.max(...w.capexBk.map((y) => y.v))}
                      lang={lang}
                    />
                  ))}
                  {b.capex > 0 && (
                    <ValueBar
                      label={t(
                        "CAPEX do bar pago pela Lda.",
                        "Company-funded bar CAPEX",
                      )}
                      value={b.capex}
                      max={c.investment}
                      lang={lang}
                    />
                  )}
                  <div className="total-row">
                    <span>
                      CAPEX + {t("fundo de maneio", "working capital")}
                    </span>
                    <span className="mono">{euro(c.investment, lang)}</span>
                  </div>
                </div>
                <div>
                  <h2 className="section-title">
                    {t("Receita anual", "Annual revenue")}
                  </h2>
                  {revenueRows.map((x, i) => (
                    <ValueBar
                      key={i}
                      label={x.label}
                      value={x.value}
                      max={Math.max(...revenueRows.map((y) => y.value))}
                      lang={lang}
                    />
                  ))}
                  <div className="total-row">
                    <span>{t("Total", "Total")}</span>
                    <span className="mono">{euro(c.annRev, lang)}</span>
                  </div>
                  <h2 className="sub-title">
                    {t("Custos anuais", "Annual costs")}
                  </h2>
                  {costRows.map((x, i) => (
                    <ValueBar
                      key={i}
                      label={x.label}
                      value={x.value}
                      max={Math.max(...costRows.map((y) => y.value))}
                      lang={lang}
                    />
                  ))}
                  <div className="total-row">
                    <span>OPEX</span>
                    <span className="mono">{euro(c.opex, lang)}</span>
                  </div>
                </div>
              </div>
              <h2 className="sub-title">
                {t("Contribuição das componentes", "Component contribution")}
              </h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("Indicador", "Measure")}</th>
                      <th>{t("Onda", "Wave")}</th>
                      <th>Bar</th>
                      <th>{t("Conjunto", "Combined")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [t("Receita ano 1", "Year 1 revenue"), "annRev"],
                      [t("EBITDA ano 1", "Year 1 EBITDA"), "ebitda"],
                      [
                        t("Investimento inicial", "Initial investment"),
                        "investment",
                      ],
                      [t("VAL", "NPV"), "npvProject"],
                    ].map(([label, key]) => (
                      <tr key={key}>
                        <td>{label}</td>
                        {[p.waveAllocated, b, c].map((z, i) => (
                          <td key={i} className="numeric">
                            {euro(z[key], lang)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="hint">
                {t(
                  "Custos comuns repartidos apenas para análise; o imposto e o VAL do conjunto são recalculados numa só Lda., por isso o VAL das colunas pode não somar exatamente.",
                  "Shared costs are allocated only for analysis; combined tax and NPV are recalculated for one company, so component NPVs may not add exactly.",
                )}
              </p>
              <div className="note">
                <strong>{t("Como ler o VAL", "How to read NPV")}:</strong>{" "}
                {euro(
                  projectPV + c.terminalValue / (1 + c.wacc) ** c.years.length,
                  lang,
                )}{" "}
                {t(
                  "de fluxos e valor residual descontados",
                  "of discounted cash flows and exit value",
                )}{" "}
                − {euro(c.investment, lang)}{" "}
                {t("de investimento inicial", "of initial investment")} ={" "}
                <strong className={signedClass(c.npvProject)}>
                  {euro(c.npvProject, lang)}
                </strong>
                .{" "}
                {t(
                  "No caso-base, o projeto pode ter EBITDA positivo e VAL negativo porque os fluxos não recuperam o investimento no prazo da concessão.",
                  "In the base case, EBITDA can be positive while NPV is negative because cash flows do not recover the investment during the concession.",
                )}
              </div>
            </>
          )}
          {tab === "revenue" && (
            <>
              <h2 className="section-title">
                {t(
                  "Capacidade e preços por sessão",
                  "Session capacity and prices",
                )}
              </h2>
              <div className="inline-metrics">
                <div>
                  <small>
                    {t(
                      "Participantes públicos/ano",
                      "Public participants/year",
                    )}
                  </small>
                  <strong>{decimal(annualParticipants, 0, lang)}</strong>
                </div>
                <div>
                  <small>{t("Média/dia aberto", "Average/open day")}</small>
                  <strong>{decimal(w.avgPeopleDay, 1, lang)}</strong>
                </div>
                <div>
                  <small>
                    {t(
                      "Receita líquida média/pessoa",
                      "Average net revenue/person",
                    )}
                  </small>
                  <strong>{euro2(w.effectiveAvgPrice, lang)}</strong>
                </div>
              </div>
              <p className="lead">
                {t(
                  "O número de sessões introduzido é a procura de pico. O motor aplica a sazonalidade mensal e o limite de sessões possível nas horas de operação.",
                  "Entered sessions are peak demand. The engine applies monthly seasonality and the session limit implied by opening hours.",
                )}
              </p>
              <h3 className="sub-title">
                {t("Preço por pessoa e nível", "Price per person and level")}
              </h3>
              <div className="table-wrap">
                <table className="data-table price-table">
                  <thead>
                    <tr>
                      <th>{t("Nível", "Level")}</th>
                      <th>{t("Preço introduzido", "Entered price")}</th>
                      <th>{t("Mix", "Mix")}</th>
                      <th>
                        {t("Receita líquida/pessoa", "Net revenue/person")}
                      </th>
                      <th>{t("Preço final/pessoa", "Final price/person")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceNames.map(([name, priceKey, pctKey]) => {
                      const val = wave[priceKey],
                        net =
                          val *
                          taxableFactor(
                            wave.pricesIncludeVat,
                            vat.waveSalesRate,
                            vat.waveTaxablePct,
                          ),
                        gross = wave.pricesIncludeVat
                          ? val
                          : val *
                            (1 +
                              ((vat.waveTaxablePct / 100) * vat.waveSalesRate) /
                                100);
                      return (
                        <tr key={priceKey}>
                          <td>{name}</td>
                          <td>
                            <Field
                              label={name + " " + t("preço", "price")}
                              value={val}
                              onChange={(x) => setW(priceKey, x)}
                              unit="€"
                              max={1000}
                              step={0.01}
                            />
                          </td>
                          <td>
                            <Field
                              label={name + " mix"}
                              value={wave[pctKey]}
                              onChange={(x) => setW(pctKey, x)}
                              unit="%"
                              max={100}
                            />
                          </td>
                          <td className="numeric">{euro2(net, lang)}</td>
                          <td className="numeric">{euro2(gross, lang)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={wave.pricesIncludeVat}
                  onChange={(e) => setW("pricesIncludeVat", e.target.checked)}
                />
                {t(
                  "Os preços introduzidos já incluem IVA",
                  "Entered prices already include VAT",
                )}
              </label>
              <p className="hint">
                {t(
                  "Ao assinalar, os números introduzidos mantêm-se; a receita líquida passa a excluir o IVA. O mesmo critério aplica-se a sessões privadas, coaching, aluguer e outras vendas da onda.",
                  "When checked, entered numbers stay the same; net revenue excludes VAT. The same basis applies to private sessions, coaching, rentals and other wave sales.",
                )}
              </p>
              <h3 className="sub-title">
                {t(
                  "Comparação de duração, com os restantes pressupostos iguais",
                  "Duration comparison with all other assumptions unchanged",
                )}
              </h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("Duração", "Duration")}</th>
                      <th>{t("Sessões máximas/dia", "Max sessions/day")}</th>
                      <th>{t("Pessoas/dia médio", "Average people/day")}</th>
                      <th>{t("Receita ano 1", "Year 1 revenue")}</th>
                      <th>EBITDA</th>
                      <th>VAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionResults.map(({ minutes, result }) => (
                      <tr key={minutes}>
                        <td>{minutes} min</td>
                        <td className="numeric">{result.wave.maxSlotsDay}</td>
                        <td className="numeric">
                          {decimal(result.wave.avgPeopleDay, 1, lang)}
                        </td>
                        <td className="numeric">
                          {euro(result.combined.annRev, lang)}
                        </td>
                        <td className="numeric">
                          {euro(result.combined.ebitda, lang)}
                        </td>
                        <td className="numeric">
                          {euro(result.combined.npvProject, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="sub-title">
                {t("Origem da receita", "Revenue sources")}
              </h3>
              {revenueRows.map((x, i) => (
                <ValueBar
                  key={i}
                  label={x.label}
                  value={x.value}
                  max={Math.max(...revenueRows.map((y) => y.value))}
                  lang={lang}
                />
              ))}
              <div className="total-row">
                <span>
                  {t(
                    "Receita total líquida de IVA",
                    "Total revenue net of VAT",
                  )}
                </span>
                <span className="mono">{euro(c.annRev, lang)}</span>
              </div>
              <div className="note">
                {bar.operatingMode === "concession"
                  ? t(
                      "O bar está concessionado: só a renda faturada pela Lda. entra na receita do projeto. Tráfego do teleférico, hotéis e cruzeiros não é automaticamente convertido em clientes.",
                      "The bar is concessioned: only rent invoiced by the company enters project revenue. Cable car, hotel and cruise traffic is not automatically converted into customers.",
                    )
                  : t(
                      "Na exploração direta, as vendas do bar são modeladas a partir dos clientes, do consumo e da capacidade de lugares; trabalhar no espaço não é cobrado separadamente.",
                      "In company operation, bar sales follow visitors, spend and seat capacity; working in the space is not billed separately.",
                    )}
              </div>
            </>
          )}
          {tab === "costs" && (
            <>
              <h2 className="section-title">
                {t(
                  "Custos anuais do projeto",
                  "Project annual operating costs",
                )}
              </h2>
              {costRows.map((x, i) => (
                <ValueBar
                  key={i}
                  label={x.label}
                  value={x.value}
                  max={Math.max(...costRows.map((y) => y.value))}
                  lang={lang}
                />
              ))}
              <div className="total-row">
                <span>OPEX</span>
                <span className="mono">{euro(c.opex, lang)}</span>
              </div>
              <div className="inline-metrics">
                <div>
                  <small>{t("Energia/ano", "Energy/year")}</small>
                  <strong>{euro(w.annEnergy, lang)}</strong>
                </div>
                <div>
                  <small>{t("Consumo anual", "Annual energy")}</small>
                  <strong>{decimal(w.annKwh, 0, lang)} kWh</strong>
                </div>
                <div>
                  <small>
                    {t("CAPEX manutenção/ano", "Maintenance CAPEX/year")}
                  </small>
                  <strong>{euro(c.first.maintCapex, lang)}</strong>
                </div>
              </div>
              <p className="lead">
                {t(
                  "Energia = potência máxima × carga média × horas/dia × dias/ano × €/kWh. O CAPEX de manutenção é saída de caixa adicional ao OPEX de manutenção.",
                  "Energy = peak power × average load × hours/day × days/year × €/kWh. Maintenance CAPEX is a cash outflow in addition to maintenance OPEX.",
                )}
              </p>
              <h2 className="sub-title">
                {t(
                  "Investimento inicial detalhado",
                  "Detailed initial investment",
                )}
              </h2>
              {w.capexBk.map((x, i) => (
                <ValueBar
                  key={i}
                  label={x.l}
                  value={x.v}
                  max={Math.max(...w.capexBk.map((y) => y.v))}
                  lang={lang}
                />
              ))}
              {b.capex > 0 && (
                <ValueBar
                  label={t(
                    "CAPEX bar pago pela Lda.",
                    "Company-funded bar CAPEX",
                  )}
                  value={b.capex}
                  max={c.investment}
                  lang={lang}
                />
              )}
              <div className="total-row">
                <span>{t("Investimento total", "Total investment")}</span>
                <span className="mono">{euro(c.investment, lang)}</span>
              </div>
              <div className="note">
                {t(
                  "O IVA dedutível não é custo nem CAPEX económico. A saída temporária de caixa até ao reembolso aparece em “IVA e caixa”. IVA não dedutível entra no investimento/custos uma única vez.",
                  "Recoverable VAT is neither cost nor economic CAPEX. Temporary cash tied up until refund appears in “VAT & cash”. Non-recoverable VAT enters investment/costs only once.",
                )}
              </div>
            </>
          )}
          {tab === "vat" && (
            <>
              <h2 className="section-title">
                {t("Preços, IVA e tesouraria", "Prices, VAT and cash")}
              </h2>
              <p className="lead">
                {t(
                  "O caso-base representa uma Lda. com vendas tributadas e dedução integral do IVA elegível. O enquadramento efetivo depende dos contratos e da faturação.",
                  "The base case represents a trading company with taxable sales and full deduction of eligible input VAT. Actual treatment depends on contracts and invoices.",
                )}
              </p>
              <div className="scenario-strip" style={{ marginTop: 0 }}>
                <span className="eyebrow">
                  {t("Hipótese fiscal", "Tax case")}
                </span>
                {[
                  ["company", t("Lda. tributada", "Taxable company")],
                  [
                    "exempt",
                    t("Sensibilidade: onda isenta", "Sensitivity: exempt wave"),
                  ],
                  [
                    "mixed",
                    t(
                      "Sensibilidade: atividade mista",
                      "Sensitivity: mixed activity",
                    ),
                  ],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className="scenario-button"
                    aria-pressed={vat.profile === id}
                    onClick={() => applyVatProfile(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="hint">
                {t(
                  "As sensibilidades são testes de risco, não regimes que a Lda. possa escolher livremente. Alterar uma taxa cria uma hipótese personalizada.",
                  "The sensitivities test risk; they are not tax regimes the company can choose freely. Editing a rate creates a custom case.",
                )}
              </p>
              <div className="split">
                <div>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={wave.pricesIncludeVat}
                      onChange={(e) =>
                        setW("pricesIncludeVat", e.target.checked)
                      }
                    />
                    {t(
                      "Preços das sessões introduzidos com IVA",
                      "Entered session prices include VAT",
                    )}
                  </label>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={
                        bar.operatingMode === "concession"
                          ? bar.concessionRentIncludesVat
                          : bar.pricesIncludeVat
                      }
                      onChange={(e) =>
                        setB(
                          bar.operatingMode === "concession"
                            ? "concessionRentIncludesVat"
                            : "pricesIncludeVat",
                          e.target.checked,
                        )
                      }
                    />
                    {bar.operatingMode === "concession"
                      ? t(
                          "Renda da concessão introduzida com IVA",
                          "Entered concession rent includes VAT",
                        )
                      : t(
                          "Consumo no bar introduzido com IVA",
                          "Entered bar spend includes VAT",
                        )}
                  </label>
                  <div className="note">
                    {t("Exemplo principiante", "Beginner example")}:{" "}
                    <strong>{euro2(priceNet, lang)}</strong>{" "}
                    {t("líquidos →", "net →")}{" "}
                    <strong>{euro2(priceFinal, lang)}</strong>{" "}
                    {t("ao cliente", "customer price")}.{" "}
                    {bar.operatingMode === "concession" && (
                      <span>
                        {t("Renda líquida mensal", "Net monthly rent")}:{" "}
                        <strong>{euro2(rentNet, lang)}</strong>.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div
                    className="inline-metrics"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    <div>
                      <small>
                        {t(
                          "IVA inicial pago em faturas",
                          "Initial VAT paid on invoices",
                        )}
                      </small>
                      <strong>{euro(vatResult.initialInvoiceVAT, lang)}</strong>
                    </div>
                    <div>
                      <small>
                        {t(
                          "Pico de caixa empatada em IVA",
                          "Peak cash tied up in VAT",
                        )}
                      </small>
                      <strong>
                        {euro(vatResult.peakVatCashDeficit, lang)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="sub-title">
                {t("Tratamento fiscal editável", "Editable tax treatment")}
              </h3>
              <div className="split">
                <div>
                  {Vat(
                    "waveSalesRate",
                    t("IVA nas sessões", "Session output VAT"),
                  )}
                  {Vat(
                    "waveTaxablePct",
                    t("Vendas da onda tributadas", "Taxable wave sales"),
                  )}
                  {Vat(
                    "waveRecoveryPct",
                    t("IVA dedutível na onda", "Recoverable wave VAT"),
                  )}
                  {Vat(
                    "barSalesRate",
                    t("IVA bar/renda", "Bar/rent output VAT"),
                  )}
                  {Vat(
                    "barTaxablePct",
                    t("Bar/renda tributados", "Taxable bar/rent sales"),
                  )}
                  {Vat(
                    "barRecoveryPct",
                    t("IVA dedutível no bar", "Recoverable bar VAT"),
                  )}
                </div>
                <div>
                  {Vat(
                    "capexVatRate",
                    t("IVA de investimento", "Investment input VAT"),
                  )}
                  {Vat(
                    "opexVatRate",
                    t(
                      "IVA nos custos elegíveis",
                      "Eligible operating input VAT",
                    ),
                  )}
                  {Vat(
                    "machineInvoicePct",
                    t(
                      "IVA Citywave pago na fatura",
                      "Citywave VAT paid on invoice",
                    ),
                  )}
                  {Vat(
                    "otherInvoicePct",
                    t("IVA outras faturas pago", "Other input VAT paid"),
                  )}
                  {Vat(
                    "barInvoicePct",
                    t("IVA faturas do bar pago", "Bar invoice VAT paid"),
                  )}
                  {Vat(
                    "refundLagMonths",
                    t("Prazo de reembolso", "Refund delay"),
                    "m",
                    0,
                    24,
                    1,
                  )}
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={vat.requestRefund}
                      onChange={(e) => setV("requestRefund", e.target.checked)}
                    />
                    {t(
                      "Pedir reembolso quando elegível",
                      "Request refund when eligible",
                    )}
                  </label>
                </div>
              </div>
              <div className="inline-metrics">
                <div>
                  <small>
                    {t(
                      "IVA não dedutível no CAPEX",
                      "Non-recoverable CAPEX VAT",
                    )}
                  </small>
                  <strong>{euro(vatResult.nonDeductibleCapex, lang)}</strong>
                </div>
                <div>
                  <small>{t("IVA autoliquidado", "Reverse-charged VAT")}</small>
                  <strong>{euro(vatResult.reverseChargeVAT, lang)}</strong>
                </div>
                <div>
                  <small>
                    {t(
                      "Crédito por recuperar no ano 1",
                      "Year-end VAT credit pending",
                    )}
                  </small>
                  <strong>
                    {euro(
                      vatResult.closingCredit + vatResult.pendingRefund,
                      lang,
                    )}
                  </strong>
                </div>
              </div>
              <h3 className="sub-title">
                {t(
                  "Caixa mensal de IVA — primeiro ano",
                  "Monthly VAT cash — first year",
                )}
              </h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {[
                        t("Mês", "Month"),
                        t("IVA cobrado", "Output VAT"),
                        t("IVA nos custos", "Input VAT"),
                        t("IVA entregue", "VAT paid"),
                        t("Reembolso", "Refund"),
                        t("Caixa acumulada", "Cumulative cash"),
                      ].map((x) => (
                        <th key={x}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vatResult.months.map((m) => (
                      <tr key={m.month}>
                        <td>{monthLabel(m.month - 1, lang)}</td>
                        {[
                          m.output,
                          m.input,
                          m.paid,
                          m.received,
                          m.cumulativeCash,
                        ].map((x, i) => (
                          <td className="numeric" key={i}>
                            {euro(x, lang)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="hint">
                {t(
                  "O prazo de reembolso altera a tesouraria do IVA, mas o custo de financiar essa espera ainda não entra no VAL. O investimento inicial não volta a somar IVA recuperável.",
                  "Refund timing changes VAT cash, but financing this delay is not yet charged to NPV. Recoverable VAT is not added again to initial investment.",
                )}
              </p>
            </>
          )}
          {tab === "investors" && (
            <>
              <h2 className="section-title">
                {t(
                  "Financiamento do projeto completo",
                  "Funding for the full project",
                )}
              </h2>
              <p className="lead">
                {t(
                  "O investimento e o serviço da dívida abaixo referem-se à Lda. que opera a onda e recebe a renda ou explora o bar.",
                  "The investment and debt service below belong to the company that operates the wave and receives rent or operates the bar.",
                )}
              </p>
              <div className="inline-metrics">
                <div>
                  <small>{t("Banco", "Bank")}</small>
                  <strong>{euro(c.bankAmt, lang)}</strong>
                </div>
                <div>
                  <small>{t("Capital próprio", "Equity")}</small>
                  <strong>{euro(c.eqAmt, lang)}</strong>
                </div>
                <div>
                  <small>
                    {t("Serviço dívida ano 1", "Year 1 debt service")}
                  </small>
                  <strong>{euro(c.first.debt, lang)}</strong>
                </div>
              </div>
              <h3 className="sub-title">
                {t("Sócios e investimento", "Shareholders and contributions")}
              </h3>
              <div className="investor-list">
                {wave.investors.map((inv) => (
                  <div className="investor-row" key={inv.id}>
                    <input
                      aria-label={t("Nome do investidor", "Investor name")}
                      value={inv.name}
                      onChange={(e) =>
                        changeInv(inv.id, "name", e.target.value)
                      }
                    />
                    <input
                      aria-label={inv.name + " %"}
                      type="number"
                      min="0"
                      max="100"
                      step=".5"
                      value={inv.pct}
                      onChange={(e) =>
                        changeInv(inv.id, "pct", Number(e.target.value))
                      }
                    />
                    <button
                      className="small-button"
                      title={t("Remover", "Remove")}
                      onClick={() => {
                        setScenario(null);
                        setWave((x) => ({
                          ...x,
                          investors: x.investors.filter((z) => z.id !== inv.id),
                        }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="small-button"
                  onClick={() => {
                    setScenario(null);
                    setWave((x) => ({
                      ...x,
                      investors: [
                        ...x.investors,
                        {
                          id: Date.now(),
                          name: t("Novo investidor", "New investor"),
                          pct: 0,
                        },
                      ],
                    }));
                  }}
                >
                  {t("+ Adicionar investidor", "+ Add investor")}
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("Parte", "Party")}</th>
                      <th>{t("Capital investido", "Cash invested")}</th>
                      <th>{t("Percentagem de capital", "Cash share")}</th>
                      <th>
                        {t("Participação económica", "Economic ownership")}
                      </th>
                      <th>{t("Dividendos ano 1", "Year 1 dividends")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [t("João", "João"), wave.joaoPct, w.ownJ],
                      [t("Rodrigo", "Rodrigo"), wave.rodrigoPct, w.ownR],
                      ...wave.investors.map((x, i) => [
                        x.name,
                        x.pct,
                        w.ownInv[i]?.own || 0,
                      ]),
                    ].map(([name, cashPct, ownership], i) => (
                      <tr key={i}>
                        <td>{name}</td>
                        <td className="numeric">
                          {euro((c.investment * cashPct) / 100, lang)}
                        </td>
                        <td className="numeric">
                          {decimal(cashPct, 1, lang)}%
                        </td>
                        <td className="numeric">
                          {decimal(ownership, 1, lang)}%
                        </td>
                        <td className="numeric">
                          {euro((c.first.divs * ownership) / 100, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {Math.abs(w.fundPct - 100) > 1e-8 && (
                <div className="warning">
                  {t(
                    "A soma de banco e capital próprio deve ser 100%; ajuste os investidores ou as percentagens de financiamento.",
                    "Bank and equity shares must total 100%; adjust investor or funding percentages.",
                  )}
                </div>
              )}
              <h3 className="sub-title">
                {t(
                  "Ponte de caixa para os sócios — ano 1",
                  "Cash bridge for shareholders — year 1",
                )}
              </h3>
              <div className="table-wrap">
                <table className="data-table">
                  <tbody>
                    {[
                      [t("EBITDA", "EBITDA"), c.first.ebitda],
                      [
                        t("− Imposto após juros", "− Tax after interest"),
                        -c.first.equityTax,
                      ],
                      [
                        t("− CAPEX de manutenção", "− Maintenance CAPEX"),
                        -c.first.maintCapex,
                      ],
                      [
                        t("− Serviço da dívida", "− Debt service"),
                        -c.first.debt,
                      ],
                      [t("= FCFE", "= FCFE"), c.first.fcfe],
                      [
                        t(
                          "Reforço de capital necessário",
                          "Additional equity required",
                        ),
                        c.first.capitalCall,
                      ],
                      [
                        t("Dividendos distribuídos", "Dividends paid"),
                        c.first.divs,
                      ],
                    ].map(([label, val]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td className="numeric">{euro(val, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="hint">
                {t(
                  "A TIR do projeto ignora fluxos de financiamento; a TIR do capital próprio inclui dívida, dividendos, reforços e saída.",
                  "Project IRR excludes financing cash flows; equity IRR includes debt, dividends, capital calls and exit.",
                )}
              </p>
            </>
          )}
          {tab === "projection" && (
            <>
              <h2 className="section-title">
                {t(
                  "Projeção consolidada da Lda.",
                  "Consolidated company projection",
                )}
              </h2>
              <p className="lead">
                {t(
                  "Receitas e custos crescem com as taxas introduzidas. O volume físico de sessões fica constante; o imposto é anual e simplificado.",
                  "Revenue and costs grow by the entered rates. Physical session volume is held constant; income tax is simplified and annual.",
                )}
              </p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {[
                        t("Ano", "Year"),
                        t("Receita", "Revenue"),
                        "OPEX",
                        "EBITDA",
                        t("Depreciação", "Depreciation"),
                        t("Imposto operacional", "Operating tax"),
                        "FCFF",
                        "FCFE",
                        t("Dividendos", "Dividends"),
                        t("Caixa final", "Ending cash"),
                      ].map((x) => (
                        <th key={x}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.years.map((y) => (
                      <tr key={y.y}>
                        <td>{y.y}</td>
                        {[
                          y.rev,
                          y.opex,
                          y.ebitda,
                          y.dep,
                          y.tax,
                          y.fcff,
                          y.fcfe,
                          y.divs,
                          y.cash,
                        ].map((x, i) => (
                          <td className="numeric" key={i}>
                            {euro(x, lang)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="sub-title">
                {t("Fluxos descontados e VAL", "Discounted cash flows and NPV")}
              </h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("Ano", "Year")}</th>
                      <th>FCFF</th>
                      <th>{t("Valor presente", "Present value")}</th>
                      <th>
                        {t(
                          "Valor presente acumulado",
                          "Cumulative present value",
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.years.map((y, i) => (
                      <tr key={y.y}>
                        <td>{y.y}</td>
                        <td className="numeric">{euro(y.fcff, lang)}</td>
                        <td className="numeric">
                          {euro(y.fcff / (1 + c.wacc) ** y.y, lang)}
                        </td>
                        <td className="numeric">
                          {euro(
                            sum(
                              c.years
                                .slice(0, i + 1)
                                .map((z) => z.fcff / (1 + c.wacc) ** z.y),
                            ),
                            lang,
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="total">
                      <td>{t("Total/VAL", "Total/NPV")}</td>
                      <td></td>
                      <td className="numeric">{euro(projectPV, lang)}</td>
                      <td className="numeric">{euro(c.npvProject, lang)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="note">
                VAL = {euro(projectPV, lang)}{" "}
                {t("de fluxos descontados", "of discounted cash flow")} +{" "}
                {euro(c.terminalValue / (1 + c.wacc) ** c.years.length, lang)}{" "}
                {t("de residual descontado", "of discounted residual")} −{" "}
                {euro(c.investment, lang)}{" "}
                {t("de investimento inicial", "initial investment")} ={" "}
                <strong className={signedClass(c.npvProject)}>
                  {euro(c.npvProject, lang)}
                </strong>
                .{" "}
                {t(
                  "O valor residual assumido é editável e começa em zero.",
                  "The assumed exit value is editable and starts at zero.",
                )}
              </div>
            </>
          )}
          {tab === "analysis" && (
            <>
              <h2 className="section-title">
                {t(
                  "Break-even do projeto completo",
                  "Whole-project break-even",
                )}
              </h2>
              <p className="lead">
                {t(
                  "Os gráficos variam apenas a procura de sessões de pico por dia; usam os preços, IVA, duração, capacidade, bar, energia e investimento atuais. O eixo horizontal é a média de participantes por dia aberto após sazonalidade.",
                  "The charts vary only peak session demand per day; they use current prices, VAT, duration, capacity, bar, energy and investment. The horizontal axis is average participants per open day after seasonality.",
                )}
              </p>
              <div className="chart-grid">
                <BreakChart
                  title={t("EBITDA anual", "Annual EBITDA")}
                  points={breakPoints}
                  keyName="ebitda"
                  current={wave.sessionsDay}
                  lang={lang}
                />
                <BreakChart
                  title={t("FCFE ano 1", "Year 1 FCFE")}
                  points={breakPoints}
                  keyName="fcfe"
                  current={wave.sessionsDay}
                  lang={lang}
                />
                <BreakChart
                  title={t("VAL do projeto", "Project NPV")}
                  points={breakPoints}
                  keyName="npv"
                  current={wave.sessionsDay}
                  lang={lang}
                />
              </div>
              <h3 className="sub-title">
                {t("Rentabilidade e risco", "Returns and risk")}
              </h3>
              <div className="inline-metrics">
                <div>
                  <small>WACC</small>
                  <strong>{percentage(c.wacc)}</strong>
                </div>
                <div>
                  <small>{t("TIR do projeto", "Project IRR")}</small>
                  <strong className={signedClass(c.projectIRR)}>
                    {percentage(c.projectIRR)}
                  </strong>
                </div>
                <div>
                  <small>{t("TIR do capital próprio", "Equity IRR")}</small>
                  <strong className={signedClass(c.equityIRR)}>
                    {percentage(c.equityIRR)}
                  </strong>
                </div>
              </div>
              <div className="split">
                <div>
                  <h3 className="sub-title">
                    {t("Alavancas atuais", "Current levers")}
                  </h3>
                  <div className="table-wrap">
                    <table className="data-table">
                      <tbody>
                        {[
                          [
                            t("Sessões de pico/dia", "Peak sessions/day"),
                            decimal(wave.sessionsDay, 1, lang),
                          ],
                          [
                            t("Lotação por sessão", "People per session"),
                            decimal(wave.ridersPerSession, 0, lang),
                          ],
                          [
                            t(
                              "Participantes médios/dia",
                              "Average participants/day",
                            ),
                            decimal(w.avgPeopleDay, 1, lang),
                          ],
                          [
                            t("Preço líquido médio", "Average net ticket"),
                            euro2(w.effectiveAvgPrice, lang),
                          ],
                          [
                            t("Custo de eletricidade", "Electricity price"),
                            decimal(wave.electricityRate, 3, lang) + " €/kWh",
                          ],
                          [
                            t("Carga média das bombas", "Average pump load"),
                            decimal(wave.avgPumpLoad, 0, lang) + "%",
                          ],
                          [
                            t("Renda do bar/mês", "Bar rent/month"),
                            euro(b.annRev / 12, lang),
                          ],
                        ].map(([a, z]) => (
                          <tr key={a}>
                            <td>{a}</td>
                            <td className="numeric">{z}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="sub-title">
                    {t("Hipóteses por validar", "Assumptions to validate")}
                  </h3>
                  <div className="note">
                    {t(
                      "A localização pode facilitar vendas, mas visitantes do teleférico e dos cruzeiros não são clientes garantidos. Validar preço final ao cliente, taxa média real de ocupação, consumo médio da máquina, tarifa elétrica, equipa por turnos, renda do concessionário, direitos de uso do local e tratamento de IVA da compra/instalação.",
                      "The location can support sales, but cable-car and cruise visitors are not guaranteed customers. Validate final customer prices, actual average occupancy, machine load, electricity tariff, shift staffing, concession rent, site rights and VAT treatment of purchase/installation.",
                    )}
                  </div>
                  <div className="note">
                    {t(
                      "O custo financeiro da espera pelo reembolso de IVA, datas da obra, pré-abertura e fundo de maneio operacional além do stock não entram no VAL.",
                      "Financing the VAT refund delay, construction timing, pre-opening and operating working capital beyond stock are outside NPV.",
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <footer className="footer">
        <span>
          {t(
            "Citywave Funchal · simulação ilustrativa e editável",
            "Citywave Funchal · editable illustrative model",
          )}
        </span>
        <span>
          <a href="./reports.html">{t("Relatórios fixos", "Fixed reports")}</a>{" "}
          ·{" "}
          <a href="./investor-guide.html">
            {t("Guia do investidor", "Investor guide")}
          </a>
        </span>
      </footer>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
