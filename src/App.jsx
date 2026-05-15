const { useState, useMemo, useCallback, useRef, useEffect } = React;

/* ═══════════════════════════════════════════════════════════
   CITYWAVE FUNCHAL — FINANCIAL SIMULATOR v5
   Updated with Discovery Call data (12 May 2026, Citywave Munich)
   B&W Editorial Design · All Values Editable
   ═══════════════════════════════════════════════════════════ */

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const SF = [0.55,0.50,0.65,0.75,0.90,1.0,1.0,1.0,0.90,0.75,0.60,0.50];
const fmt = n => n.toLocaleString("pt-PT",{maximumFractionDigits:0});
const fmtK = n => n>=1e6?(n/1e6).toFixed(2)+"M":n>=1000?(n/1000).toFixed(0)+"K":fmt(n);
const fd = (n,d=1) => n.toFixed(d);
const pct = n => (n*100).toFixed(1)+"%";

/* ── Financial helpers ── */
const npv = (rate, cashflows) => cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
const irr = (cashflows, guess = 0.1) => {
  let r = guess;
  for (let i = 0; i < 200; i++) {
    let f = 0, df = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const d = Math.pow(1 + r, t);
      f += cashflows[t] / d;
      if (t > 0) df += -t * cashflows[t] / (d * (1 + r));
    }
    if (Math.abs(f) < 1e-6) return r;
    if (df === 0) break;
    const nr = r - f / df;
    if (nr <= -0.99) { r = -0.99; continue; }
    if (Math.abs(nr - r) < 1e-8) return nr;
    r = nr;
  }
  return r;
};

/* Industry beta comparables — leisure / entertainment / experiential
   Source: average levered betas from Yahoo Finance / Damodaran (2025) */
const INDUSTRY_BETAS = [
  { name: "Vail Resorts (MTN)", beta: 1.42, sector: "Ski / Resort" },
  { name: "Six Flags (SIX)", beta: 1.65, sector: "Theme Park" },
  { name: "Cedar Fair (FUN)", beta: 1.38, sector: "Theme Park" },
  { name: "SeaWorld (PRKS)", beta: 1.48, sector: "Aquatic Park" },
  { name: "Planet Fitness (PLNT)", beta: 1.20, sector: "Fitness" },
  { name: "Topgolf Callaway (MODG)", beta: 1.55, sector: "Sports Leisure" },
  { name: "Damodaran — Recreation", beta: 1.18, sector: "Industry avg" },
];

/* Wave sizes — Citywave confirmed (May 2026): 10m system peaks at 600 kW
   (15 pumps × 40 kW). Smaller/larger sizes scaled proportionally. */
const WAVES = [
  {size:7.5,pumps:11,kwh:440,label:"7.5m",basePrice:1300000},
  {size:8,pumps:12,kwh:480,label:"8m",basePrice:1450000},
  {size:10,pumps:15,kwh:600,label:"10m",basePrice:1750000},
  {size:12,pumps:18,kwh:720,label:"12m",basePrice:2100000},
  {size:14,pumps:21,kwh:840,label:"14m",basePrice:2400000},
  {size:16,pumps:24,kwh:960,label:"16m",basePrice:2700000},
];

/* Site scenarios — from discovery call
   Primary: lawn next to skate park ~22m (under City Hall jurisdiction)
   Backup: pure concrete area ~34m (occasionally used for events) */
const SITES = [
  {id:"lawn", label:"Lawn (Primary)", length:22, maxWave:7.5, foundation:"Gravel (TBC)", sitePrep:120000, note:"~22m lawn next to skate park. Foundation type TBC by Citywave. Smaller wave only."},
  {id:"concrete", label:"Concrete (Backup)", length:34, maxWave:10, foundation:"Existing slab", sitePrep:60000, note:"~34m concrete area. Fits full 10m system but occasionally used for events."},
  {id:"custom", label:"Custom / Other", length:0, maxWave:16, foundation:"TBC", sitePrep:180000, note:"Manual configuration."},
];

const INIT = {
  scenario:"moderado",
  // Site
  siteId:"concrete",
  concessionYears:10, // target 10y, standard PT lease is 5y
  // Revenue — Honna model
  sessionMinutes:60, ridersPerSession:6, sessionsPerHour:1,
  beginnerPct:45, beginnerPrice:49,
  intermediatePct:30, intermediatePrice:39,
  advancedPct:15, advancedPrice:39,
  kidsPct:10, kidsPrice:35,
  privatePct:5, privatePrice:250,
  clinicPct:8, clinicPrice:75,
  bonoPct:20, bonoDiscount:15,
  rentalAdvancedPrice:10,
  rentalAdvancedPct:30,
  eventMonthly:3000,
  communityCards:50, communityPrice:120,
  sessionsDay:14,
  // CAPEX — restructured per Citywave confirmed pricing
  citywaveCost:1750000,   // 10m base — confirmed range €1.7-1.8M
  installation:89000,     // NEW: Citywave installation team (confirmed €89k)
  shipping:15000,         // NEW: 4-5 containers to Madeira (€2-3k each)
  saltwaterUplift:0,      // NEW: % over Citywave base (anti-corrosion + SW pumps, TBC)
  sitePrep:60000,         // From concrete site default; lawn would be higher
  plumbing:80000,
  electrical:60000,       // 400V, 1200A three-phase
  permits:30000,
  contingency:10,
  // Energy — Citywave confirmed (May 2026): 10m peaks at 600 kW
  waveSize:10, kwhMax:600, electricityRate:0.16, operatingHoursDay:10, avgPumpLoad:100,
  // Ops — updated per Citywave: maintenance optional ~1.5% of system price
  waterMonth:2500,        // 1500m³ initial + ~17.5 m³/week ongoing
  maintMonth:2250,        // ~1.5% of €1.75M / 12 = €2,187/mo
  insuranceYear:35000, staffCount:12,
  avgSalary:1200, ssRate:23.75, concessionRate:5, marketingMonth:2500,
  accountingMonth:800, miscMonth:1500, opDays:340,
  // Funding
  joaoPct:15, rodrigoPct:15, sweatPct:20, bankPct:35,
  loanRate:5.5, loanYears:10,
  investors:[{id:1,name:"Investidor A",pct:20},{id:2,name:"Investidor B",pct:15}],
  distPct:70, mgmtPct:0,
  // CAPM / WACC / FCF assumptions
  taxRate:22.5,            // PT IRC 21% + 1.5% derrama
  depreciationYears:15,    // equipamento + infra (vida util fiscal)
  maintCapexPct:2,         // % do CAPEX/ano (manutencao capitalizada)
  terminalGrowth:2,        // g% perpetuidade
  rfRate:3.0,              // PT 10y Bund ~3%
  marketPremium:6.0,       // equity risk premium EU
  unleveredBeta:0.85,      // bottom-up leisure (Damodaran)
  forecastYears:10,        // periodo explicito (=concessao)
};

/* ── Inline Editable Number ── */
function Editable({value, onChange, prefix="", suffix="", color="#000", size=14, bold=true, min=0, max=999999999, step=1}) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(String(value));
  const ref = useRef(null);

  useEffect(() => { if(editing && ref.current) { ref.current.select(); } }, [editing]);

  const commit = () => {
    let v = parseFloat(tmp.replace(/[^\d.,\-]/g,"").replace(",","."));
    if(isNaN(v)) v = value;
    v = Math.max(min, Math.min(max, v));
    if(step < 1) v = Math.round(v / step) * step;
    else v = Math.round(v / step) * step;
    onChange(v);
    setEditing(false);
  };

  if(editing) return (
    <input ref={ref} value={tmp}
      onChange={e=>setTmp(e.target.value)}
      onBlur={commit}
      onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);}}}
      style={{
        fontFamily:"'IBM Plex Mono',monospace", fontSize:size, fontWeight:bold?700:400,
        color, background:"transparent", border:"none", borderBottom:"2px solid #000",
        outline:"none", width: Math.max(50, String(value).length * (size*0.65) + 20),
        padding:"0 2px", textAlign:"right"
      }}
    />
  );

  return (
    <span onClick={()=>{setTmp(String(value));setEditing(true);}} style={{
      fontFamily:"'IBM Plex Mono',monospace", fontSize:size, fontWeight:bold?700:400, color,
      cursor:"pointer", borderBottom:"1px dashed rgba(0,0,0,0.2)", paddingBottom:1,
      transition:"border-color 0.2s"
    }} title="Clicar para editar">
      {prefix}{step<1?fd(value,2):fmt(value)}{suffix}
    </span>
  );
}

/* ── Row Component ── */
function Row({label, value, onChange, suffix="€", info, indent=false, highlight=false, total=false, step=1, min=0, max=999999999, prefix=""}) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"baseline",
      padding: total ? "10px 0 6px" : "6px 0",
      borderTop: total ? "2px solid #000" : "none",
      paddingLeft: indent ? 20 : 0,
      background: highlight ? "rgba(0,0,0,0.02)" : "transparent",
    }}>
      <div style={{ flex:1 }}>
        <span style={{ fontSize: total ? 13 : 12, fontWeight: total ? 800 : 500,
          color: total ? "#000" : "#333", letterSpacing: total ? 0.5 : 0,
          textTransform: total ? "uppercase" : "none",
          fontFamily:"'Instrument Sans',sans-serif"
        }}>{label}</span>
        {info && <div style={{ fontSize:9.5, color:"#999", marginTop:1, fontFamily:"'Instrument Sans',sans-serif" }}>{info}</div>}
      </div>
      <div>
        {onChange ? (
          <Editable value={value} onChange={onChange} suffix={suffix} size={total?16:13} bold={total} min={min} max={max} step={step} prefix={prefix} />
        ) : (
          <span style={{
            fontFamily:"'IBM Plex Mono',monospace", fontSize:total?16:13,
            fontWeight:total?800:600, color: value < 0 ? "#c00" : "#000"
          }}>{prefix}{step<1?fd(value,2):fmt(value)}{suffix}</span>
        )}
      </div>
    </div>
  );
}

/* ── Section ── */
function Section({title, children, number, open=true}) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div style={{ marginBottom:2 }}>
      <button onClick={()=>setIsOpen(!isOpen)} style={{
        display:"flex", alignItems:"center", gap:10, width:"100%", padding:"14px 0",
        background:"transparent", border:"none", borderBottom:"1px solid #e0e0e0", cursor:"pointer",
        textAlign:"left"
      }}>
        {number && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700,
          color:"#fff", background:"#000", borderRadius:99, width:22, height:22,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
        }}>{number}</span>}
        <span style={{ fontFamily:"'Instrument Sans',sans-serif", fontSize:14, fontWeight:700,
          letterSpacing:0.3, textTransform:"uppercase", color:"#000", flex:1
        }}>{title}</span>
        <span style={{ fontSize:16, color:"#999", transition:"transform 0.2s",
          transform:isOpen?"rotate(0)":"rotate(-90deg)"
        }}>▾</span>
      </button>
      {isOpen && <div style={{ padding:"8px 0 16px" }}>{children}</div>}
    </div>
  );
}

/* ── Bar ── */
function Bar({label,value,maxVal,dark=false}) {
  const w = maxVal > 0 ? Math.min((value/maxVal)*100,100) : 0;
  return (
    <div style={{ marginBottom:6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:2 }}>
        <span style={{ color:"#666", fontFamily:"'Instrument Sans',sans-serif" }}>{label}</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, color:"#000" }}>{fmt(Math.round(value))}€</span>
      </div>
      <div style={{ height:4, borderRadius:2, background:"#eee" }}>
        <div style={{ height:4, borderRadius:2, background:dark?"#000":"#999", width:`${w}%`, transition:"width 0.4s ease" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ */
function App() {
  const [s, setS] = useState(INIT);
  const [tab, setTab] = useState("overview");
  const u = useCallback((k,v) => setS(p=>({...p,[k]:v})), []);
  const uInv = useCallback((id,f,v)=>setS(p=>({...p,investors:p.investors.map(i=>i.id===id?{...i,[f]:v}:i)})),[]);
  const addInv = useCallback(()=>setS(p=>({...p,investors:[...p.investors,{id:Date.now(),name:`Investidor ${String.fromCharCode(65+p.investors.length)}`,pct:5}]})),[]);
  const rmInv = useCallback((id)=>setS(p=>({...p,investors:p.investors.filter(i=>i.id!==id)})),[]);

  // Site scenario selector — applies preset
  const selectSite = useCallback((siteId) => {
    const site = SITES.find(x=>x.id===siteId);
    if(!site) return;
    setS(p => {
      const newWaveSize = (site.id !== "custom" && p.waveSize > site.maxWave) ? site.maxWave : p.waveSize;
      const newWave = WAVES.find(w=>w.size===newWaveSize);
      return {
        ...p,
        siteId,
        waveSize: newWaveSize,
        citywaveCost: newWave?.basePrice || p.citywaveCost,
        kwhMax: newWaveSize !== p.waveSize ? (newWave?.kwh || p.kwhMax) : p.kwhMax,
        sitePrep: site.id === "custom" ? p.sitePrep : site.sitePrep,
      };
    });
  }, []);

  const calc = useMemo(() => {
    const wc = WAVES.find(w=>w.size===s.waveSize)||WAVES[2];
    const site = SITES.find(x=>x.id===s.siteId)||SITES[1];
    const kwhPeak = s.kwhMax || wc.kwh;
    const effKwh = kwhPeak * (s.avgPumpLoad/100);
    const dailyKwh = effKwh * s.operatingHoursDay;
    const annKwh = dailyKwh * s.opDays;
    const annEnergy = annKwh * s.electricityRate;

    // Citywave equipment cost with saltwater uplift if active
    const citywaveTotal = s.citywaveCost * (1 + s.saltwaterUplift/100);
    const baseCAPEX = citywaveTotal + s.installation + s.shipping + s.sitePrep + s.plumbing + s.electrical + s.permits;
    const contAmt = baseCAPEX*(s.contingency/100);
    const capex = baseCAPEX + contAmt;

    const invPct = s.investors.reduce((a,i)=>a+i.pct,0);
    const eqPct = s.joaoPct+s.rodrigoPct+invPct;
    const fundPct = eqPct+s.bankPct;
    const bankAmt = capex*(s.bankPct/100);
    const joaoAmt = capex*(s.joaoPct/100);
    const rodrigoAmt = capex*(s.rodrigoPct/100);
    const invAmts = s.investors.map(i=>({...i,amt:capex*(i.pct/100)}));
    const eqAmt = capex*(eqPct/100);

    const ownBase = eqPct+s.sweatPct;
    const ownJ = ownBase>0?((s.joaoPct+s.sweatPct/2)/ownBase)*100:0;
    const ownR = ownBase>0?((s.rodrigoPct+s.sweatPct/2)/ownBase)*100:0;
    const ownInv = s.investors.map(i=>({...i,own:ownBase>0?(i.pct/ownBase)*100:0,amt:capex*(i.pct/100)}));

    const mr = (s.loanRate/100)/12;
    const np = s.loanYears*12;
    const mp = bankAmt>0&&mr>0?bankAmt*(mr*Math.pow(1+mr,np))/(Math.pow(1+mr,np)-1):0;
    const annDebt = mp*12;

    const annStaff = (s.staffCount*s.avgSalary*(1+s.ssRate/100))*14;
    const annWater = s.waterMonth*12;
    const annMaint = s.maintMonth*12;
    const annMktg = s.marketingMonth*12;
    const annAcct = s.accountingMonth*12;
    const annMisc = s.miscMonth*12;

    const wtdPrice = (s.beginnerPct*s.beginnerPrice + s.intermediatePct*s.intermediatePrice +
      s.advancedPct*s.advancedPrice + s.kidsPct*s.kidsPrice) / 100;
    const effectiveAvgPrice = wtdPrice * (1 - (s.bonoPct/100) * (s.bonoDiscount/100));
    const peoplePerDay = s.sessionsDay * s.ridersPerSession;
    const dailySessionRev = peoplePerDay * effectiveAvgPrice;
    const dailyClinicRev = peoplePerDay * (s.clinicPct/100) * s.clinicPrice;
    const dailyPrivateRev = s.sessionsDay * (s.privatePct/100) * s.privatePrice;
    const interAdvPeople = peoplePerDay * ((s.intermediatePct + s.advancedPct)/100);
    const dailyRentalRev = interAdvPeople * (s.rentalAdvancedPct/100) * s.rentalAdvancedPrice;
    const annCommunityRev = s.communityCards * s.communityPrice;

    const mRev = MONTHS.map((_,i)=>{
      const f=SF[i]; const d=[31,28,31,30,31,30,31,31,30,31,30,31][i];
      const od=Math.round(d*(s.opDays/365));
      const dayRev = dailySessionRev + dailyClinicRev + dailyPrivateRev + dailyRentalRev;
      return Math.round(dayRev * f * od) + Math.round(s.eventMonthly * f) + Math.round(annCommunityRev/12);
    });
    const annRev = mRev.reduce((a,b)=>a+b,0);
    const annConc = annRev*(s.concessionRate/100);
    const annMgmt = annRev*(s.mgmtPct/100);
    const opex = annEnergy+annWater+annMaint+s.insuranceYear+annStaff+annMktg+annAcct+annMisc+annConc;

    const mCost = MONTHS.map((_,i)=>{
      const f=SF[i];
      const eM=effKwh*s.operatingHoursDay*s.electricityRate*(s.opDays/12)*(f*0.5+0.5);
      return eM+annStaff/12+(annWater+annMaint+s.insuranceYear+annMktg+annAcct+annMisc)/12+mRev[i]*(s.concessionRate/100);
    });
    const mProfit = MONTHS.map((_,i)=>mRev[i]-mCost[i]);

    const ebitda=annRev-opex;
    const margin=annRev>0?ebitda/annRev:0;
    const net=ebitda-annDebt;
    const payback=ebitda>0?capex/ebitda:Infinity;

    const dist0=Math.max(0,net-annMgmt);
    const divs=dist0*(s.distPct/100);
    const reinv=dist0*((100-s.distPct)/100);
    const jProfit=divs*(ownJ/100)+annMgmt/2;
    const rProfit=divs*(ownR/100)+annMgmt/2;
    const invRet=ownInv.map(i=>({...i,profit:divs*(i.own/100),roi:i.amt>0?(divs*(i.own/100)/i.amt)*100:0,pb:i.amt>0&&divs*(i.own/100)>0?i.amt/(divs*(i.own/100)):Infinity}));

    const proj=Array.from({length:7},(_,yr)=>{
      const g=1+yr*0.03;const rev=annRev*g;const ox=opex*(1+yr*0.02);const eb=rev-ox;const nt=eb-annDebt;
      const mg=rev*(s.mgmtPct/100);const ds=Math.max(0,nt-mg)*(s.distPct/100);
      return{y:yr+1,rev,opex:ox,ebitda:eb,net:nt,divs:ds,j:ds*(ownJ/100)+mg/2,r:ds*(ownR/100)+mg/2,inv:ownInv.map(i=>({n:i.name,p:ds*(i.own/100)}))};
    });

    let cJ=-joaoAmt,cR=-rodrigoAmt;
    const cI=invAmts.map(i=>({...i,c:-i.amt}));
    const cumRet=proj.map(yr=>{cJ+=yr.j;cR+=yr.r;yr.inv.forEach((v,i)=>{if(cI[i])cI[i].c+=v.p;});
      return{y:yr.y,j:cJ,r:cR,inv:cI.map(ci=>({n:ci.name,c:ci.c}))};});

    const annClinicRev = dailyClinicRev * s.opDays * SF.reduce((a,b)=>a+b,0) / 12;
    const annPrivateRev = dailyPrivateRev * s.opDays * SF.reduce((a,b)=>a+b,0) / 12;
    const annRentalRev = dailyRentalRev * s.opDays * SF.reduce((a,b)=>a+b,0) / 12;
    const annEventRev = s.eventMonthly * SF.reduce((a,b)=>a+b,0);
    const revBk=[
      {l:"Sessoes (per person)",v:Math.round(annRev - annClinicRev - annPrivateRev - annRentalRev - annEventRev - annCommunityRev)},
      {l:"Surf Clinic",v:Math.round(annClinicRev)},
      {l:"Onda Privada",v:Math.round(annPrivateRev)},
      {l:"Aluguer Equip.",v:Math.round(annRentalRev)},
      {l:"Eventos",v:Math.round(annEventRev)},
      {l:"Community Cards",v:annCommunityRev},
    ];
    const costBk=[
      {l:"Energia",v:annEnergy},{l:"Pessoal",v:annStaff},{l:"Manutencao",v:annMaint},
      {l:"Agua",v:annWater},{l:"Seguro",v:s.insuranceYear},{l:"Marketing",v:annMktg},
      {l:"Concessao",v:annConc},{l:"Outros",v:annAcct+annMisc},
    ];

    const energyComp = WAVES.map(w=>{const peak = w.size===s.waveSize ? kwhPeak : w.kwh; const k=peak*(s.avgPumpLoad/100)*s.operatingHoursDay;return{...w,kwh:peak,dKwh:k,aCost:k*s.opDays*s.electricityRate};});
    const costPerSess = s.sessionsDay>0?(dailyKwh*s.electricityRate)/s.sessionsDay:0;

    const slotsPerHour = s.sessionsPerHour;
    const ridersPerHour = slotsPerHour * s.ridersPerSession;
    const maxSlotsDay = slotsPerHour * s.operatingHoursDay;
    const maxRidersDay = ridersPerHour * s.operatingHoursDay;
    const avgOccupancy = maxSlotsDay > 0 ? Math.min((s.sessionsDay / maxSlotsDay) * 100, 100) : 0;
    const avgPeopleDay = s.sessionsDay * s.ridersPerSession;
    const energyCostPerPerson = avgPeopleDay > 0 ? (dailyKwh * s.electricityRate) / avgPeopleDay : 0;

    const capTableData = [
      {name:"Joao Febrer",cash:joaoAmt,cashPct:s.joaoPct,ownership:ownJ,type:"Fundador+Sweat"},
      {name:"Rodrigo Farinha",cash:rodrigoAmt,cashPct:s.rodrigoPct,ownership:ownR,type:"Fundador+Sweat"},
      ...ownInv.map(i=>({name:i.name,cash:i.amt,cashPct:i.pct,ownership:i.own,type:"Investidor"})),
    ];

    // Capex breakdown for display
    const capexBk = [
      {l:`Citywave ${s.waveSize}m (${s.saltwaterUplift>0?"saltwater":"freshwater"})`, v: citywaveTotal},
      {l:"Instalacao (Citywave)", v: s.installation},
      {l:"Shipping (4-5 containers)", v: s.shipping},
      {l:"Preparacao do local", v: s.sitePrep},
      {l:"Canalizacao", v: s.plumbing},
      {l:"Eletrica (400V/1200A)", v: s.electrical},
      {l:"Licencas e projeto", v: s.permits},
      {l:`Contingencia (${s.contingency}%)`, v: contAmt},
    ];

    // Site fit check
    const siteFitsWave = site.id === "custom" || s.waveSize <= site.maxWave;

    /* ═══════ CAPM / WACC ═══════ */
    const tax = s.taxRate/100;
    const eqCashPct = s.joaoPct + s.rodrigoPct + invPct;  // ignora sweat (nao e cash)
    const dRatio = (s.bankPct) / (eqCashPct + s.bankPct || 1);
    const eRatio = 1 - dRatio;
    const DE = eRatio > 0 ? dRatio / eRatio : 0;
    const leveredBeta = s.unleveredBeta * (1 + (1 - tax) * DE);
    const costOfEquity = (s.rfRate + leveredBeta * s.marketPremium) / 100;
    const costOfDebtAT = (s.loanRate/100) * (1 - tax);
    const wacc = eRatio * costOfEquity + dRatio * costOfDebtAT;

    /* ═══════ Free Cash Flow ═══════ */
    const depreciation = capex / s.depreciationYears;
    const maintCapex = capex * (s.maintCapexPct/100);
    const tg = s.terminalGrowth/100;
    const N = Math.max(5, Math.min(15, s.forecastYears));
    const fcfYears = Array.from({length:N},(_,yr)=>{
      const g = Math.pow(1.03, yr);                  // revenue +3%/y
      const cg = Math.pow(1.02, yr);                 // costs +2%/y
      const rev = annRev * g;
      const ox = opex * cg;
      const ebitdaY = rev - ox;
      const dep = yr < s.depreciationYears ? depreciation : 0;
      const ebitY = ebitdaY - dep;
      const taxY = Math.max(0, ebitY * tax);
      const nopat = ebitY - taxY;
      const capexY = yr === 0 ? 0 : maintCapex;       // year 0 = operations start (initial capex separate)
      const fcff = nopat + dep - capexY;
      return { y: yr+1, rev, opex:ox, ebitda:ebitdaY, dep, ebit:ebitY, tax:taxY, nopat, maintCapex:capexY, fcff };
    });
    const lastFcff = fcfYears[fcfYears.length-1].fcff;
    const terminalValue = wacc > tg ? lastFcff * (1 + tg) / (wacc - tg) : 0;
    const pvFcff = fcfYears.reduce((a,y,i) => a + y.fcff / Math.pow(1+wacc, i+1), 0);
    const pvTerminal = terminalValue / Math.pow(1+wacc, N);
    const enterpriseValue = pvFcff + pvTerminal;
    const npvProject = enterpriseValue - capex;
    const projectCashflows = [-capex, ...fcfYears.slice(0,-1).map(y=>y.fcff), fcfYears[fcfYears.length-1].fcff + terminalValue];
    const projectIRR = irr(projectCashflows);

    /* Equity IRR (alavancada) — fluxo de caixa apos divida */
    const equityInvested = capex * (eqCashPct/100);
    const equityCashflows = [-equityInvested, ...fcfYears.map(y => y.fcff - annDebt)];
    equityCashflows[equityCashflows.length-1] += terminalValue - bankAmt * Math.pow(1 - 1/Math.max(1,s.loanYears), N) * 0;  // bond approx 0 residual
    const equityIRR = irr(equityCashflows);

    /* ═══════ Revenue Sensitivity (% do base case) ═══════ */
    const revScenarios = [0.50, 0.75, 0.90, 1.00, 1.10, 1.25, 1.50].map(p => {
      const rev = annRev * p;
      // custos variaveis escalam com receita (energia 50%, concessao 100%, marketing 50%)
      const varCost = annEnergy * (0.5 + 0.5*p) + annConc*p + annMktg*(0.5 + 0.5*p);
      const fixedCost = opex - annEnergy - annConc - annMktg;
      const opx = fixedCost + varCost;
      const ebitdaS = rev - opx;
      const netS = ebitdaS - annDebt;
      const marginS = rev>0 ? ebitdaS/rev : 0;
      const dep0 = depreciation;
      const ebitS = ebitdaS - dep0;
      const taxS = Math.max(0, ebitS*tax);
      const fcfS = ebitS - taxS + dep0 - maintCapex;
      const pb = ebitdaS>0 ? capex/ebitdaS : Infinity;
      return { p, rev, opx, ebitda:ebitdaS, margin:marginS, net:netS, fcf:fcfS, payback:pb };
    });

    /* Two-way sensitivity: receita × preco eletricidade → EBITDA */
    const sensRevPcts = [0.70, 0.85, 1.00, 1.15, 1.30];
    const sensElec = [0.10, 0.13, 0.156, 0.18, 0.22];
    const sensMatrix = sensElec.map(er => sensRevPcts.map(rp => {
      const rev = annRev * rp;
      const en = (dailyKwh * er) * s.opDays;
      const varCost = en + annConc*rp + annMktg*(0.5 + 0.5*rp);
      const fixedCost = opex - annEnergy - annConc - annMktg;
      return rev - (fixedCost + varCost);
    }));

    /* ═══════ Bond / Stable Investment Comparison ═══════ */
    const benchmarks = [
      { name: "PT 10y Govt Bond", yield: s.rfRate/100, risk: "Muito baixo" },
      { name: "EU IG Corp Bond (AA)", yield: (s.rfRate+1.5)/100, risk: "Baixo" },
      { name: "EU HY Corp Bond (BB)", yield: (s.rfRate+5.0)/100, risk: "Medio" },
      { name: "S&P 500 (historico)", yield: (s.rfRate+s.marketPremium)/100, risk: "Alto" },
      { name: "MSCI Europe (historico)", yield: 0.08, risk: "Alto" },
    ];
    const projectAnnReturn = isFinite(projectIRR) ? projectIRR : 0;
    const equityAnnReturn = isFinite(equityIRR) ? equityIRR : 0;
    const benchmarkRows = benchmarks.map(b => ({
      ...b,
      excessProject: projectAnnReturn - b.yield,
      excessEquity: equityAnnReturn - b.yield,
      yearsToDouble: b.yield > 0 ? 0.72 / b.yield : Infinity,
      // 10k investido apos 10 anos
      val10k10y: 10000 * Math.pow(1 + b.yield, 10),
    }));

    /* Sharpe-like ratio (proxy) — usa premio sobre rf dividido por desvio assumido */
    const projectVol = 0.18;  // assumido ~18% (private equity / experiential leisure)
    const sharpe = projectVol > 0 ? (projectAnnReturn - s.rfRate/100) / projectVol : 0;

    /* Industry beta avg */
    const industryAvgBeta = INDUSTRY_BETAS.reduce((a,b)=>a+b.beta,0) / INDUSTRY_BETAS.length;

    return{wc,site,siteFitsWave,citywaveTotal,capexBk,
      effKwh,dailyKwh,annKwh,annEnergy,costPerSess,capex,baseCAPEX,contAmt,eqAmt,eqPct,invPct,fundPct,
      bankAmt,joaoAmt,rodrigoAmt,invAmts,ownJ,ownR,ownInv,mp,annDebt,annStaff,opex,annConc,annMgmt,
      annRev,mRev,mCost,mProfit,ebitda,margin,net,payback,dist0,divs,reinv,jProfit,rProfit,invRet,
      proj,cumRet,revBk,costBk,energyComp,capTableData,
      slotsPerHour,ridersPerHour,maxSlotsDay,maxRidersDay,avgOccupancy,avgPeopleDay,
      effectiveAvgPrice,energyCostPerPerson,wtdPrice,peoplePerDay,
      // Financial model
      tax,dRatio,eRatio,DE,leveredBeta,costOfEquity,costOfDebtAT,wacc,
      depreciation,maintCapex,fcfYears,terminalValue,pvFcff,pvTerminal,enterpriseValue,
      npvProject,projectIRR,equityIRR,equityInvested,projectCashflows,equityCashflows,
      revScenarios,sensRevPcts,sensElec,sensMatrix,
      benchmarks,benchmarkRows,projectAnnReturn,equityAnnReturn,projectVol,sharpe,
      industryAvgBeta,
      };
  }, [s]);

  const fundAlert = Math.abs(calc.fundPct-100)>0.5;
  const tabs=[{id:"overview",l:"Resumo"},{id:"revenue",l:"Receitas"},{id:"energy",l:"Energia"},{id:"investors",l:"Investidores"},{id:"projection",l:"P&L"},{id:"analise",l:"Analise"}];

  return (
    <div className="root-container" style={{ background:"#fff", color:"#000", fontFamily:"'Instrument Sans','Helvetica Neue',sans-serif", minHeight:"100vh", maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        input[type=range]{-webkit-appearance:none;height:3px;background:#ddd;border-radius:2px;outline:none;width:100%}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#000;cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 1px #000}
        input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#000;cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 1px #000}
        ::selection{background:#000;color:#fff}
        *{box-sizing:border-box}
        table{max-width:100%}

        @media(max-width:900px){
          .grid-main{grid-template-columns:1fr !important;gap:16px !important}
          .grid-main aside{border-right:none !important;padding-right:0 !important;border-bottom:1px solid #eee;padding-bottom:16px}
        }

        @media(max-width:700px){
          .root-container{padding:14px 12px !important;max-width:100% !important}
          h1{font-size:22px !important}
          .kpi-grid{grid-template-columns:repeat(2,1fr) !important}
          .tabs-bar{overflow-x:auto;scrollbar-width:none}
          .tabs-bar::-webkit-scrollbar{display:none}
          .tabs-bar button{flex-shrink:0;padding:7px 12px !important;font-size:10px !important}
          .analise-grid-2{grid-template-columns:1fr !important}
          .analise-grid-3{grid-template-columns:1fr 1fr !important}
          .analise-risk-grid{grid-template-columns:1fr 1fr !important}
          .twocol-charts{grid-template-columns:1fr !important}
          table{font-size:10px !important}
          .scroll-x{overflow-x:auto;-webkit-overflow-scrolling:touch}
          .header-row{flex-direction:column;align-items:flex-start !important}
        }

        @media(max-width:480px){
          .kpi-grid{grid-template-columns:1fr 1fr !important}
          .wave-grid{grid-template-columns:repeat(3,1fr) !important}
          .analise-risk-grid{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ borderBottom:"3px solid #000", paddingBottom:16, marginBottom:16 }}>
        <div className="header-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:4, textTransform:"uppercase", color:"#999", fontWeight:600 }}>Surf Clube da Madeira</div>
            <h1 style={{ margin:"4px 0 0", fontSize:28, fontWeight:800, letterSpacing:-0.5, lineHeight:1 }}>Citywave Funchal · v5</h1>
            <div style={{ fontSize:11, color:"#666", marginTop:4 }}>Atualizado com dados confirmados pela Citywave · Reuniao 12 Mai 2026 · Onda {s.waveSize}m · {calc.wc.pumps} bombas</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800, lineHeight:1 }}>{fmtK(calc.annRev)}€</div>
            <div style={{ fontSize:10, color:"#666" }}>Receita anual estimada</div>
          </div>
        </div>
      </header>

      {/* ── DISCOVERY CALL BANNER ── */}
      <div style={{ background:"#f5f5f3", border:"1px solid #e0e0e0", borderLeft:"3px solid #000", padding:"10px 14px", marginBottom:24, fontSize:11, lineHeight:1.5, color:"#444" }}>
        <strong style={{color:"#000",letterSpacing:0.5,textTransform:"uppercase",fontSize:10}}>DADOS CITYWAVE CONFIRMADOS · 12 Mai 2026</strong> ·
        Sistema 10m: €1,7-1,8M · Instalacao: €89k · Shipping Madeira: ~€15k · Sem royalties/licencas · Manutencao opcional ~1,5%/ano ·
        Pagamento: 15/40/25/15/5 · Footprint ideal 34×28m · 400V 1200A · 1500m³ agua inicial ·
        <strong style={{color:"#c00"}}> Pendente: preco saltwater, fundacao no relvado</strong>
      </div>

      {/* ── KPIs ── */}
      <div className="kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:1, background:"#000", marginBottom:24, borderRadius:2, overflow:"hidden" }}>
        {[
          {l:"EBITDA",v:`${fmtK(calc.ebitda)}€`,sub:pct(calc.margin),neg:calc.ebitda<0},
          {l:"APOS DIVIDA",v:`${fmtK(calc.net)}€`,neg:calc.net<0},
          {l:"PAYBACK",v:calc.payback<50?`${fd(calc.payback)} anos`:"N/A"},
          {l:"ENERGIA/ANO",v:`${fmtK(calc.annEnergy)}€`,sub:`${fmt(Math.round(calc.dailyKwh))} kWh/dia`},
          {l:"CAPEX",v:`${fmtK(calc.capex)}€`},
          {l:"DIVIDENDOS",v:`${fmtK(calc.divs)}€`,sub:`${s.distPct}% distribuido`},
        ].map((m,i) => (
          <div key={i} style={{ background:"#fff", padding:"12px 14px", textAlign:"center" }}>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", fontWeight:600, marginBottom:4 }}>{m.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:m.neg?"#c00":"#000" }}>{m.v}</div>
            {m.sub && <div style={{ fontSize:9, color:"#999", marginTop:2 }}>{m.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="tabs-bar" style={{ display:"flex", gap:0, borderBottom:"2px solid #000", marginBottom:20 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"8px 18px", background:tab===t.id?"#000":"transparent",
            color:tab===t.id?"#fff":"#666", border:"none", fontSize:11,
            fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", cursor:"pointer",
            fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.15s",
            borderTopLeftRadius:2, borderTopRightRadius:2,
          }}>{t.l}</button>
        ))}
      </div>

      <div className="grid-main" style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:24, alignItems:"start" }}>

        {/* ═══ LEFT ═══ */}
        <aside style={{ borderRight:"1px solid #eee", paddingRight:20 }}>

          {/* SITE & CONFIG */}
          <Section title="Local e Configuracao" number="0">
            <div style={{ fontSize:10, color:"#999", marginBottom:8 }}>Selecione o cenario do local (Jardins do Teleferico)</div>
            <div style={{ display:"grid", gap:6, marginBottom:10 }}>
              {SITES.map(site=>(
                <button key={site.id} onClick={()=>selectSite(site.id)} style={{
                  padding:"10px 12px", borderRadius:4, border:s.siteId===site.id?"2px solid #000":"1px solid #ddd",
                  background:s.siteId===site.id?"#000":"#fff", color:s.siteId===site.id?"#fff":"#333",
                  cursor:"pointer", textAlign:"left", transition:"all 0.15s"
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <strong style={{ fontSize:12 }}>{site.label}</strong>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, opacity:0.7 }}>
                      {site.length>0?`${site.length}m · max ${site.maxWave}m`:"manual"}
                    </span>
                  </div>
                  <div style={{ fontSize:9.5, opacity:0.75, marginTop:3, lineHeight:1.4 }}>{site.note}</div>
                </button>
              ))}
            </div>
            {!calc.siteFitsWave && (
              <div style={{ background:"#fee", border:"1px solid #fcc", borderRadius:3, padding:"6px 10px", fontSize:10, color:"#c00", marginBottom:8 }}>
                ⚠ Onda {s.waveSize}m nao cabe neste local (max {calc.site.maxWave}m). Reduza tamanho ou mude de local.
              </div>
            )}
            <Row label="Anos de concessao" value={s.concessionYears} onChange={v=>u("concessionYears",v)} suffix=" anos" info="Standard PT: 5 anos · Objetivo: 10 anos para justificar investimento" min={3} max={25} />
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:10, marginTop:8, fontSize:10, lineHeight:1.6, color:"#555" }}>
              <strong style={{color:"#000"}}>Fundacao:</strong> {calc.site.foundation}<br/>
              <strong style={{color:"#000"}}>Carga ao solo:</strong> 2,5 ton/m² (Citywave confirmado)<br/>
              <strong style={{color:"#000"}}>Ruido:</strong> 78-79 dB junto a piscina, desprezavel a 10-20m
            </div>
          </Section>

          {/* WAVE SIZE */}
          <Section title="Tamanho da Onda" number="1">
            <div className="wave-grid" style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:3, marginBottom:12 }}>
              {WAVES.map(w=>{
                const disabled = calc.site.id !== "custom" && w.size > calc.site.maxWave;
                return (
                  <button key={w.size} disabled={disabled}
                    onClick={()=>{u("waveSize",w.size); u("citywaveCost",w.basePrice); u("kwhMax",w.kwh);}}
                    style={{
                      padding:"8px 2px", borderRadius:4,
                      border:s.waveSize===w.size?"2px solid #000":"1px solid #ddd",
                      background:s.waveSize===w.size?"#000":"#fff",
                      color:s.waveSize===w.size?"#fff":(disabled?"#ccc":"#333"),
                      cursor:disabled?"not-allowed":"pointer", textAlign:"center", transition:"all 0.15s",
                      opacity: disabled?0.4:1
                    }}
                    title={disabled?`Nao cabe no local ${calc.site.label}`:""}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800 }}>{w.label}</div>
                    <div style={{ fontSize:7.5, opacity:0.7 }}>{w.pumps}b · {fmtK(w.basePrice)}€</div>
                  </button>
                );
              })}
            </div>
            <Row label="Potencia max" value={s.kwhMax} onChange={v=>u("kwhMax",v)} suffix=" kW" info="Citywave confirmou max 600 kW (10m). Editavel para ajustar a confirmacao final." min={100} max={1200} step={10} />
            <Row label="Carga media bombas" value={s.avgPumpLoad} onChange={v=>u("avgPumpLoad",v)} suffix="%" info="100% = potencia max · Iniciantes ~50-60%" min={30} max={100} step={5} />
            <Row label="Preco eletricidade" value={s.electricityRate} onChange={v=>u("electricityRate",v)} suffix=" €/kWh" info="PT comercial: ~0.156€/kWh" min={0.05} max={0.40} step={0.01} />
            <Row label="Horas operacao/dia" value={s.operatingHoursDay} onChange={v=>u("operatingHoursDay",v)} suffix="h" min={4} max={16} />
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:10, marginTop:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, lineHeight:1.8 }}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Consumo/dia</span><strong>{fmt(Math.round(calc.dailyKwh))} kWh</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Custo/dia</span><strong>{fmt(Math.round(calc.dailyKwh*s.electricityRate))}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Custo/sessao</span><strong>{fd(calc.costPerSess,2)}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Custo/ano</span><strong>{fmt(Math.round(calc.annEnergy))}€</strong></div>
            </div>
          </Section>

          {/* REVENUE */}
          <Section title="Receitas" number="2">
            <div style={{ fontSize:10, color:"#999", marginBottom:6 }}>Modelo Honna · Preco por pessoa por nivel</div>
            <Row label="Duracao sessao" value={s.sessionMinutes} onChange={v=>u("sessionMinutes",v)} suffix=" min" min={15} max={90} step={15} />
            <Row label="Pessoas por grupo" value={s.ridersPerSession} onChange={v=>u("ridersPerSession",v)} suffix="" min={1} max={10} />
            <Row label="Sessoes por hora" value={s.sessionsPerHour} onChange={v=>u("sessionsPerHour",v)} suffix="" min={1} max={4} />
            <Row label="Sessoes vendidas/dia" value={s.sessionsDay} onChange={v=>u("sessionsDay",v)} suffix="" min={1} max={50} info={`= ${calc.avgPeopleDay} pessoas · ${fd(calc.avgOccupancy,0)}% ocupacao`} />
            <div style={{ background:"#f5f5f5", borderRadius:4, padding:6, margin:"4px 0 8px", fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Max/dia</span><strong>{calc.maxRidersDay} pessoas</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Preco medio</span><strong>{fd(calc.effectiveAvgPrice,1)}€/pessoa</strong></div>
            </div>
            <div style={{ fontSize:10, fontWeight:700, marginTop:4, marginBottom:4 }}>Precos por nivel:</div>
            <Row label="Principiante" value={s.beginnerPrice} onChange={v=>u("beginnerPrice",v)} suffix="€" min={15} max={100} info={`${s.beginnerPct}% dos clientes`} />
            <Row label="Intermedio" value={s.intermediatePrice} onChange={v=>u("intermediatePrice",v)} suffix="€" min={15} max={100} info={`${s.intermediatePct}% dos clientes`} />
            <Row label="Avancado" value={s.advancedPrice} onChange={v=>u("advancedPrice",v)} suffix="€" min={15} max={100} info={`${s.advancedPct}%`} />
            <Row label="Criancas" value={s.kidsPrice} onChange={v=>u("kidsPrice",v)} suffix="€" min={10} max={80} info={`${s.kidsPct}%`} />
            <Row label="Eventos/mes" value={s.eventMonthly} onChange={v=>u("eventMonthly",v)} suffix="€" min={0} max={20000} step={500} />
          </Section>

          {/* CAPEX */}
          <Section title="Investimento (CAPEX)" number="3" open={true}>
            <div style={{ fontSize:10, color:"#888", marginBottom:8, lineHeight:1.5 }}>
              Pacote Citywave confirmado: equipamento + instalacao (€89k) + shipping. Sem royalties.
            </div>
            <Row label={`Citywave ${s.waveSize}m (base)`} value={s.citywaveCost} onChange={v=>u("citywaveCost",v)} suffix="€" info="10m: €1,7-1,8M · 7,5m: €1,2-1,3M" min={500000} max={4000000} step={50000} />
            <Row label="Saltwater uplift" value={s.saltwaterUplift} onChange={v=>u("saltwaterUplift",v)} suffix="%" info="⚠ Preco exato pendente Citywave. Anti-corrosao + bombas SW. Pode ser exigido em Madeira por leg. agua." min={0} max={50} step={5} />
            <Row label="Instalacao (Citywave)" value={s.installation} onChange={v=>u("installation",v)} suffix="€" info="Equipa Citywave confirmou €89k" min={50000} max={200000} step={5000} />
            <Row label="Shipping (containers)" value={s.shipping} onChange={v=>u("shipping",v)} suffix="€" info="4-5 containers, €2-3k cada (Madeira)" min={5000} max={50000} step={1000} />
            <Row label="Preparacao local" value={s.sitePrep} onChange={v=>u("sitePrep",v)} suffix="€" info={s.siteId==="lawn"?"Relvado precisa de slab/gravel — TBC":s.siteId==="concrete"?"Concreto existente":"Variavel"} min={20000} max={600000} step={10000} />
            <Row label="Canalizacao" value={s.plumbing} onChange={v=>u("plumbing",v)} suffix="€" min={10000} max={300000} step={5000} />
            <Row label="Eletrica (400V/1200A)" value={s.electrical} onChange={v=>u("electrical",v)} suffix="€" info="3-fase confirmado Citywave" min={10000} max={300000} step={5000} />
            <Row label="Licencas e projeto" value={s.permits} onChange={v=>u("permits",v)} suffix="€" min={5000} max={150000} step={5000} />
            <Row label="Contingencia" value={s.contingency} onChange={v=>u("contingency",v)} suffix="%" min={0} max={25} />
            <Row label="CAPEX Total" value={calc.capex} suffix="€" total />
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:8, marginTop:8, fontSize:9.5, lineHeight:1.6, color:"#666" }}>
              <strong style={{color:"#000"}}>Pagamento Citywave:</strong> 15% assinatura · 40% inicio producao · 25% shipping · 15% instalacao · 5% handover
            </div>
          </Section>

          {/* OPERACAO */}
          <Section title="Custos Operacao" number="4" open={false}>
            <Row label="Funcionarios" value={s.staffCount} onChange={v=>u("staffCount",v)} suffix="" min={2} max={30} />
            <Row label="Salario medio" value={s.avgSalary} onChange={v=>u("avgSalary",v)} suffix="€/mes" min={600} max={3000} step={50} />
            <Row label="TSU patronal" value={s.ssRate} onChange={v=>u("ssRate",v)} suffix="%" min={18} max={30} step={0.25} />
            <Row label="Dias operacao/ano" value={s.opDays} onChange={v=>u("opDays",v)} suffix="" min={200} max={365} step={5} />
            <Row label="Agua/tratamento" value={s.waterMonth} onChange={v=>u("waterMonth",v)} suffix="€/mes" info="1500m³ inicial + ~17,5 m³/semana" min={200} max={10000} step={250} />
            <Row label="Manutencao" value={s.maintMonth} onChange={v=>u("maintMonth",v)} suffix="€/mes" info="Contrato opcional Citywave: ~1,5%/ano do sistema" min={500} max={15000} step={250} />
            <Row label="Seguro anual" value={s.insuranceYear} onChange={v=>u("insuranceYear",v)} suffix="€/ano" min={5000} max={100000} step={1000} />
            <Row label="Marketing" value={s.marketingMonth} onChange={v=>u("marketingMonth",v)} suffix="€/mes" min={200} max={10000} step={250} />
            <Row label="Contabilidade" value={s.accountingMonth} onChange={v=>u("accountingMonth",v)} suffix="€/mes" min={200} max={3000} step={50} />
            <Row label="Diversos" value={s.miscMonth} onChange={v=>u("miscMonth",v)} suffix="€/mes" min={200} max={8000} step={250} />
            <Row label="Concessao CMF" value={s.concessionRate} onChange={v=>u("concessionRate",v)} suffix="% receita" min={0} max={20} step={0.5} />
          </Section>

          {/* FINANCIAMENTO */}
          <Section title="Financiamento" number="5" open={false}>
            <div style={{ fontSize:10, color: fundAlert?"#c00":"#090", fontWeight:600, marginBottom:6 }}>
              Total: {fd(calc.fundPct)}% {fundAlert?"⚠ Ajuste para 100%":"✓"}
            </div>
            <div style={{ fontSize:9.5, color:"#888", marginBottom:8, lineHeight:1.5 }}>
              Citywave nao oferece financiamento direto.
            </div>
            <Row label="Joao Febrer" value={s.joaoPct} onChange={v=>u("joaoPct",v)} suffix="%" info={`= ${fmt(Math.round(calc.joaoAmt))}€`} min={0} max={50} />
            <Row label="Rodrigo Farinha" value={s.rodrigoPct} onChange={v=>u("rodrigoPct",v)} suffix="%" info={`= ${fmt(Math.round(calc.rodrigoAmt))}€`} min={0} max={50} />
            <Row label="Sweat equity fundadores" value={s.sweatPct} onChange={v=>u("sweatPct",v)} suffix="%" info="Ownership extra pelo know-how, marca SCM, certificacoes e 20+ anos experiencia. Dividido 50/50." min={0} max={40} />
            <div style={{ borderTop:"1px solid #eee", marginTop:8, paddingTop:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:700 }}>Investidores</span>
                <button onClick={addInv} style={{ background:"#000", color:"#fff", border:"none", borderRadius:3, padding:"3px 10px", fontSize:10, cursor:"pointer", fontWeight:700 }}>+ Adicionar</button>
              </div>
              {s.investors.map(inv=>(
                <div key={inv.id} style={{ background:"#f8f8f8", borderRadius:4, padding:8, marginBottom:4 }}>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:4 }}>
                    <input value={inv.name} onChange={e=>uInv(inv.id,"name",e.target.value)} style={{
                      flex:1, background:"#fff", border:"1px solid #ddd", borderRadius:3, padding:"4px 6px",
                      fontSize:11, fontFamily:"'Instrument Sans',sans-serif"
                    }} />
                    <button onClick={()=>rmInv(inv.id)} style={{ background:"transparent", border:"none", color:"#c00", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
                  </div>
                  <Row label={`${inv.name}`} value={inv.pct} onChange={v=>uInv(inv.id,"pct",v)} suffix="%" info={`= ${fmt(Math.round(calc.capex*(inv.pct/100)))}€`} min={1} max={60} />
                </div>
              ))}
            </div>
            <Row label="Divida bancaria" value={s.bankPct} onChange={v=>u("bankPct",v)} suffix="%" min={0} max={80} />
            {s.bankPct > 0 && <>
              <Row label="Taxa juro" value={s.loanRate} onChange={v=>u("loanRate",v)} suffix="%" min={1} max={12} step={0.25} indent />
              <Row label="Prazo" value={s.loanYears} onChange={v=>u("loanYears",v)} suffix=" anos" min={2} max={25} indent />
              <div style={{ fontSize:11, color:"#666", fontFamily:"'IBM Plex Mono',monospace", paddingLeft:20, marginTop:2 }}>
                Prestacao: <strong>{fmt(Math.round(calc.mp))}€/mes</strong> · Anual: {fmt(Math.round(calc.annDebt))}€
              </div>
            </>}
            <div style={{ borderTop:"1px solid #eee", marginTop:8, paddingTop:8 }}>
              <Row label="Dividendos" value={s.distPct} onChange={v=>u("distPct",v)} suffix="%" info={`Reinvestimento: ${100-s.distPct}%`} min={0} max={100} step={5} />
              <Row label="Management fee" value={s.mgmtPct} onChange={v=>u("mgmtPct",v)} suffix="% receita" info="Remuneracao gestao fundadores" min={0} max={20} step={0.5} />
            </div>
          </Section>
        </aside>

        {/* ═══ RIGHT ═══ */}
        <main>

          {/* OVERVIEW */}
          {tab==="overview" && <>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Receita vs Custos — Mensal</h2>
              <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:120, paddingBottom:20, borderBottom:"1px solid #eee", position:"relative" }}>
                {MONTHS.map((m,i)=>{
                  const mx=Math.max(...calc.mRev,...calc.mCost)*1.1;
                  return(
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ display:"flex", gap:1, alignItems:"flex-end", width:"100%", justifyContent:"center" }}>
                        <div style={{ width:"40%", height:mx>0?(calc.mRev[i]/mx)*100:0, background:"#000", borderRadius:"2px 2px 0 0", transition:"height 0.3s" }} />
                        <div style={{ width:"40%", height:mx>0?(calc.mCost[i]/mx)*100:0, background:"#ccc", borderRadius:"2px 2px 0 0", transition:"height 0.3s" }} />
                      </div>
                      <div style={{ fontSize:9, color:"#999", marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>{m}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:16, marginTop:6, fontSize:10, color:"#666" }}>
                <span><span style={{ display:"inline-block", width:10, height:3, background:"#000", marginRight:4, verticalAlign:"middle" }}/>Receita</span>
                <span><span style={{ display:"inline-block", width:10, height:3, background:"#ccc", marginRight:4, verticalAlign:"middle" }}/>Custos</span>
              </div>
            </div>

            {/* CAPEX breakdown — NEW */}
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>CAPEX — Composicao Detalhada</h2>
              {calc.capexBk.map((c,i)=><Bar key={i} label={c.l} value={c.v} maxVal={Math.max(...calc.capexBk.map(x=>x.v))*1.1} dark={i===0} />)}
              <Row label="CAPEX Total" value={calc.capex} suffix="€" total />
            </div>

            <div className="twocol-charts" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Custos Anuais</h2>
                {calc.costBk.map((c,i)=><Bar key={i} label={c.l} value={c.v} maxVal={Math.max(...calc.costBk.map(x=>x.v))*1.1} dark={i===0} />)}
                <Row label="Total OPEX" value={calc.opex} suffix="€" total />
              </div>
              <div>
                <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Receitas Anuais</h2>
                {calc.revBk.map((r,i)=><Bar key={i} label={r.l} value={r.v} maxVal={Math.max(...calc.revBk.map(x=>x.v))*1.1} dark={i===0} />)}
                <Row label="Total Receita" value={calc.annRev} suffix="€" total />
              </div>
            </div>

            <div>
              <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>EBITDA Mensal</h2>
              <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:90 }}>
                {calc.mProfit.map((v,i)=>{
                  const mx=Math.max(...calc.mProfit.map(Math.abs))*1.2;
                  const h=mx>0?Math.max((Math.abs(v)/mx)*75,2):2;
                  return(
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ fontSize:8, fontFamily:"'IBM Plex Mono',monospace", color:v>=0?"#000":"#c00", fontWeight:600, marginBottom:2 }}>{fmtK(v)}</div>
                      <div style={{ width:"70%", height:h, borderRadius:"2px 2px 0 0", background:v>=0?"#000":"#c00", transition:"height 0.3s" }} />
                      <div style={{ fontSize:8, color:"#999", marginTop:3 }}>{MONTHS[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>}

          {/* REVENUE */}
          {tab==="revenue" && <>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Modelo de Receitas — Baseado em Honna Surf Hub (Madrid)</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:14, marginBottom:16, fontSize:11, lineHeight:1.6, color:"#444" }}>
              <p style={{margin:"0 0 6px"}}><strong style={{color:"#000"}}>Cada pessoa paga por sessao</strong>, com preco diferenciado por nivel. Principiantes incluem prancha, fato e instrutor.</p>
              <p style={{margin:0}}>Ref: Honna Surf Hub (Citywave Madrid) — Principiante 49.90€, Intermedio/Avancado 39.90€, sessoes de 1h, grupos ate 6-8 pessoas.</p>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>1. Configuracao das Sessoes</h2>
            <div className="twocol-charts" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <Row label="Duracao sessao" value={s.sessionMinutes} onChange={v=>u("sessionMinutes",v)} suffix=" min" min={15} max={90} step={15} />
                <Row label="Pessoas por grupo" value={s.ridersPerSession} onChange={v=>u("ridersPerSession",v)} suffix="" min={1} max={10} />
                <Row label="Sessoes por hora" value={s.sessionsPerHour} onChange={v=>u("sessionsPerHour",v)} suffix="" min={1} max={4} />
                <Row label="Sessoes vendidas/dia" value={s.sessionsDay} onChange={v=>u("sessionsDay",v)} suffix="" min={1} max={50} info={`Max: ${calc.maxSlotsDay} · Ocupacao: ${fd(calc.avgOccupancy,0)}%`} />
              </div>
              <div style={{ background:"#000", borderRadius:4, padding:14, color:"#fff" }}>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#888", marginBottom:10 }}>Capacidade</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{calc.ridersPerHour}</div><div style={{ fontSize:9, color:"#888" }}>pessoas / hora</div></div>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{calc.maxRidersDay}</div><div style={{ fontSize:9, color:"#888" }}>max pessoas / dia</div></div>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{calc.avgPeopleDay}</div><div style={{ fontSize:9, color:"#888" }}>pessoas / dia (media)</div></div>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{fd(calc.avgOccupancy,0)}%</div><div style={{ fontSize:9, color:"#888" }}>ocupacao</div></div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>2. Precos por Pessoa / Nivel</h2>
            <div style={{ marginBottom:20 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  {["Tipo Sessao","Preco/Pessoa","% do Total","Inclui"].map(h=><th key={h} style={{ padding:"8px 6px", textAlign:"left", fontWeight:700, fontSize:10, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  <tr style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"8px 6px", fontWeight:600 }}>Principiante</td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.beginnerPrice} onChange={v=>u("beginnerPrice",v)} suffix="€" min={15} max={100} /></td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.beginnerPct} onChange={v=>u("beginnerPct",v)} suffix="%" min={0} max={100} /></td>
                    <td style={{ padding:"8px 6px", fontSize:10, color:"#666" }}>Prancha + fato + instrutor</td>
                  </tr>
                  <tr style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"8px 6px", fontWeight:600 }}>Intermedio</td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.intermediatePrice} onChange={v=>u("intermediatePrice",v)} suffix="€" min={15} max={100} /></td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.intermediatePct} onChange={v=>u("intermediatePct",v)} suffix="%" min={0} max={100} /></td>
                    <td style={{ padding:"8px 6px", fontSize:10, color:"#666" }}>Instrutor seguranca + tips</td>
                  </tr>
                  <tr style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"8px 6px", fontWeight:600 }}>Avancado / Pro</td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.advancedPrice} onChange={v=>u("advancedPrice",v)} suffix="€" min={15} max={100} /></td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.advancedPct} onChange={v=>u("advancedPct",v)} suffix="%" min={0} max={100} /></td>
                    <td style={{ padding:"8px 6px", fontSize:10, color:"#666" }}>Free surf, seguranca</td>
                  </tr>
                  <tr style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"8px 6px", fontWeight:600 }}>Criancas (8-16)</td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.kidsPrice} onChange={v=>u("kidsPrice",v)} suffix="€" min={10} max={80} /></td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.kidsPct} onChange={v=>u("kidsPct",v)} suffix="%" min={0} max={100} /></td>
                    <td style={{ padding:"8px 6px", fontSize:10, color:"#666" }}>Prancha + fato + instrutor</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"#000", borderRadius:2, overflow:"hidden", marginTop:12 }}>
                <div style={{ background:"#fff", padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, letterSpacing:1, color:"#999" }}>PRECO MEDIO PONDERADO</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800 }}>{fd(calc.wtdPrice,1)}€</div>
                </div>
                <div style={{ background:"#fff", padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, letterSpacing:1, color:"#999" }}>APOS DESC. BONOS ({s.bonoPct}%)</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800 }}>{fd(calc.effectiveAvgPrice,1)}€</div>
                </div>
                <div style={{ background:"#fff", padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, letterSpacing:1, color:"#999" }}>CUSTO ENERGIA / PESSOA</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800 }}>{fd(calc.energyCostPerPerson,2)}€</div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>3. Receitas Extra</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:12, marginBottom:20 }}>
              <Row label="Surf Clinic (% pessoas)" value={s.clinicPct} onChange={v=>u("clinicPct",v)} suffix="%" info="Video correcao + coaching premium" min={0} max={30} />
              <Row label="Preco Surf Clinic" value={s.clinicPrice} onChange={v=>u("clinicPrice",v)} suffix="€/pessoa" min={20} max={200} />
              <Row label="Onda Privada (% sessoes)" value={s.privatePct} onChange={v=>u("privatePct",v)} suffix="%" info="'A Minha Onda' — aluguer exclusivo" min={0} max={30} />
              <Row label="Preco Onda Privada" value={s.privatePrice} onChange={v=>u("privatePrice",v)} suffix="€/sessao" min={50} max={500} step={10} />
              <Row label="Aluguer equip. inter/adv (%)" value={s.rentalAdvancedPct} onChange={v=>u("rentalAdvancedPct",v)} suffix="%" info="Intermedios/avancados que alugam prancha" min={0} max={80} />
              <Row label="Preco aluguer" value={s.rentalAdvancedPrice} onChange={v=>u("rentalAdvancedPrice",v)} suffix="€" min={5} max={30} />
              <Row label="Bonos (% com desconto)" value={s.bonoPct} onChange={v=>u("bonoPct",v)} suffix="%" info="Clientes com pacotes 10/20 sessoes" min={0} max={50} />
              <Row label="Desconto medio bonos" value={s.bonoDiscount} onChange={v=>u("bonoDiscount",v)} suffix="%" min={5} max={30} />
              <Row label="Eventos/mes" value={s.eventMonthly} onChange={v=>u("eventMonthly",v)} suffix="€" min={0} max={20000} step={500} />
              <Row label="Community Cards/ano" value={s.communityCards} onChange={v=>u("communityCards",v)} suffix="" min={0} max={500} />
              <Row label="Preco Community Card" value={s.communityPrice} onChange={v=>u("communityPrice",v)} suffix="€/ano" min={50} max={300} step={10} />
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Resumo Receitas Anuais</h2>
            {calc.revBk.map((r,i)=><Bar key={i} label={r.l} value={r.v} maxVal={Math.max(...calc.revBk.map(x=>x.v))*1.1} dark={i===0} />)}
            <Row label="Receita Anual Total" value={calc.annRev} suffix="€" total />

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", margin:"20px 0 10px" }}>Sazonalidade</h2>
            <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:90 }}>
              {calc.mRev.map((v,i)=>{
                const mx=Math.max(...calc.mRev)*1.15;
                return(<div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ fontSize:7, fontFamily:"'IBM Plex Mono',monospace", color:"#666", marginBottom:1 }}>{fmtK(v)}</div>
                  <div style={{ width:"80%", height:mx>0?(v/mx)*70:0, borderRadius:"2px 2px 0 0", background:"#000", transition:"height 0.3s" }} />
                  <div style={{ fontSize:8, color:"#999", marginTop:3 }}>{MONTHS[i]}</div>
                </div>);
              })}
            </div>
          </>}

          {/* ENERGY */}
          {tab==="energy" && <>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Onda {s.waveSize}m — {calc.wc.pumps} Bombas</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:10, marginBottom:14, fontSize:11, color:"#444" }}>
              Especificacao Citywave (Mai 2026): 10m peak {s.kwhMax} kW (15 bombas × 40 kW). 400V trifasico, 1200A. Valor editavel acima.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"#000", borderRadius:2, overflow:"hidden", marginBottom:20 }}>
              {[
                {l:"BOMBAS",v:calc.wc.pumps},{l:"KW MAX",v:s.kwhMax},
                {l:"KW EFETIVO/H",v:Math.round(calc.effKwh)},{l:"KWH/DIA",v:Math.round(calc.dailyKwh)},
              ].map((m,i)=>(
                <div key={i} style={{ background:"#fff", padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, letterSpacing:1, color:"#999", fontWeight:600 }}>{m.l}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, marginTop:2 }}>{fmt(m.v)}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Comparacao Tamanhos</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, marginBottom:20 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["Onda","Bombas","kWh max/h","kWh/dia","Custo/dia","Custo/ano"].map(h=><th key={h} style={{ padding:"8px 6px", textAlign:"right", fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</th>)}
              </tr></thead>
              <tbody>{calc.energyComp.map((w,i)=>{
                const cur=w.size===s.waveSize;
                return(<tr key={i} style={{ borderBottom:"1px solid #eee", background:cur?"#f5f5f5":"transparent" }}>
                  <td style={{ padding:"6px", textAlign:"right", fontWeight:cur?800:400, fontFamily:"'IBM Plex Mono',monospace" }}>{w.size}m</td>
                  <td style={{ padding:"6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{w.pumps}</td>
                  <td style={{ padding:"6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{w.kwh}</td>
                  <td style={{ padding:"6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(Math.round(w.dKwh))}</td>
                  <td style={{ padding:"6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(Math.round(w.dKwh*s.electricityRate))}€</td>
                  <td style={{ padding:"6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:cur?800:400 }}>{fmtK(w.aCost)}€</td>
                </tr>);
              })}</tbody>
            </table>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Sensibilidade Preco Eletricidade</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, marginBottom:20 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["€/kWh","Energia/ano","EBITDA","Margem","vs Atual"].map(h=><th key={h} style={{ padding:"7px 5px", textAlign:"right", fontSize:10, fontWeight:700 }}>{h}</th>)}
              </tr></thead>
              <tbody>{[0.08,0.10,0.13,0.156,0.18,0.20,0.25,0.30].map(r=>{
                const ec=calc.dailyKwh*r*s.opDays;const eb=calc.annRev-(calc.opex-calc.annEnergy+ec);const d=eb-calc.ebitda;const cur=Math.abs(r-s.electricityRate)<0.005;
                return(<tr key={r} style={{ borderBottom:"1px solid #eee", background:cur?"#f5f5f5":"transparent" }}>
                  <td style={{ padding:"6px 5px", textAlign:"right", fontWeight:cur?800:400, fontFamily:"'IBM Plex Mono',monospace" }}>{r.toFixed(3)}€</td>
                  <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(ec)}€</td>
                  <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:eb<0?"#c00":"#000", fontWeight:600 }}>{fmtK(eb)}€</td>
                  <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{calc.annRev>0?pct(eb/calc.annRev):"—"}</td>
                  <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:d>=0?"#000":"#c00" }}>{d>=0?"+":""}{fmtK(d)}€</td>
                </tr>);
              })}</tbody>
            </table>
          </>}

          {/* INVESTORS */}
          {tab==="investors" && <>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Cap Table</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, marginBottom:20 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["Stakeholder","Capital","Cash %","Ownership","Tipo"].map(h=><th key={h} style={{ padding:"8px 6px", textAlign:"right", fontSize:10, fontWeight:700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {calc.capTableData.map((ct,i)=>(
                  <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"7px 6px", textAlign:"right", fontWeight:700 }}>{ct.name}</td>
                    <td style={{ padding:"7px 6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(Math.round(ct.cash))}€</td>
                    <td style={{ padding:"7px 6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fd(ct.cashPct)}%</td>
                    <td style={{ padding:"7px 6px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{fd(ct.ownership)}%</td>
                    <td style={{ padding:"7px 6px", textAlign:"right", fontSize:10, color:"#666" }}>{ct.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Distribuicao de Lucros</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:12, marginBottom:20, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, lineHeight:2 }}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>EBITDA</span><strong>{fmt(Math.round(calc.ebitda))}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>- Servico divida</span><span style={{color:"#c00"}}>-{fmt(Math.round(calc.annDebt))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>- Management fee ({s.mgmtPct}%)</span><span>-{fmt(Math.round(calc.annMgmt))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:"2px solid #000",paddingTop:4,fontWeight:800}}><span>= Distribuivel</span><span>{fmt(Math.round(calc.dist0))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span>→ Dividendos ({s.distPct}%)</span><strong>{fmt(Math.round(calc.divs))}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>→ Reinvestimento ({100-s.distPct}%)</span><span>{fmt(Math.round(calc.reinv))}€</span></div>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Retorno por Stakeholder (Ano 1)</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10, marginBottom:20 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["","Capital","Own%","Dividendo","Mgmt","Total/Ano","ROI","Payback"].map(h=><th key={h} style={{ padding:"7px 4px", textAlign:"right", fontWeight:700, fontSize:9 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {n:"Joao",cash:calc.joaoAmt,own:calc.ownJ,div:calc.divs*calc.ownJ/100,mgmt:calc.annMgmt/2,tot:calc.jProfit},
                  {n:"Rodrigo",cash:calc.rodrigoAmt,own:calc.ownR,div:calc.divs*calc.ownR/100,mgmt:calc.annMgmt/2,tot:calc.rProfit},
                  ...calc.invRet.map(i=>({n:i.name,cash:i.amt,own:i.own,div:i.profit,mgmt:0,tot:i.profit})),
                ].map((r,i)=>(
                  <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontWeight:700 }}>{r.n}</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(r.cash)}€</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{fd(r.own)}%</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(r.div)}€</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:r.mgmt>0?"#000":"#ccc" }}>{r.mgmt>0?fmtK(r.mgmt)+"€":"—"}</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:800 }}>{fmtK(r.tot)}€</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{r.cash>0?fd(r.tot/r.cash*100)+"%":"∞"}</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{r.cash>0&&r.tot>0?fd(r.cash/r.tot)+"a":"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Retorno Acumulado — 7 Anos</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                <th style={{ padding:"6px 4px", textAlign:"right", fontSize:9, fontWeight:700 }}>Ano</th>
                <th style={{ padding:"6px 4px", textAlign:"right", fontSize:9, fontWeight:700 }}>Joao</th>
                <th style={{ padding:"6px 4px", textAlign:"right", fontSize:9, fontWeight:700 }}>Rodrigo</th>
                {calc.invRet.map((inv,i)=><th key={i} style={{ padding:"6px 4px", textAlign:"right", fontSize:9, fontWeight:700 }}>{inv.name}</th>)}
              </tr></thead>
              <tbody>
                {calc.cumRet.map((yr,i)=>(
                  <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"5px 4px", textAlign:"right", fontWeight:700 }}>A{yr.y}</td>
                    <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:yr.j>=0?"#000":"#c00", fontWeight:600 }}>{fmtK(yr.j)}€</td>
                    <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:yr.r>=0?"#000":"#c00", fontWeight:600 }}>{fmtK(yr.r)}€</td>
                    {yr.inv.map((v,j)=><td key={j} style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:v.c>=0?"#000":"#c00", fontWeight:600 }}>{fmtK(v.c)}€</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize:9, color:"#999", marginTop:4 }}>Positivo = investimento recuperado + lucro. +3% receita/ano, +2% custos/ano.</div>
          </>}

          {/* PROJECTION */}
          {tab==="analise" && <>
            {/* ── INTRO ── */}
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Analise Financeira Avancada</h2>
            <div style={{ background:"#f8f8f8", borderLeft:"3px solid #000", borderRadius:4, padding:12, marginBottom:20, fontSize:11, lineHeight:1.6, color:"#444" }}>
              Modelo DCF/WACC com Free Cash Flow to Firm, Beta bottom-up por industria (Damodaran), sensibilidade bidirecional e benchmark vs investimentos passivos. Todos os inputs sao editaveis.
            </div>

            {/* ── CAPM INPUTS ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>1. CAPM · Custo do Capital</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }} className="analise-grid-2">
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:10, fontWeight:700, marginBottom:6, color:"#666" }}>INPUTS DE MERCADO</div>
                <Row label="Taxa sem risco (rf)" value={s.rfRate} onChange={v=>u("rfRate",v)} suffix="%" info="OT Portugal 10 anos" min={0} max={10} step={0.1} />
                <Row label="Premio de risco mercado" value={s.marketPremium} onChange={v=>u("marketPremium",v)} suffix="%" info="Equity Risk Premium EU (Damodaran)" min={3} max={12} step={0.1} />
                <Row label="Beta nao-alavancado" value={s.unleveredBeta} onChange={v=>u("unleveredBeta",v)} suffix="" info="Bottom-up leisure/recreation" min={0.3} max={2} step={0.05} />
                <Row label="Taxa imposto" value={s.taxRate} onChange={v=>u("taxRate",v)} suffix="%" info="IRC + derrama PT" min={15} max={30} step={0.5} />
              </div>
              <div style={{ background:"#000", color:"#fff", borderRadius:4, padding:14 }}>
                <div style={{ fontSize:10, fontWeight:700, marginBottom:8, color:"#999" }}>OUTPUTS CALCULADOS</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }}>
                  <div><div style={{ fontSize:8, color:"#888", letterSpacing:1 }}>D/V</div><div style={{ fontSize:16, fontWeight:800 }}>{pct(calc.dRatio)}</div></div>
                  <div><div style={{ fontSize:8, color:"#888", letterSpacing:1 }}>E/V</div><div style={{ fontSize:16, fontWeight:800 }}>{pct(calc.eRatio)}</div></div>
                  <div><div style={{ fontSize:8, color:"#888", letterSpacing:1 }}>β LEVERED</div><div style={{ fontSize:16, fontWeight:800 }}>{fd(calc.leveredBeta,2)}</div></div>
                  <div><div style={{ fontSize:8, color:"#888", letterSpacing:1 }}>Ke</div><div style={{ fontSize:16, fontWeight:800 }}>{pct(calc.costOfEquity)}</div></div>
                  <div><div style={{ fontSize:8, color:"#888", letterSpacing:1 }}>Kd (apos imp.)</div><div style={{ fontSize:16, fontWeight:800 }}>{pct(calc.costOfDebtAT)}</div></div>
                  <div style={{ background:"#fff", color:"#000", padding:"4px 6px", borderRadius:3 }}>
                    <div style={{ fontSize:8, color:"#666", letterSpacing:1 }}>WACC</div>
                    <div style={{ fontSize:18, fontWeight:800 }}>{pct(calc.wacc)}</div>
                  </div>
                </div>
                <div style={{ fontSize:9, color:"#888", marginTop:10, lineHeight:1.5 }}>
                  β<sub>L</sub> = β<sub>U</sub> × (1 + (1-t)·D/E) · Ke = rf + β<sub>L</sub>·MRP · WACC = E/V·Ke + D/V·Kd(1-t)
                </div>
              </div>
            </div>

            {/* ── BETA COMPARABLES ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>2. Beta · Industria Comparavel</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:6 }}>Beta alavancado de empresas listadas em leisure/recreation. Media simples — usar como referencia para o β<sub>U</sub>.</div>
            <div style={{ overflowX:"auto", marginBottom:18 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, minWidth:480 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  {["Comparavel","Setor","β (levered)"].map(h=><th key={h} style={{ padding:"7px 6px", textAlign:"left", fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {INDUSTRY_BETAS.map((b,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"6px", fontWeight:600 }}>{b.name}</td>
                      <td style={{ padding:"6px", color:"#666", fontSize:10 }}>{b.sector}</td>
                      <td style={{ padding:"6px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{fd(b.beta,2)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop:"2px solid #000", background:"#f8f8f8" }}>
                    <td style={{ padding:"7px 6px", fontWeight:800 }}>Media (referencia)</td>
                    <td style={{ padding:"7px 6px", color:"#666" }}>Industria</td>
                    <td style={{ padding:"7px 6px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:800 }}>{fd(calc.industryAvgBeta,2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── FREE CASH FLOW ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>3. Free Cash Flow to Firm (FCFF)</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }} className="analise-grid-3">
              <Row label="Anos forecast" value={s.forecastYears} onChange={v=>u("forecastYears",v)} suffix="" info="Periodo explicito antes da perpetuidade" min={5} max={15} />
              <Row label="Depreciacao" value={s.depreciationYears} onChange={v=>u("depreciationYears",v)} suffix=" anos" info="Vida util fiscal media" min={5} max={25} />
              <Row label="Maint. CapEx" value={s.maintCapexPct} onChange={v=>u("maintCapexPct",v)} suffix="% capex/ano" min={0} max={10} step={0.5} />
            </div>
            <Row label="Crescimento perpetuidade (g)" value={s.terminalGrowth} onChange={v=>u("terminalGrowth",v)} suffix="%" info="Inflacao alvo BCE 2% · Maximo recomendado: rf - 1pp" min={0} max={5} step={0.25} />

            <div style={{ overflowX:"auto", marginTop:12 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10.5, minWidth:680 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  {["Ano","Receita","OPEX","EBITDA","Depr.","EBIT","Imposto","NOPAT","Maint Capex","FCFF","PV @ WACC"].map(h=>
                    <th key={h} style={{ padding:"6px 4px", textAlign:"right", fontSize:9.5, fontWeight:700 }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>
                  {calc.fcfYears.map((y,i)=>{
                    const pv = y.fcff / Math.pow(1+calc.wacc, i+1);
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontWeight:700 }}>A{y.y}</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(y.rev)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#666" }}>{fmtK(y.opex)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:y.ebitda<0?"#c00":"#000" }}>{fmtK(y.ebitda)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#666" }}>{fmtK(y.dep)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:y.ebit<0?"#c00":"#000" }}>{fmtK(y.ebit)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#c00" }}>-{fmtK(y.tax)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(y.nopat)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#c00" }}>-{fmtK(y.maintCapex)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:800, color:y.fcff<0?"#c00":"#000" }}>{fmtK(y.fcff)}€</td>
                        <td style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{fmtK(pv)}€</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── DCF VALUATION SUMMARY ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:1, background:"#000", marginTop:14, marginBottom:20, borderRadius:2, overflow:"hidden" }}>
              {[
                {l:"PV FCFF EXPLICITO", v:`${fmtK(calc.pvFcff)}€`},
                {l:"VALOR TERMINAL", v:`${fmtK(calc.terminalValue)}€`, sub:`g=${s.terminalGrowth}%`},
                {l:"PV VALOR TERMINAL", v:`${fmtK(calc.pvTerminal)}€`},
                {l:"ENTERPRISE VALUE", v:`${fmtK(calc.enterpriseValue)}€`},
                {l:"NPV PROJETO", v:`${fmtK(calc.npvProject)}€`, neg:calc.npvProject<0, sub:"EV - CAPEX inicial"},
                {l:"IRR PROJETO", v:isFinite(calc.projectIRR)?pct(calc.projectIRR):"N/A", sub:`vs WACC ${pct(calc.wacc)}`},
                {l:"IRR EQUITY", v:isFinite(calc.equityIRR)?pct(calc.equityIRR):"N/A", sub:"Apos divida"},
              ].map((m,i)=>(
                <div key={i} style={{ background:"#fff", padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, letterSpacing:1.5, textTransform:"uppercase", color:"#999", fontWeight:600 }}>{m.l}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:m.neg?"#c00":"#000", marginTop:3 }}>{m.v}</div>
                  {m.sub && <div style={{ fontSize:8, color:"#999", marginTop:2 }}>{m.sub}</div>}
                </div>
              ))}
            </div>

            {/* ── REVENUE SENSITIVITY ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>4. Sensibilidade à Receita</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>Custos variaveis (energia, marketing, concessao) escalam parcialmente com a receita. Custos fixos (pessoal, agua, manutencao, seguro) mantem-se.</div>
            <div style={{ overflowX:"auto", marginBottom:20 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10.5, minWidth:640 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  {["% Receita","Receita","OPEX","EBITDA","Margem","Apos divida","FCFF","Payback"].map(h=>
                    <th key={h} style={{ padding:"7px 5px", textAlign:"right", fontSize:9.5, fontWeight:700 }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>
                  {calc.revScenarios.map((sc,i)=>{
                    const base = Math.abs(sc.p - 1) < 0.01;
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid #eee", background:base?"#f5f5f5":"transparent" }}>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontWeight:base?800:700, fontFamily:"'IBM Plex Mono',monospace" }}>{fd(sc.p*100,0)}%</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(sc.rev)}€</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#666" }}>{fmtK(sc.opx)}€</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:sc.ebitda<0?"#c00":"#000" }}>{fmtK(sc.ebitda)}€</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{pct(sc.margin)}</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:sc.net<0?"#c00":"#000" }}>{fmtK(sc.net)}€</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:sc.fcf<0?"#c00":"#000" }}>{fmtK(sc.fcf)}€</td>
                        <td style={{ padding:"6px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{sc.payback<50?fd(sc.payback)+"a":"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── TWO-WAY SENSITIVITY ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>5. Sensibilidade Bidirecional · EBITDA</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>Receita (% base) × Preco eletricidade. Verde = lucro · Vermelho = perda.</div>
            <div style={{ overflowX:"auto", marginBottom:20 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10, minWidth:560 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  <th style={{ padding:"7px 4px", textAlign:"right", fontSize:9, fontWeight:700, background:"#000", color:"#fff" }}>€/kWh \ Rev%</th>
                  {calc.sensRevPcts.map(r=><th key={r} style={{ padding:"7px 4px", textAlign:"right", fontSize:9, fontWeight:700, background:"#f5f5f5" }}>{fd(r*100,0)}%</th>)}
                </tr></thead>
                <tbody>
                  {calc.sensElec.map((er,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"5px 4px", textAlign:"right", fontWeight:700, background:"#f5f5f5", fontFamily:"'IBM Plex Mono',monospace" }}>{er.toFixed(3)}€</td>
                      {calc.sensMatrix[i].map((v,j)=>{
                        const intensity = Math.min(Math.abs(v)/Math.max(calc.ebitda,1), 1);
                        const bg = v>=0 ? `rgba(40,160,80,${0.10+intensity*0.30})` : `rgba(220,40,40,${0.10+intensity*0.30})`;
                        return (
                          <td key={j} style={{ padding:"5px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:v<0?"#900":"#040", background:bg }}>{fmtK(v)}€</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── BOND BENCHMARK ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>6. Comparacao vs Investimentos Passivos</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>Retorno do projeto vs alternativas "estaveis". Considere risco/iliquidez do projeto vs liquidez total de obrigacoes/indices.</div>
            <div style={{ overflowX:"auto", marginBottom:14 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10.5, minWidth:640 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  {["Instrumento","Risco","Yield/Retorno","€10k @ 10a","Premio Projeto","Premio Equity"].map(h=>
                    <th key={h} style={{ padding:"7px 5px", textAlign:"left", fontSize:9.5, fontWeight:700, letterSpacing:0.3, textTransform:"uppercase" }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>
                  {calc.benchmarkRows.map((b,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"6px 5px", fontWeight:600 }}>{b.name}</td>
                      <td style={{ padding:"6px 5px", fontSize:10, color:"#666" }}>{b.risk}</td>
                      <td style={{ padding:"6px 5px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{pct(b.yield)}</td>
                      <td style={{ padding:"6px 5px", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(Math.round(b.val10k10y))}€</td>
                      <td style={{ padding:"6px 5px", fontFamily:"'IBM Plex Mono',monospace", color:b.excessProject>=0?"#040":"#c00", fontWeight:700 }}>{b.excessProject>=0?"+":""}{pct(b.excessProject)}</td>
                      <td style={{ padding:"6px 5px", fontFamily:"'IBM Plex Mono',monospace", color:b.excessEquity>=0?"#040":"#c00", fontWeight:700 }}>{b.excessEquity>=0?"+":""}{pct(b.excessEquity)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop:"2px solid #000", background:"#000", color:"#fff" }}>
                    <td style={{ padding:"7px 5px", fontWeight:800 }}>CITYWAVE FUNCHAL · Projeto</td>
                    <td style={{ padding:"7px 5px", fontSize:10 }}>Alto (iliquido)</td>
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:800 }}>{isFinite(calc.projectIRR)?pct(calc.projectIRR):"N/A"}</td>
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(Math.round(10000 * Math.pow(1+calc.projectAnnReturn,10)))}€</td>
                    <td style={{ padding:"7px 5px" }} colSpan={2}>—</td>
                  </tr>
                  <tr style={{ background:"#222", color:"#fff" }}>
                    <td style={{ padding:"7px 5px", fontWeight:800 }}>CITYWAVE FUNCHAL · Equity (alavancado)</td>
                    <td style={{ padding:"7px 5px", fontSize:10 }}>Muito alto</td>
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:800 }}>{isFinite(calc.equityIRR)?pct(calc.equityIRR):"N/A"}</td>
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(Math.round(10000 * Math.pow(1+calc.equityAnnReturn,10)))}€</td>
                    <td style={{ padding:"7px 5px" }} colSpan={2}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── RISK METRICS ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:20 }} className="analise-risk-grid">
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>SHARPE RATIO (PROXY)</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800 }}>{fd(calc.sharpe,2)}</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>(IRR - rf) / σ — σ assumido {pct(calc.projectVol)}</div>
              </div>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>NPV / CAPEX</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:calc.npvProject<0?"#c00":"#000" }}>{fd(calc.npvProject/calc.capex,2)}x</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>Indice de rentabilidade · &gt;0 cria valor</div>
              </div>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>SPREAD vs WACC</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:(calc.projectIRR-calc.wacc)<0?"#c00":"#040" }}>{calc.projectIRR-calc.wacc>=0?"+":""}{pct(calc.projectIRR-calc.wacc)}</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>IRR - WACC · &gt;0 cria valor</div>
              </div>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>EQUITY MULTIPLE</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800 }}>{isFinite(calc.equityIRR)?fd(Math.pow(1+calc.equityAnnReturn,10),1)+"x":"N/A"}</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>Retorno equity em 10 anos</div>
              </div>
            </div>

            {/* ── NOTES ── */}
            <div style={{ background:"#f8f8f8", border:"1px solid #eee", borderRadius:4, padding:12, fontSize:10, lineHeight:1.6, color:"#555" }}>
              <strong style={{color:"#000"}}>Notas metodologicas:</strong> FCFF = NOPAT + Depreciacao – Maint CapEx (working capital desprezado para servico). Terminal value via Gordon growth. WACC re-calculado por bottom-up beta (Hamada) ajustado a estrutura de capital atual. Sharpe assume volatilidade tipica de leisure private equity (~18%). IRR equity inclui residuo do valor terminal.
              <br/><br/>
              <strong style={{color:"#000"}}>Limites:</strong> Modelo nao inclui IRS sobre dividendos (impacto adicional de ~28% no retorno liquido do investidor PT). Nao modela ciclo cash-to-cash do working capital (assumido neutro). Nao incorpora opcionalidades (expansao, segunda onda, exit M&A).
            </div>
          </>}

          {tab==="projection" && <>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>P&L — 7 Anos</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10.5, marginBottom:24 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["Ano","Receita","OPEX","EBITDA","Apos Divida","Dividendos"].map(h=><th key={h} style={{ padding:"8px 5px", textAlign:"right", fontWeight:700, fontSize:10 }}>{h}</th>)}
              </tr></thead>
              <tbody>{calc.proj.map((yr,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontWeight:800 }}>Ano {yr.y}</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(yr.rev)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#666" }}>{fmtK(yr.opex)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:yr.ebitda<0?"#c00":"#000" }}>{fmtK(yr.ebitda)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:yr.net<0?"#c00":"#000" }}>{fmtK(yr.net)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(yr.divs)}€</td>
                </tr>
              ))}</tbody>
            </table>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>EBITDA — 7 Anos</h2>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:130, marginBottom:24 }}>
              {calc.proj.map((yr,i)=>{
                const mx=Math.max(...calc.proj.map(y=>Math.abs(y.ebitda)),1);
                const h=Math.max((Math.abs(yr.ebitda)/(mx*1.2))*110,3);
                return(<div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:yr.ebitda<0?"#c00":"#000", marginBottom:3, fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(yr.ebitda)}€</div>
                  <div style={{ width:"60%", height:h, borderRadius:"2px 2px 0 0", background:yr.ebitda>=0?"#000":"#c00", transition:"height 0.3s" }} />
                  <div style={{ fontSize:10, color:"#666", marginTop:4, fontWeight:700 }}>A{yr.y}</div>
                </div>);
              })}
            </div>

            <div style={{ background:"#f8f8f8", border:"1px solid #eee", borderRadius:4, padding:16 }}>
              <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Proposta Investidores</h2>
              <div style={{ fontSize:11, lineHeight:1.7 }}>
                <p style={{ margin:"0 0 6px" }}><strong>Citywave Funchal</strong> — Onda {s.waveSize}m · {calc.wc.pumps} bombas · {calc.site.label} · Concessao {s.concessionYears} anos</p>
                <p style={{ margin:"0 0 4px" }}>Investimento total: <strong>{fmt(Math.round(calc.capex))}€</strong> {s.saltwaterUplift>0?`(inclui +${s.saltwaterUplift}% saltwater)`:"(freshwater)"}</p>
                <p style={{ margin:"0 0 4px" }}>Fundadores SCM: {fmt(Math.round(calc.joaoAmt+calc.rodrigoAmt))}€ ({s.joaoPct+s.rodrigoPct}%) + {s.sweatPct}% sweat equity</p>
                <p style={{ margin:"0 0 4px" }}>Capital externo: <strong>{fmt(Math.round(calc.invAmts.reduce((a,i)=>a+i.amt,0)))}€</strong></p>
                {s.bankPct>0&&<p style={{ margin:"0 0 4px" }}>Divida: {fmt(Math.round(calc.bankAmt))}€ ({s.bankPct}%)</p>}
                <p style={{ margin:"0 0 4px" }}>ROI anual investidor: <strong>{calc.invRet.length>0?fd(calc.invRet[0].roi)+"%":"—"}</strong></p>
                <p style={{ margin:0 }}>Payback estimado: <strong>{calc.invRet.length>0&&calc.invRet[0].pb<50?fd(calc.invRet[0].pb)+" anos":"N/A"}</strong></p>
              </div>
            </div>
          </>}
        </main>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:"3px solid #000", marginTop:32, paddingTop:12, display:"flex", justifyContent:"space-between", fontSize:9, color:"#999" }}>
        <span>Surf Clube da Madeira · Simulador Citywave Funchal v5</span>
        <span>Dados Citywave Munich, 12 Mai 2026 · Estimativas, nao constitui aconselhamento financeiro</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
