/* Shared, dependency-free financial model. Browser global and Node exports. */
(function(root) {
"use strict";
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const SF = [0.55,0.50,0.65,0.75,0.90,1.0,1.0,1.0,0.90,0.75,0.60,0.50];
const fmt = n => Number.isFinite(n) ? n.toLocaleString(root.CitywaveI18n?.getLanguage()==="en"?"en-GB":"pt-PT",{maximumFractionDigits:0}) : "—";
const fmtK = n => !Number.isFinite(n) ? "—" : Math.abs(n)>=1e6?(n/1e6).toFixed(2)+"M":Math.abs(n)>=1000?(n/1000).toFixed(0)+"K":fmt(n);
const fd = (n,d=1) => Number.isFinite(n) ? n.toFixed(d) : "—";
const pct = n => Number.isFinite(n) ? (n*100).toFixed(1)+"%" : "—";

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
  salesMode:"sessions", ticketsDay:70, ticketPrice:41.807, ticketMinutes:8, turnaroundMinutes:1,
  distributionPct:0, commissionPct:20, equipmentPerVisit:0, energyOtherMonth:0,
  // Site
  siteId:"concrete",
  concessionYears:10, // financial horizon = concession term
  // Revenue — Honna model
  sessionMinutes:60, sessionGapMinutes:0, ridersPerSession:6,
  beginnerPct:45, beginnerPrice:49,
  intermediatePct:30, intermediatePrice:39,
  advancedPct:15, advancedPrice:39,
  kidsPct:10, kidsPrice:35,
  privatePct:5, privatePrice:250, privateGroupSize:6,
  clinicPct:0, clinicPrice:75, // Optional separate coaching, disabled in the base experience
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
  waveSize:10, kwhMax:600, pumpsCount:15, electricityRate:0.16, operatingHoursDay:10, avgPumpLoad:100,
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
  taxRate:22.5,            // editable effective tax assumption, not a statutory rate
  depreciationYears:15,    // equipamento + infra (vida util fiscal)
  maintCapexPct:2,         // % do CAPEX/ano (manutencao capitalizada)
  exitValue:0,             // net after-tax asset disposal proceeds at concession end
  revenueGrowth:3, costGrowth:2,
  rfRate:3.0,              // editable discount-rate assumption
  marketPremium:6.0,       // equity risk premium EU
  unleveredBeta:0.85,      // bottom-up leisure (Damodaran)
};


const sum = values => values.reduce((a, b) => a + b, 0);
const npv = (rate, flows) => sum(flows.map((cf, t) => cf / (1 + rate) ** t));
// Only conventional investment flows have an unambiguous IRR here. NaN means
// unavailable/ambiguous, never an arbitrary last Newton iteration.
function irr(flows) {
  if (!flows.every(Number.isFinite) || flows[0] >= 0) return NaN;
  const signs = flows.filter(x => x !== 0).map(Math.sign);
  if (signs.filter((x, i) => i && x !== signs[i - 1]).length !== 1 || !flows.some(x => x > 0)) return NaN;
  const scale = Math.max(...flows.map(Math.abs));
  const f = rate => npv(rate, flows.map(x => x / scale));
  let lo = -0.999999, hi = 1;
  while (f(hi) > 0 && hi < 1e12) hi = hi * 2 + 1;
  if (!(f(lo) > 0 && f(hi) <= 0)) return NaN;
  for (let i = 0; i < 250; i++) {
    const mid = (lo + hi) / 2, value = f(mid);
    if (Math.abs(value) < 1e-10) return mid;
    if (value > 0) lo = mid; else hi = mid;
  }
  const result = (lo + hi) / 2;
  return Math.abs(f(result)) < 1e-8 ? result : NaN;
}
function paybackOf(initial, flows) {
  if (initial <= 0) return NaN;
  let balance = -initial;
  for (let i = 0; i < flows.length; i++) {
    const previous = balance;
    balance += flows[i];
    if (balance >= 0) return i + (-previous / flows[i]);
  }
  return Infinity;
}
function debtSchedule(principal, annualRate, years, horizon) {
  const rate = annualRate / 100 / 12, months = Math.round(years * 12);
  const payment = principal === 0 ? 0 : rate === 0 ? principal / months : principal * rate / (1 - (1 + rate) ** -months);
  let balance = principal;
  const annual = Array.from({length:horizon}, (_, y) => {
    let interest = 0, repayment = 0;
    for (let m = 0; m < 12; m++) {
      if (y * 12 + m >= months || balance < 1e-8) continue;
      const charge = balance * rate;
      const capital = Math.min(balance, Math.max(0, payment - charge));
      interest += charge; repayment += capital; balance -= capital;
    }
    if (Math.abs(balance) < 1e-7) balance = 0;
    return {interest, principal:repayment, debt:interest + repayment, balance};
  });
  return {payment, annual};
}
// Largest remainder allocation: whole operating days, exact annual total.
function allocateDays(total) {
  const calendar = [31,28,31,30,31,30,31,31,30,31,30,31];
  const raw = calendar.map(d => d * total / 365), result = raw.map(Math.floor);
  const order = raw.map((n, i) => ({i, fraction:n - Math.floor(n)})).sort((a,b) => b.fraction - a.fraction || a.i - b.i);
  for (let i = 0; i < total - sum(raw.map(Math.floor)); i++) result[order[i].i]++;
  return result;
}
function calculate(input) {
  const s = {...INIT, ...input};
  const warnings = [];
  const wc = WAVES.find(w => w.size === s.waveSize) || WAVES[2];
  const site = SITES.find(x => x.id === s.siteId) || SITES[1];
  const siteFitsWave = site.id === 'custom' || s.waveSize <= site.maxWave;
  const N = Math.max(1, Math.round(s.concessionYears));
  const opDays = Math.max(0, Math.min(365, Math.round(s.opDays)));
  const days = allocateDays(opDays);
  const slotsPerHour = 60 / (s.sessionMinutes + s.sessionGapMinutes);
  const maxSlotsDay = Math.floor(s.operatingHoursDay * slotsPerHour + 1e-9);
  const ridersPerHour = slotsPerHour * s.ridersPerSession;
  const ticketMode=s.salesMode === "tickets";
  const ticketCapacity=Math.floor(s.operatingHoursDay*60/(s.ticketMinutes+s.turnaroundMinutes));
  const maxRidersDay = ticketMode ? ticketCapacity : maxSlotsDay * s.ridersPerSession;
  const mixTotal = s.beginnerPct + s.intermediatePct + s.advancedPct + s.kidsPct;
  const mixValid = mixTotal > 0;
  if (!ticketMode && Math.abs(mixTotal - 100) > 1e-8) warnings.push(mixValid ? `Mix de clientes soma ${fd(mixTotal)}%: pesos normalizados para 100%.` : 'Mix de clientes vazio: configure pelo menos um segmento. Indicadores de retorno indisponiveis.');
  if (!ticketMode && s.sessionsDay > maxSlotsDay) warnings.push(`Procura de pico (${s.sessionsDay} sessoes/dia) excede a capacidade (${maxSlotsDay}). Vendas limitadas a capacidade em cada mes.`);
  if (!siteFitsWave) warnings.push('A onda selecionada excede a dimensao prevista para o local.');
  if(ticketMode && s.ticketsDay>ticketCapacity) warnings.push(`Procura de ${s.ticketsDay} bilhetes/dia excede capacidade de ${ticketCapacity}. Vendas limitadas pelo tempo de utilizacao e troca.`);
  const wtdPrice = ticketMode ? s.ticketPrice : mixValid ? (s.beginnerPct*s.beginnerPrice + s.intermediatePct*s.intermediatePrice + s.advancedPct*s.advancedPrice + s.kidsPct*s.kidsPrice) / mixTotal : 0;
  const effectiveAvgPrice = wtdPrice * (ticketMode ? 1 : 1 - s.bonoPct / 100 * s.bonoDiscount / 100);
  const effKwh = s.kwhMax * s.avgPumpLoad / 100;
  const dailyKwh = effKwh * s.operatingHoursDay;
  const annKwh = dailyKwh * opDays;
  const annEnergy = annKwh * s.electricityRate;
  const annStaff = s.staffCount * s.avgSalary * (1 + s.ssRate/100) * 14;
  const annWater = s.waterMonth*12, annMaint = s.maintMonth*12, annMktg = s.marketingMonth*12, annAcct = s.accountingMonth*12, annMisc = s.miscMonth*12;
  const fixedExEnergy = annStaff + annWater + annMaint + annMktg + annAcct + annMisc + s.insuranceYear + s.energyOtherMonth*12;
  const monthly = MONTHS.map((_, i) => {
    const sessions = ticketMode ? 0 : Math.min(maxSlotsDay, s.sessionsDay * SF[i]) * days[i];
    const privateSessions = sessions * s.privatePct/100;
    const publicSessions = sessions - privateSessions;
    const people = ticketMode ? Math.min(s.ticketsDay,ticketCapacity)*days[i] : publicSessions * s.ridersPerSession;
    // Clinics are supplements; private bookings replace public sessions.
    // Events/cards are non-wave ancillary sales and confer no included sessions.
    const revenue = ticketMode ? [people*effectiveAvgPrice,0,0,0,0,0] : [people*effectiveAvgPrice, people*s.clinicPct/100*s.clinicPrice,
      privateSessions*s.privatePrice, people*(mixValid ? s.advancedPct/mixTotal : 0)*s.rentalAdvancedPct/100*s.rentalAdvancedPrice,
      s.eventMonthly*SF[i], s.communityCards*s.communityPrice/12];
    const rev = sum(revenue), energy = dailyKwh * days[i] * s.electricityRate;
    const commission=rev*s.distributionPct/100*s.commissionPct/100;
    const equipment=(people+privateSessions*s.privateGroupSize)*s.equipmentPerVisit;
    const cost = energy + fixedExEnergy/12 + rev*(s.concessionRate+s.mgmtPct)/100+commission+equipment;
    return {days:days[i], sessions, privateSessions, publicSessions, people, revenue, rev, energy, commission, equipment, cost, ebitda:rev-cost};
  });
  const mRev = monthly.map(m=>m.rev), mCost = monthly.map(m=>m.cost), mProfit = monthly.map(m=>m.ebitda);
  const annRev = sum(mRev), opex = sum(mCost), ebitda = annRev-opex;
  const annConc = annRev*s.concessionRate/100, annMgmt = annRev*s.mgmtPct/100;
  const avgPeopleDay = opDays ? sum(monthly.map(m=>m.people))/opDays : 0;
  const peoplePerDay = avgPeopleDay;
  const annualSessions = sum(monthly.map(m=>m.sessions));
  const avgOccupancy = ticketMode ? (ticketCapacity*opDays ? sum(monthly.map(m=>m.people))/(ticketCapacity*opDays)*100 : 0) : maxSlotsDay*opDays ? annualSessions/(maxSlotsDay*opDays)*100 : 0;
  // Allocate wave energy by booked time between public and private products.
  const publicShare = ticketMode ? 1 : annualSessions ? sum(monthly.map(m=>m.publicSessions))/annualSessions : 0;
  const energyCostPerPerson = sum(monthly.map(m=>m.people)) ? annEnergy*publicShare/sum(monthly.map(m=>m.people)) : NaN;
  const costPerSess = annualSessions ? annEnergy/annualSessions : NaN;
  const citywaveTotal = s.citywaveCost*(1+s.saltwaterUplift/100);
  const baseCAPEX = citywaveTotal+s.installation+s.shipping+s.sitePrep+s.plumbing+s.electrical+s.permits;
  const contAmt = baseCAPEX*s.contingency/100, capex = baseCAPEX+contAmt;
  const invPct = sum(s.investors.map(i=>i.pct)), eqPct = s.joaoPct+s.rodrigoPct+invPct, fundPct = eqPct+s.bankPct;
  const fundingValid = Math.abs(fundPct-100)<1e-8 && eqPct>0;
  if (!fundingValid) warnings.push(`Financiamento ${fd(fundPct)}% e capital proprio ${fd(eqPct)}%: ajuste para 100% com capital proprio positivo. Retornos indisponiveis.`);
  const bankAmt = capex*s.bankPct/100, eqAmt = capex*eqPct/100;
  const joaoAmt = capex*s.joaoPct/100, rodrigoAmt = capex*s.rodrigoPct/100;
  const invAmts = s.investors.map(i=>({...i,amt:capex*i.pct/100}));
  // Preserve the existing economic agreement: sweat is a weight, not a final %.
  const ownBase = eqPct+s.sweatPct;
  const ownJ = ownBase ? (s.joaoPct+s.sweatPct/2)/ownBase*100 : 0;
  const ownR = ownBase ? (s.rodrigoPct+s.sweatPct/2)/ownBase*100 : 0;
  const ownInv = invAmts.map(i=>({...i,own:ownBase ? i.pct/ownBase*100 : 0}));
  const debt = debtSchedule(bankAmt,s.loanRate,s.loanYears,N), mp = debt.payment;
  const tax = s.taxRate/100, dRatio = s.bankPct/(fundPct||1), eRatio = 1-dRatio;
  const DE = eRatio>0 ? dRatio/eRatio : 0;
  const leveredBeta = s.unleveredBeta*(1+(1-tax)*DE);
  const costOfEquity = (s.rfRate+leveredBeta*s.marketPremium)/100;
  const costOfDebtAT = s.loanRate/100*(1-tax), wacc = eRatio*costOfEquity+dRatio*costOfDebtAT;
  const depreciation = capex/s.depreciationYears, maintCapex = capex*s.maintCapexPct/100;
  // Single operating-year calculation feeds projections and both sensitivities.
  function operatingYear(yr, revenueFactor=1, electricityRate=s.electricityRate) {
    const rev = annRev * (1+s.revenueGrowth/100)**yr * revenueFactor;
    const inflation = (1+s.costGrowth/100)**yr;
    const energy = annKwh*electricityRate*inflation;
    const mgmt = rev*s.mgmtPct/100, concession = rev*s.concessionRate/100;
    const commission=rev*s.distributionPct/100*s.commissionPct/100;
    const equipment=sum(monthly.map(m=>m.equipment))*inflation;
    const ox = (fixedExEnergy*inflation)+energy+mgmt+concession+commission+equipment;
    const eb = rev-ox;
    const dep = (yr<s.depreciationYears ? depreciation : 0) + Math.min(yr,s.depreciationYears)*maintCapex/s.depreciationYears;
    const ebit = eb-dep, unleveredTax = Math.max(0,ebit*tax);
    const debtY = debt.annual[yr];
    const equityTax = Math.max(0,(ebit-debtY.interest)*tax);
    const netIncome = ebit-debtY.interest-equityTax;
    const fcff = eb-unleveredTax-maintCapex;
    const fcfe = eb-equityTax-maintCapex-debtY.debt;
    return {y:yr+1,rev,opex:ox,energy,mgmt,concession,commission,equipment,ebitda:eb,dep,ebit,tax:unleveredTax,nopat:ebit-unleveredTax,maintCapex,fcff,equityTax,netIncome,fcfe,net:fcfe,...debtY};
  }
  let cash = 0, earnings = 0;
  const fcfYears = Array.from({length:N},(_,yr)=>{
    const y = operatingYear(yr);
    earnings += y.netIncome;
    const divs = Math.min(Math.max(0,y.fcfe)*s.distPct/100,Math.max(0,earnings));
    const capitalCall = Math.max(0,-(cash+y.fcfe-divs));
    cash += y.fcfe-divs+capitalCall; earnings -= divs;
    return {...y,divs,capitalCall,cash,retainedEarnings:earnings,
      j:divs*ownJ/100+y.mgmt/2,r:divs*ownR/100+y.mgmt/2,
      inv:ownInv.map(i=>({n:i.name,p:divs*i.own/100}))};
  });
  const first = fcfYears[0], last = fcfYears[N-1];
  const annDebt = first.debt, net = first.fcfe, dist0 = Math.max(0,first.fcfe);
  const divs = first.divs, reinv = first.cash, jProfit = first.j, rProfit = first.r;
  const terminalValue = s.exitValue;
  const pvFcff = sum(fcfYears.map(y=>y.fcff/(1+wacc)**y.y));
  const pvTerminal = terminalValue/(1+wacc)**N;
  const valid = fundingValid && (ticketMode || mixValid) && siteFitsWave;
  const enterpriseValue = valid ? pvFcff+pvTerminal : NaN;
  const npvProject = enterpriseValue-capex;
  const projectCashflows = [-capex,...fcfYears.map(y=>y.fcff)];
  projectCashflows[N] += terminalValue;
  // Retained cash is paid at exit; outstanding debt is settled, including deficits.
  const equityExit = terminalValue+last.cash-last.balance;
  const equityCashflows = [-eqAmt,...fcfYears.map(y=>y.divs-y.capitalCall)];
  equityCashflows[N] += equityExit;
  const projectIRR = valid ? irr(projectCashflows) : NaN;
  const equityIRR = valid ? irr(equityCashflows) : NaN;
  const equityMultiple = valid ? sum(equityCashflows.filter(x=>x>0)) / -sum(equityCashflows.filter(x=>x<0)) : NaN;
  const payback = valid ? paybackOf(capex,fcfYears.map(y=>y.fcff)) : NaN;
  const invRet = ownInv.map(i=>{
    const flows = [-i.amt,...fcfYears.map(y=>(y.divs-y.capitalCall)*i.own/100)];
    flows[N] += equityExit*i.own/100;
    return {...i,profit:divs*i.own/100,roi:valid && i.amt>0 ? divs*i.own/i.amt : NaN,
      pb:valid ? paybackOf(i.amt,fcfYears.map(y=>(y.divs-y.capitalCall)*i.own/100)) : NaN,
      irr:valid ? irr(flows) : NaN,cashflows:flows};
  });
  const proj = fcfYears;
  let cJ=-joaoAmt,cR=-rodrigoAmt;
  const cI=invAmts.map(i=>-i.amt);
  const cumRet=proj.map(y=>{
    // Capital returns exclude management wages and include further subscriptions.
    cJ+=(y.divs-y.capitalCall)*ownJ/100; cR+=(y.divs-y.capitalCall)*ownR/100;
    ownInv.forEach((i,j)=>{cI[j]+=(y.divs-y.capitalCall)*i.own/100;});
    return {y:y.y,j:cJ,r:cR,inv:ownInv.map((i,j)=>({n:i.name,c:cI[j]}))};
  });
  const revBk=[ticketMode?'Bilhetes':'Sessoes publicas','Surf Clinic (suplemento)','Onda Privada','Aluguer Equip.','Eventos sem uso da onda','Community Cards sem sessoes'].map((l,i)=>({l,v:sum(monthly.map(m=>m.revenue[i]))}));
  const costBk=[{l:'Energia',v:annEnergy},{l:'Pessoal',v:annStaff},{l:'Manutencao',v:annMaint},{l:'Agua',v:annWater},{l:'Seguro',v:s.insuranceYear},{l:'Marketing',v:annMktg},{l:'Concessao',v:annConc},{l:'Gestao',v:annMgmt},{l:'Outros',v:annAcct+annMisc},{l:'Potencia e consumos auxiliares',v:s.energyOtherMonth*12},{l:'Comissoes de venda',v:sum(monthly.map(m=>m.commission))},{l:'Material por utilizacao',v:sum(monthly.map(m=>m.equipment))}];
  const capexBk=[{l:`Citywave ${s.waveSize}m`,v:citywaveTotal},{l:'Instalacao',v:s.installation},{l:'Shipping',v:s.shipping},{l:'Preparacao local',v:s.sitePrep},{l:'Canalizacao',v:s.plumbing},{l:'Eletrica',v:s.electrical},{l:'Licencas e projeto',v:s.permits},{l:`Contingencia (${s.contingency}%)`,v:contAmt}];
  const energyComp=WAVES.map(w=>{const peak=w.size===s.waveSize?s.kwhMax:w.kwh;const k=peak*s.avgPumpLoad/100*s.operatingHoursDay;return {...w,pumps:w.size===s.waveSize?s.pumpsCount:w.pumps,kwh:peak,dKwh:k,aCost:k*opDays*s.electricityRate};});
  const capTableData=[{name:'Joao Febrer',cash:joaoAmt,cashPct:s.joaoPct,ownership:ownJ,type:'Fundador+Sweat'},{name:'Rodrigo Farinha',cash:rodrigoAmt,cashPct:s.rodrigoPct,ownership:ownR,type:'Fundador+Sweat'},...ownInv.map(i=>({name:i.name,cash:i.amt,cashPct:i.pct,ownership:i.own,type:'Investidor'}))];
  const revScenarios=[.5,.75,.9,1,1.1,1.25,1.5].map(p=>{const y=operatingYear(0,p);return {p,rev:y.rev,opx:y.opex,ebitda:y.ebitda,margin:y.rev?y.ebitda/y.rev:0,net:y.fcfe,fcf:y.fcff,payback:valid?paybackOf(capex,Array.from({length:N},(_,i)=>operatingYear(i,p).fcff)):NaN};});
  const sensRevPcts=[.7,.85,1,1.15,1.3];
  const sensElec=[...new Set([.10,.13,s.electricityRate,.18,.22])].sort((a,b)=>a-b);
  const sensMatrix=sensElec.map(er=>sensRevPcts.map(p=>operatingYear(0,p,er).ebitda));
  const benchmarks=[{name:'Taxa sem risco (hipotese)',yield:s.rfRate/100,risk:'Referencia'},{name:'Obrigacoes IG (hipotese)',yield:(s.rfRate+1.5)/100,risk:'Baixo'},{name:'Obrigacoes HY (hipotese)',yield:(s.rfRate+5)/100,risk:'Elevado'},{name:'Acoes (rf + premio assumido)',yield:(s.rfRate+s.marketPremium)/100,risk:'Elevado'}];
  const benchmarkRows=benchmarks.map(b=>({...b,excessProject:projectIRR-b.yield,excessEquity:equityIRR-b.yield,val10k10y:10000*(1+b.yield)**10}));
  if (sum(fcfYears.map(y=>y.capitalCall))>0 || equityExit<0) warnings.push('O cenario exige reforcos de capital. Estes entram na TIR e no multiplo dos acionistas; consulte o P&L.');
  return {wc,site,siteFitsWave,warnings,valid,monthly,days,N,mixTotal,ticketMode,ticketCapacity,
    citywaveTotal,capexBk,effKwh,dailyKwh,annKwh,annEnergy,costPerSess,capex,baseCAPEX,contAmt,eqAmt,eqPct,invPct,fundPct,
    bankAmt,joaoAmt,rodrigoAmt,invAmts,ownJ,ownR,ownInv,mp,annDebt,annStaff,opex,annConc,annMgmt,
    annRev,mRev,mCost,mProfit,ebitda,margin:annRev?ebitda/annRev:0,net,payback,dist0,divs,reinv,jProfit,rProfit,invRet,
    proj,cumRet,revBk,costBk,energyComp,capTableData,slotsPerHour,ridersPerHour,maxSlotsDay,maxRidersDay,avgOccupancy,avgPeopleDay,
    effectiveAvgPrice,energyCostPerPerson,wtdPrice,peoplePerDay,tax,dRatio,eRatio,DE,leveredBeta,costOfEquity,costOfDebtAT,wacc,
    depreciation,maintCapex,fcfYears,terminalValue,pvFcff,pvTerminal,enterpriseValue,npvProject,projectIRR,equityIRR,equityInvested:eqAmt,
    projectCashflows,equityCashflows,equityMultiple,equityExit,revScenarios,sensRevPcts,sensElec,sensMatrix,benchmarks,benchmarkRows,
    projectAnnReturn:projectIRR,equityAnnReturn:equityIRR,first,last};
}
const APP_INIT={...INIT,salesMode:"tickets",ridersPerSession:14};
const api = {APP_INIT,MONTHS,SF,fmt,fmtK,fd,pct,WAVES,SITES,INIT,calculate,npv,irr,debtSchedule,allocateDays,paybackOf};
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.CitywaveFinance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
