const { useState, useMemo, useCallback, useRef, useEffect } = React;

/* ═══════════════════════════════════════════════════════════
   CITYWAVE FUNCHAL — FINANCIAL SIMULATOR v5
   Updated with Discovery Call data (12 May 2026, Citywave Munich)
   B&W Editorial Design · All Values Editable
   ═══════════════════════════════════════════════════════════ */

const { MONTHS, SF, fmt, fmtK, fd, pct, WAVES, SITES, INIT, calculate } = CitywaveFinance;

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
  const [s, setS] = useState(CitywaveFinance.APP_INIT);
  const [tab, setTab] = useState("overview");
  const [component, setComponent] = useState("project");
  const [barInputs, setBarInputs] = useState(CitywaveHospitality.BAR_INIT);
  const [sharedInputs, setSharedInputs] = useState(CitywaveHospitality.SHARED_INIT);
  const updateBar = useCallback((k,v)=>setBarInputs(p=>({...p,[k]:v})),[]);
  const updateShared = useCallback((k,v)=>setSharedInputs(p=>({...p,[k]:v})),[]);
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
      const sizeChanged = newWaveSize !== p.waveSize;
      return {
        ...p,
        siteId,
        waveSize: newWaveSize,
        citywaveCost: newWave?.basePrice || p.citywaveCost,
        kwhMax: sizeChanged ? (newWave?.kwh || p.kwhMax) : p.kwhMax,
        pumpsCount: sizeChanged ? (newWave?.pumps || p.pumpsCount) : p.pumpsCount,
        sitePrep: site.id === "custom" ? p.sitePrep : site.sitePrep,
      };
    });
  }, []);

  const project = useMemo(() => CitywaveHospitality.calculateProject(s,barInputs,sharedInputs), [s,barInputs,sharedInputs]);
  const calc = project.wave;
  const displayed = component === 'wave' ? calc : component === 'bar' ? project.bar : project.combined;

  useEffect(()=>{if(s.salesMode==="tickets" && tab==="revenue")setTab("overview");},[s.salesMode,tab]);

  const fundAlert = Math.abs(calc.fundPct-100)>0.000001;
  const tabs=[{id:"overview",l:"Resumo"},{id:"revenue",l:"Receitas"},{id:"energy",l:"Energia"},{id:"investors",l:"Investidores"},{id:"projection",l:"P&L"},{id:"analise",l:"Analise"}].filter(t=>s.salesMode!=="tickets" || t.id!=="revenue");

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
            <h1 style={{ margin:"4px 0 0", fontSize:28, fontWeight:800, letterSpacing:-0.5, lineHeight:1 }}>Citywave Funchal · Onda + Bar</h1>
            <div style={{ fontSize:11, color:"#666", marginTop:4 }}>Onda {s.waveSize}m · Dados da reuniao Citywave de 12 Mai 2026 · Bar: cenario ilustrativo, nao validado</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800, lineHeight:1 }}>{fmtK(displayed.annRev)}€</div>
            <div style={{ fontSize:10, color:"#666" }}>Receita anual — {component === "wave" ? "onda sem bar" : component === "bar" ? "bar" : "conjunto"}</div>
          </div>
        </div>
        <div style={{fontSize:10,color:"#777",marginTop:8}}>Modelo revisto em 23/09/2026 · <a href="./reports.html">Relatorios e pressupostos atuais</a></div>
      </header>

      <nav aria-label="Componentes do projeto" style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['project','Conjunto'],['wave','Onda sem bar'],['bar','Bar / trabalhar']].map(([id,label])=><button key={id} aria-pressed={component===id} onClick={()=>setComponent(id)} style={{padding:'11px 18px',border:'1px solid #111',background:component===id?'#111':'#fff',color:component===id?'#fff':'#111',fontWeight:700,cursor:'pointer'}}>{label}</button>)}
      </nav>
      <SimulationControls s={s} b={barInputs} shared={sharedInputs} updateWave={u} project={project} />
      {component !== 'wave' && <ProjectPanel mode={component} project={project} s={s} b={barInputs} shared={sharedInputs} updateWave={u} updateBar={updateBar} updateShared={updateShared} onWave={()=>setComponent('wave')} />}
      {component === 'wave' && <>
      <p style={{fontSize:12,color:'#666'}}>Todos os separadores abaixo (incluindo Investidores, P&L e Analise) referem-se apenas a onda sem bar. Contas e retorno consolidados aparecem na vista Conjunto.</p>
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
          {l:"FCFE ANO 1",sub:"Apos imposto, divida e investimento",v:`${fmtK(calc.net)}€`,neg:calc.net<0},
          {l:"PAYBACK FCFF",v:calc.payback<50?`${fd(calc.payback)} anos`:"N/A"},
          {l:"ENERGIA/ANO",v:`${fmtK(calc.annEnergy)}€`,sub:`${fmt(Math.round(calc.dailyKwh))} kWh/dia`},
          {l:"CAPEX",v:`${fmtK(calc.capex)}€`},
          {l:"DIVIDENDOS",v:`${fmtK(calc.divs)}€`,sub:`Ate ${s.distPct}% do FCFE positivo`},
        ].map((m,i) => (
          <div key={i} style={{ background:"#fff", padding:"12px 14px", textAlign:"center" }}>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", fontWeight:600, marginBottom:4 }}>{m.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:m.neg?"#c00":"#000" }}>{m.v}</div>
            {m.sub && <div style={{ fontSize:9, color:"#999", marginTop:2 }}>{m.sub}</div>}
          </div>
        ))}
      </div>

      {calc.warnings.length > 0 && <div role="status" style={{background:"#fff8e8",border:"1px solid #e4c477",padding:12,marginBottom:16,fontSize:12,lineHeight:1.6}}>
        {calc.warnings.map((warning,i)=><div key={i}>{warning}</div>)}
      </div>}
      <p style={{fontSize:11,color:"#666"}}>Valores liquidos de IVA. Horizonte: {calc.N} anos. Precos e custos sao pressupostos editaveis.</p>
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
            <Row label="Anos de concessao" value={s.concessionYears} onChange={v=>u("concessionYears",v)} suffix=" anos" info="Determina o horizonte financeiro e a data de saida" min={3} max={25} />
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
                    onClick={()=>{u("waveSize",w.size); u("citywaveCost",w.basePrice); u("kwhMax",w.kwh); u("pumpsCount",w.pumps);}}
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
                    <div style={{ fontSize:7.5, opacity:0.7 }}>{fmtK(w.basePrice)}€</div>
                  </button>
                );
              })}
            </div>
            <Row label="Potencia max" value={s.kwhMax} onChange={v=>u("kwhMax",v)} suffix=" kW" info="Citywave confirmou max 600 kW para 10m. Editavel quando especificacao final chegar." min={100} max={1500} step={10} />
            <Row label="Numero de bombas" value={s.pumpsCount} onChange={v=>u("pumpsCount",v)} suffix="" info="Estimativa — Citywave nao confirmou. So afeta display, nao calculos." min={1} max={40} />
            <Row label="Carga media bombas" value={s.avgPumpLoad} onChange={v=>u("avgPumpLoad",v)} suffix="%" info="100% = potencia maxima durante todo o horario; perfil real a validar com Citywave" min={30} max={100} step={5} />
            <Row label="Preco eletricidade" value={s.electricityRate} onChange={v=>u("electricityRate",v)} suffix=" €/kWh" info="Hipotese nao validada pela EEM. Fatura depende de horarios, potencia e outros encargos." min={0.05} max={0.40} step={0.01} />
            <Row label="Horas operacao/dia" value={s.operatingHoursDay} onChange={v=>u("operatingHoursDay",v)} suffix="h" min={4} max={16} />
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:10, marginTop:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, lineHeight:1.8 }}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Consumo/dia</span><strong>{fmt(Math.round(calc.dailyKwh))} kWh</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Custo/dia</span><strong>{fmt(Math.round(calc.dailyKwh*s.electricityRate))}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>{calc.ticketMode?"Energia/bilhete":"Custo/sessao"}</span><strong>{fd(calc.ticketMode?calc.energyCostPerPerson:calc.costPerSess,2)}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Custo/ano</span><strong>{fmt(Math.round(calc.annEnergy))}€</strong></div>
            </div>
          </Section>

          {/* REVENUE */}
          {s.salesMode!=="tickets" && <Section title="Receitas" number="2">
            <div style={{ fontSize:10, color:"#999", marginBottom:6 }}>Precos liquidos de IVA · Venda limitada pela capacidade</div>
            <Row label="Duracao sessao" value={s.sessionMinutes} onChange={v=>u("sessionMinutes",v)} suffix=" min" min={15} max={90} step={15} />
            <Row label="Intervalo entre sessoes" value={s.sessionGapMinutes} onChange={v=>u("sessionGapMinutes",v)} suffix=" min" min={0} max={60} step={5} />
            <Row label="Pessoas por grupo" value={s.ridersPerSession} onChange={v=>u("ridersPerSession",v)} suffix="" min={1} max={10} />
            <Row label="Sessoes por hora" value={calc.slotsPerHour} suffix="" step={0.01} />
            <Row label="Procura de sessoes/dia (pico)" value={s.sessionsDay} onChange={v=>u("sessionsDay",v)} suffix="" min={1} max={50} info={`Media anual: ${fd(calc.avgPeopleDay,1)} participantes publicos/dia · ${fd(calc.avgOccupancy,0)}% ocupacao`} />
            <div style={{ background:"#f5f5f5", borderRadius:4, padding:6, margin:"4px 0 8px", fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Max/dia</span><strong>{calc.maxRidersDay} pessoas</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>Preco medio</span><strong>{fd(calc.effectiveAvgPrice,1)}€/pessoa</strong></div>
            </div>
            <div style={{ fontSize:10, fontWeight:700, marginTop:4, marginBottom:4 }}>Precos por nivel:</div>
            <Row label="Principiante" value={s.beginnerPrice} onChange={v=>u("beginnerPrice",v)} suffix="€" min={15} max={100} info={`${s.beginnerPct}% dos clientes`} />
            <Row label="Intermedio" value={s.intermediatePrice} onChange={v=>u("intermediatePrice",v)} suffix="€" min={15} max={100} info={`${s.intermediatePct}% dos clientes`} />
            <Row label="Avancado" value={s.advancedPrice} onChange={v=>u("advancedPrice",v)} suffix="€" min={15} max={100} info={`${s.advancedPct}%`} />
            <Row label="Criancas" value={s.kidsPrice} onChange={v=>u("kidsPrice",v)} suffix="€" min={10} max={80} info={`${s.kidsPct}%`} />
            <Row label="Eventos sem onda/mes" value={s.eventMonthly} onChange={v=>u("eventMonthly",v)} suffix="€" min={0} max={20000} step={500} />
          </Section>}

          {/* CAPEX */}
          <Section title="Investimento (CAPEX)" number="3" open={true}>
            <div style={{ fontSize:10, color:"#888", marginBottom:8, lineHeight:1.5 }}>
              Pacote Citywave confirmado: equipamento + instalacao (€89k) + shipping. Sem royalties.
            </div>
            <Row label={`Citywave ${s.waveSize}m (base)`} value={s.citywaveCost} onChange={v=>u("citywaveCost",v)} suffix="€" info="10m: €1,7-1,8M · 7,5m: €1,2-1,3M" min={500000} max={4000000} step={50000} />
            <Row label="Saltwater uplift" value={s.saltwaterUplift} onChange={v=>u("saltwaterUplift",v)} suffix="%" info="⚠ Preco exato pendente Citywave. Anti-corrosao + bombas SW. Necessidade tecnica e enquadramento local por confirmar." min={0} max={50} step={5} />
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
            <Row label="Peso sweat equity fundadores" value={s.sweatPct} onChange={v=>u("sweatPct",v)} suffix=" unidades" info={`Peso normalizado com o capital proprio: ${fd(s.sweatPct/(calc.eqPct+s.sweatPct||1)*100)}% final, dividido 50/50.`} min={0} max={40} />
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
              <Row label="Taxa juro" value={s.loanRate} onChange={v=>u("loanRate",v)} suffix="%" min={0} max={12} step={0.25} indent />
              <Row label="Prazo" value={s.loanYears} onChange={v=>u("loanYears",v)} suffix=" anos" min={2} max={25} indent />
              <div style={{ fontSize:11, color:"#666", fontFamily:"'IBM Plex Mono',monospace", paddingLeft:20, marginTop:2 }}>
                Prestacao: <strong>{fmt(Math.round(calc.mp))}€/mes</strong> · Anual: {fmt(Math.round(calc.annDebt))}€
              </div>
            </>}
            <div style={{ borderTop:"1px solid #eee", marginTop:8, paddingTop:8 }}>
              <Row label="Dividendos" value={s.distPct} onChange={v=>u("distPct",v)} suffix="%" info="Percentagem do FCFE positivo, limitada a resultados acumulados" min={0} max={100} step={5} />
              <Row label="Management fee" value={s.mgmtPct} onChange={v=>u("mgmtPct",v)} suffix="% receita" info="Custo operacional incluido no EBITDA; dividido pelos fundadores" min={0} max={20} step={0.5} />
            </div>
          </Section>
        </aside>

        {/* ═══ RIGHT ═══ */}
        <main style={{minWidth:0}}>

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
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Modelo de Receitas — Capacidade e Precos Liquidos</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:14, marginBottom:16, fontSize:11, lineHeight:1.6, color:"#444" }}>
              <p style={{margin:"0 0 6px"}}><strong style={{color:"#000"}}>Cada pessoa paga por sessao</strong>, com preco diferenciado por nivel. Principiantes incluem prancha, fato e instrutor.</p>
              <p style={{margin:0}}>Precos liquidos de IVA. Privadas substituem sessoes publicas. Material incluido exceto nos avancados; coaching extra desligado no cenario base. Eventos e cards nao incluem tempo de onda. Duracao e participantes sao pressupostos editaveis.</p>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>1. Configuracao das Sessoes</h2>
            <div className="twocol-charts" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <Row label="Duracao sessao" value={s.sessionMinutes} onChange={v=>u("sessionMinutes",v)} suffix=" min" min={15} max={90} step={15} />
            <Row label="Intervalo entre sessoes" value={s.sessionGapMinutes} onChange={v=>u("sessionGapMinutes",v)} suffix=" min" min={0} max={60} step={5} />
                <Row label="Pessoas por grupo" value={s.ridersPerSession} onChange={v=>u("ridersPerSession",v)} suffix="" min={1} max={10} />
                <Row label="Sessoes por hora" value={calc.slotsPerHour} suffix="" step={0.01} />
                <Row label="Procura de sessoes/dia (pico)" value={s.sessionsDay} onChange={v=>u("sessionsDay",v)} suffix="" min={1} max={50} info={`Capacidade: ${calc.maxSlotsDay}/dia · Ocupacao anual: ${fd(calc.avgOccupancy,0)}%`} />
              </div>
              <div style={{ background:"#000", borderRadius:4, padding:14, color:"#fff" }}>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#888", marginBottom:10 }}>Capacidade</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{fd(calc.ridersPerHour,1)}</div><div style={{ fontSize:9, color:"#888" }}>pessoas / hora</div></div>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{calc.maxRidersDay}</div><div style={{ fontSize:9, color:"#888" }}>max pessoas / dia</div></div>
                  <div><div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800 }}>{fd(calc.avgPeopleDay,1)}</div><div style={{ fontSize:9, color:"#888" }}>participantes publicos / dia (media)</div></div>
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
                    <td style={{ padding:"8px 6px", fontSize:10, color:"#666" }}>Prancha + fato + acompanhamento</td>
                  </tr>
                  <tr style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"8px 6px", fontWeight:600 }}>Avancado / Pro</td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.advancedPrice} onChange={v=>u("advancedPrice",v)} suffix="€" min={15} max={100} /></td>
                    <td style={{ padding:"8px 6px" }}><Editable value={s.advancedPct} onChange={v=>u("advancedPct",v)} suffix="%" min={0} max={100} /></td>
                    <td style={{ padding:"8px 6px", fontSize:10, color:"#666" }}>Material proprio + seguranca</td>
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
                  <div style={{ fontSize:8, letterSpacing:1, color:"#999" }}>ENERGIA / PARTICIPANTE PUBLICO</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800 }}>{fd(calc.energyCostPerPerson,2)}€</div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>3. Receitas Extra</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:12, marginBottom:20 }}>
              <Row label="Coaching extra opcional (% pessoas)" value={s.clinicPct} onChange={v=>u("clinicPct",v)} suffix="%" info="Desligado por defeito. Apenas servico distinto do acompanhamento incluido; validar custo e tempo." min={0} max={30} />
              <Row label="Preco coaching extra opcional" value={s.clinicPrice} onChange={v=>u("clinicPrice",v)} suffix="€/pessoa" min={20} max={200} />
              <Row label="Onda Privada (% sessoes)" value={s.privatePct} onChange={v=>u("privatePct",v)} suffix="%" info="Substitui sessoes publicas; nao acresce capacidade" min={0} max={30} />
              <Row label="Participantes por privada" value={s.privateGroupSize} onChange={v=>u("privateGroupSize",v)} suffix="pessoas" min={1} max={20} info="Usado no consumo de material e nas visitas ao bar" />
              <Row label="Preco Onda Privada" value={s.privatePrice} onChange={v=>u("privatePrice",v)} suffix="€/sessao" min={50} max={500} step={10} />
              <Row label="Avancados que alugam material (%)" value={s.rentalAdvancedPct} onChange={v=>u("rentalAdvancedPct",v)} suffix="%" info="Apenas avancados; nos restantes niveis o material esta incluido" min={0} max={80} />
              <Row label="Preco aluguer" value={s.rentalAdvancedPrice} onChange={v=>u("rentalAdvancedPrice",v)} suffix="€" min={5} max={30} />
              <Row label="Bonos (% com desconto)" value={s.bonoPct} onChange={v=>u("bonoPct",v)} suffix="%" info="Clientes com pacotes 10/20 sessoes" min={0} max={50} />
              <Row label="Desconto medio bonos" value={s.bonoDiscount} onChange={v=>u("bonoDiscount",v)} suffix="%" min={5} max={30} />
              <Row label="Eventos sem onda/mes" value={s.eventMonthly} onChange={v=>u("eventMonthly",v)} suffix="€" min={0} max={20000} step={500} />
              <Row label="Community Cards sem sessoes/ano" value={s.communityCards} onChange={v=>u("communityCards",v)} suffix="" min={0} max={500} />
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
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Onda {s.waveSize}m — {s.pumpsCount} Bombas (estimado)</h2>
            <div style={{ background:"#f8f8f8", borderRadius:4, padding:10, marginBottom:14, fontSize:11, color:"#444" }}>
              Hipotese atual: {s.kwhMax} kW para a onda de {s.waveSize}m. Referencia da reuniao para 10m: maximo 600 kW. Perfil de consumo e numero de bombas a confirmar. Comparacoes de outros tamanhos sao estimativas; encargos adicionais ficam separados.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"#000", borderRadius:2, overflow:"hidden", marginBottom:20 }}>
              {[
                {l:"BOMBAS",v:s.pumpsCount},{l:"KW MAX",v:s.kwhMax},
                {l:"POTENCIA MEDIA (kW)",v:Math.round(calc.effKwh)},{l:"KWH/DIA",v:Math.round(calc.dailyKwh)},
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
                {["Onda","Bombas","kW max","kWh/dia","Custo/dia","Custo/ano"].map(h=><th key={h} style={{ padding:"8px 6px", textAlign:"right", fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</th>)}
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
              <tbody>{[...new Set([0.08,0.10,0.13,s.electricityRate,0.18,0.20,0.25,0.30])].sort((a,b)=>a-b).map(r=>{
                const ec=calc.dailyKwh*r*s.opDays;const eb=calc.annRev-(calc.opex-calc.annEnergy+ec);const d=eb-calc.ebitda;const cur=r===s.electricityRate;
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
              <div style={{display:"flex",justifyContent:"space-between"}}><span>- Imposto sobre resultado apos juros</span><span>-{fmt(Math.round(calc.first.equityTax))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>- Investimento de manutencao</span><span>-{fmt(Math.round(calc.maintCapex))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:"2px solid #000",paddingTop:4,fontWeight:800}}><span>= FCFE (antes de distribuicao)</span><span>{fmt(Math.round(calc.net))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Reforco de capital necessario</span><span>{fmt(Math.round(calc.first.capitalCall))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Resultado liquido (limite contabilistico)</span><span>{fmt(Math.round(calc.first.netIncome))}€</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span>→ Dividendos (ate {s.distPct}% da caixa positiva)</span><strong>{fmt(Math.round(calc.divs))}€</strong></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>→ Caixa retida no fim do ano</span><span>{fmt(Math.round(calc.reinv))}€</span></div>
            </div>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Retorno por Stakeholder (Ano 1)</h2>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10, marginBottom:20 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["","Capital","Own%","Dividendo","Mgmt","Total/Ano","Yield dividendos","Payback capital"].map(h=><th key={h} style={{ padding:"7px 4px", textAlign:"right", fontWeight:700, fontSize:9 }}>{h}</th>)}
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
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{calc.valid && r.cash>0?fd(r.div/r.cash*100)+"%":"—"}</td>
                    <td style={{ padding:"6px 4px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{calc.valid && Number.isFinite(CitywaveFinance.paybackOf(r.cash,calc.proj.map(y=>(y.divs-y.capitalCall)*r.own/100)))?fd(CitywaveFinance.paybackOf(r.cash,calc.proj.map(y=>(y.divs-y.capitalCall)*r.own/100)))+"a":"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Retorno de Capital Acumulado — {calc.N} Anos</h2>
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
            <div style={{ fontSize:9, color:"#999", marginTop:4 }}>Dividendos menos reforcos de capital e investimento inicial. Exclui remuneracao de gestao e valor de saida. Crescimento composto; volume de participantes constante.</div>
          </>}

          {/* PROJECTION */}
          {tab==="analise" && <>
            {/* ── INTRO ── */}
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Analise Financeira Avancada</h2>
            <div style={{ background:"#f8f8f8", borderLeft:"3px solid #000", borderRadius:4, padding:12, marginBottom:20, fontSize:11, lineHeight:1.6, color:"#444" }}>
              Uma unica projecao ate ao fim da concessao. Receitas e custos liquidos de IVA. Fluxos do projeto separados dos dividendos, reforcos de capital e valor de saida dos acionistas.
            </div>

            {/* ── CAPM INPUTS ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>1. CAPM · Custo do Capital</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }} className="analise-grid-2">
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:10, fontWeight:700, marginBottom:6, color:"#666" }}>INPUTS DE MERCADO</div>
                <Row label="Taxa sem risco (rf)" value={s.rfRate} onChange={v=>u("rfRate",v)} suffix="%" info="Hipotese editavel, nao uma cotacao de mercado" min={0} max={10} step={0.1} />
                <Row label="Premio de risco mercado" value={s.marketPremium} onChange={v=>u("marketPremium",v)} suffix="%" info="Premio de risco assumido" min={3} max={12} step={0.1} />
                <Row label="Beta nao-alavancado" value={s.unleveredBeta} onChange={v=>u("unleveredBeta",v)} suffix="" info="Beta assumido, a fundamentar com comparaveis" min={0.3} max={2} step={0.05} />
                <Row label="Taxa imposto" value={s.taxRate} onChange={v=>u("taxRate",v)} suffix="%" info="Taxa efetiva assumida; validar enquadramento fiscal" min={0} max={50} step={0.1} />
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

            {/* ── FREE CASH FLOW ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>2. Free Cash Flow to Firm (FCFF)</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }} className="analise-grid-3">
              <Row label="Anos de concessao" value={s.concessionYears} onChange={v=>u("concessionYears",v)} suffix="" info="Mesmo horizonte em todos os separadores" min={3} max={25} />
              <Row label="Depreciacao" value={s.depreciationYears} onChange={v=>u("depreciationYears",v)} suffix=" anos" info="Vida util assumida; novos investimentos depreciam a partir do ano seguinte" min={5} max={25} />
              <Row label="Maint. CapEx" value={s.maintCapexPct} onChange={v=>u("maintCapexPct",v)} suffix="% capex/ano" min={0} max={10} step={0.5} />
            </div>
            <Row label="Crescimento anual dos precos/receitas" value={s.revenueGrowth} onChange={v=>u("revenueGrowth",v)} suffix="%" min={-20} max={20} step={0.5} />
            <Row label="Crescimento custos fixos e energia" value={s.costGrowth} onChange={v=>u("costGrowth",v)} suffix="%" min={-20} max={20} step={0.5} />
            <Row label="Venda residual no fim da concessao" value={s.exitValue} onChange={v=>u("exitValue",v)} suffix="€" info="Liquido de impostos e custos de saida; pode ser negativo" min={-20000000} max={20000000} step={10000} />

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
                {l:"PV FCFF DA CONCESSAO", v:`${fmtK(calc.pvFcff)}€`},
                {l:"VENDA RESIDUAL", v:`${fmtK(calc.terminalValue)}€`, sub:`Saida no ano ${calc.N}`},
                {l:"PV VENDA RESIDUAL", v:`${fmtK(calc.pvTerminal)}€`},
                {l:"ENTERPRISE VALUE", v:`${fmtK(calc.enterpriseValue)}€`},
                {l:"NPV PROJETO", v:`${fmtK(calc.npvProject)}€`, neg:calc.npvProject<0, sub:"EV - CAPEX inicial"},
                {l:"IRR PROJETO", v:isFinite(calc.projectIRR)?pct(calc.projectIRR):"N/A", sub:`vs WACC ${pct(calc.wacc)}`},
                {l:"IRR EQUITY", v:isFinite(calc.equityIRR)?pct(calc.equityIRR):"N/A", sub:"Dividendos, reforcos e saida"},
              ].map((m,i)=>(
                <div key={i} style={{ background:"#fff", padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, letterSpacing:1.5, textTransform:"uppercase", color:"#999", fontWeight:600 }}>{m.l}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:m.neg?"#c00":"#000", marginTop:3 }}>{m.v}</div>
                  {m.sub && <div style={{ fontSize:8, color:"#999", marginTop:2 }}>{m.sub}</div>}
                </div>
              ))}
            </div>

            {/* ── REVENUE SENSITIVITY ── */}
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>3. Sensibilidade à Receita</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>Sensibilidade a precos/receita por participante, com volume e horario constantes. Energia e marketing mantem-se; concessao, gestao e comissoes de venda acompanham a receita. FCFF do ano 1.</div>
            <div style={{ overflowX:"auto", marginBottom:20 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10.5, minWidth:640 }}>
                <thead><tr style={{ borderBottom:"2px solid #000" }}>
                  {["% Receita","Receita","OPEX","EBITDA","Margem","FCFE","FCFF","Payback"].map(h=>
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
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>4. Sensibilidade Bidirecional · EBITDA</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>Mesma regra da tabela anterior: preco/receita × tarifa de energia, com volume constante. Verde = EBITDA positivo; nao implica lucro liquido.</div>
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
            <h3 style={{ fontSize:12, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>5. Comparacao vs Investimentos Passivos</h3>
            <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>Taxas ilustrativas, nao cotacoes nem retornos historicos. Capitalizacao a 10 anos apenas para as alternativas; a TIR do projeto nao e uma taxa garantida de reinvestimento.</div>
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
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace" }}>—</td>
                    <td style={{ padding:"7px 5px" }} colSpan={2}>—</td>
                  </tr>
                  <tr style={{ background:"#222", color:"#fff" }}>
                    <td style={{ padding:"7px 5px", fontWeight:800 }}>CITYWAVE FUNCHAL · Equity (alavancado)</td>
                    <td style={{ padding:"7px 5px", fontSize:10 }}>Muito alto</td>
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:800 }}>{isFinite(calc.equityIRR)?pct(calc.equityIRR):"N/A"}</td>
                    <td style={{ padding:"7px 5px", fontFamily:"'IBM Plex Mono',monospace" }}>—</td>
                    <td style={{ padding:"7px 5px" }} colSpan={2}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── RISK METRICS ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:20 }} className="analise-risk-grid">
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>NPV / CAPEX</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:calc.npvProject<0?"#c00":"#000" }}>{fd(calc.npvProject/calc.capex,2)}x</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>VAL por euro investido · &gt;0 cria valor</div>
              </div>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>SPREAD vs WACC</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:(calc.projectIRR-calc.wacc)<0?"#c00":"#040" }}>{calc.projectIRR-calc.wacc>=0?"+":""}{pct(calc.projectIRR-calc.wacc)}</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>IRR - WACC · &gt;0 cria valor</div>
              </div>
              <div style={{ background:"#f8f8f8", borderRadius:4, padding:12 }}>
                <div style={{ fontSize:9, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:4 }}>EQUITY MULTIPLE</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800 }}>{Number.isFinite(calc.equityMultiple)?fd(calc.equityMultiple,2)+"x":"N/A"}</div>
                <div style={{ fontSize:9, color:"#888", marginTop:3 }}>Recebimentos / entradas de capital, incluindo reforcos</div>
              </div>
            </div>

            {/* ── NOTES ── */}
            <div style={{ background:"#f8f8f8", border:"1px solid #eee", borderRadius:4, padding:12, fontSize:10, lineHeight:1.6, color:"#555" }}>
              <strong style={{color:"#000"}}>Convencoes:</strong> Crescimento de receita via precos, com volume constante; custos fixos crescem separadamente. Energia funciona todas as horas e dias configurados. Investimento de manutencao desde o ano 1, constante em euros; depreciacao dos novos investimentos inicia no ano seguinte. WACC constante como taxa de desconto assumida, com pesos do financiamento inicial.
              <br/><br/>
              <strong style={{color:"#000"}}>Caixa e impostos:</strong> Imposto anual simplificado, sem reporte de prejuizos ou limites de deducao de juros. Dividendos limitados a caixa gerada e resultados acumulados positivos, antes de reservas legais ou contratuais. Defices anuais usam caixa retida e depois reforcos de capital proporcionais a participacao. Caixa retida nao rende juros e e distribuida na saida, deduzindo a divida residual.
              <br/><br/>
              <strong style={{color:"#000"}}>Limites:</strong> Valores liquidos de IVA; sem calendario de IVA, variacoes de fundo de maneio, pre-abertura ou impostos pessoais. A projecao anual nao mede necessidades de caixa dentro de cada ano. Sem perpetuidade: indique um valor residual liquido se aplicavel. TIR indisponivel para fluxos sem retorno positivo ou com multiplas mudancas de sinal. Payback usa fluxos acumulados e exclui a venda final.

            </div>
          </>}

          {tab==="projection" && <>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>P&L — {calc.N} Anos</h2>
            <div style={{overflowX:"auto"}}>
            <table style={{ width:"100%", minWidth:1050, borderCollapse:"collapse", fontSize:10.5, marginBottom:24 }}>
              <thead><tr style={{ borderBottom:"2px solid #000" }}>
                {["Ano","Receita","OPEX","EBITDA","FCFE","Dividendos","Resultado liquido","Imposto","Juros","Capital pago","Divida final","Reforco","Caixa final"].map(h=><th key={h} style={{ padding:"8px 5px", textAlign:"right", fontWeight:700, fontSize:10 }}>{h}</th>)}
              </tr></thead>
              <tbody>{calc.proj.map((yr,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontWeight:800 }}>Ano {yr.y}</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(yr.rev)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color:"#666" }}>{fmtK(yr.opex)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:yr.ebitda<0?"#c00":"#000" }}>{fmtK(yr.ebitda)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, color:yr.net<0?"#c00":"#000" }}>{fmtK(yr.net)}€</td>
                  <td style={{ padding:"7px 5px", textAlign:"right", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtK(yr.divs)}€</td>
                  {[yr.netIncome,yr.equityTax,yr.interest,yr.principal,yr.balance,yr.capitalCall,yr.cash].map((v,i)=><td key={i} style={{padding:"7px 5px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{fmtK(v)}€</td>) }
                </tr>
              ))}</tbody>
            </table>
            </div>

            <div style={{background:"#f8f8f8",padding:12,marginBottom:20,fontSize:12,lineHeight:1.6}}>
              Saida no ano {calc.N}: venda liquida {fmt(calc.terminalValue)}€ + caixa retida {fmt(calc.last.cash)}€ − divida pendente {fmt(calc.last.balance)}€ = <strong>{fmt(calc.equityExit)}€ para os acionistas</strong>.
              {calc.equityExit < 0 && <span> O saldo negativo representa capital adicional necessario para liquidar a divida.</span>}
            </div>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>EBITDA — {calc.N} Anos</h2>
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
                <p style={{ margin:"0 0 6px" }}><strong>Citywave Funchal</strong> — Onda {s.waveSize}m · {s.pumpsCount} bombas · {calc.site.label} · Concessao {s.concessionYears} anos</p>
                <p style={{ margin:"0 0 4px" }}>Investimento total: <strong>{fmt(Math.round(calc.capex))}€</strong> {s.saltwaterUplift>0?`(inclui +${s.saltwaterUplift}% saltwater)`:"(freshwater)"}</p>
                <p style={{ margin:"0 0 4px" }}>Fundadores SCM: {fmt(Math.round(calc.joaoAmt+calc.rodrigoAmt))}€ ({s.joaoPct+s.rodrigoPct}%) + {s.sweatPct} unidades de peso sweat equity</p>
                <p style={{ margin:"0 0 4px" }}>Capital externo: <strong>{fmt(Math.round(calc.invAmts.reduce((a,i)=>a+i.amt,0)))}€</strong></p>
                {s.bankPct>0&&<p style={{ margin:"0 0 4px" }}>Divida: {fmt(Math.round(calc.bankAmt))}€ ({s.bankPct}%)</p>}
                <p style={{ margin:"0 0 4px" }}>Yield de dividendos investidor (ano 1): <strong>{calc.invRet.length>0?fd(calc.invRet[0].roi)+"%":"—"}</strong></p>
                <p style={{ margin:0 }}>Payback estimado: <strong>{calc.invRet.length>0&&calc.invRet[0].pb<50?fd(calc.invRet[0].pb)+" anos":"N/A"}</strong></p>
              </div>
            </div>
          </>}
        </main>
      </div>

      </>}

      {/* FOOTER */}
      <footer style={{ borderTop:"3px solid #000", marginTop:32, paddingTop:12, display:"flex", justifyContent:"space-between", fontSize:9, color:"#999" }}>
        <span>Surf Clube da Madeira · Citywave + Bar</span>
        <span>Dados Citywave Munich, 12 Mai 2026 · Estimativas, nao constitui aconselhamento financeiro</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
