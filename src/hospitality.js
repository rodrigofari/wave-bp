/* Bar + wave component analysis. All bar defaults are illustrative assumptions. */
(function(root) {
'use strict';
const F = typeof module !== 'undefined' && module.exports ? require('./finance.js') : root.CitywaveFinance;
const {INIT, SF, calculate, allocateDays, debtSchedule, npv, irr, paybackOf} = F;
const sum = values => values.reduce((a,b)=>a+b,0);
const BAR_INIT = {
  seats:36, hoursDay:12, opDays:340,
  externalDaily:45, externalTicket:10.5, externalStay:0.8, seasonalPct:50,
  surfConversion:45, surfTicket:8, surfStay:0.75, privateGroupSize:6,
  companionsPerSurfer:0.5, companionConversion:60, companionTicket:8, companionStay:1,
  workSeats:10, workHours:6, workDaily:6, workTicket:12, workStay:3,
  cogsPct:32, paymentPct:1.5, concessionPct:5, mgmtPct:0,
  staffCount:3, salary:1250, utilitiesMonth:900, rentMonth:1500,
  insuranceMonth:150, otherMonth:350,
  works:65000, equipment:45000, furniture:20000, wifiSockets:5000,
  permits:5000, contingency:10, initialStock:5000,
  depreciationYears:10, maintCapexPct:3, revenueGrowth:3, costGrowth:2, exitValue:0,
};
const SHARED_INIT = {
  // These costs already exist in the wave inputs. They are transferred, not added.
  accountingPct:100, marketingPct:100, miscPct:100,
  barSharePct:25, extraMonth:0,
};

// Same conventions as the wave model: annual tax, no loss carry-forward,
// annuity debt, maintenance capex, dividends capped by accumulated earnings.
function valueComponent({operatingYears, capex, workingCapital=0, exitValue=0, s, wacc, valid=true}) {
  const investment = capex + workingCapital;
  const bankAmt = investment*s.bankPct/100;
  const eqPct = s.joaoPct+s.rodrigoPct+sum(s.investors.map(i=>i.pct));
  const eqAmt = investment*eqPct/100;
  const debt = debtSchedule(bankAmt,s.loanRate,s.loanYears,operatingYears.length);
  const taxRate = s.taxRate/100;
  let cash=0, earnings=0;
  const years = operatingYears.map((op,i)=>{
    const d=debt.annual[i], ebit=op.ebitda-op.dep;
    const tax=Math.max(0,ebit*taxRate), equityTax=Math.max(0,(ebit-d.interest)*taxRate);
    const netIncome=ebit-d.interest-equityTax;
    const fcff=op.ebitda-tax-op.maintCapex;
    const fcfe=op.ebitda-equityTax-op.maintCapex-d.debt;
    earnings+=netIncome;
    const divs=Math.min(Math.max(0,fcfe)*s.distPct/100,Math.max(0,earnings));
    const capitalCall=Math.max(0,-(cash+fcfe-divs));
    cash+=fcfe-divs+capitalCall;earnings-=divs;
    return {...op,y:i+1,...d,ebit,tax,equityTax,netIncome,fcff,fcfe,divs,capitalCall,cash,retainedEarnings:earnings};
  });
  const last=years.at(-1), first=years[0];
  // Initial inventory is tied-up working capital, recovered at exit at book value.
  const terminalValue=exitValue+workingCapital;
  const equityExit=terminalValue+last.cash-last.balance;
  const projectCashflows=[-investment,...years.map(y=>y.fcff)];
  projectCashflows[years.length]+=terminalValue;
  const equityCashflows=[-eqAmt,...years.map(y=>y.divs-y.capitalCall)];
  equityCashflows[years.length]+=equityExit;
  return {capex,workingCapital,investment,bankAmt,eqAmt,years,first,last,wacc,valid,
    annRev:first.rev,opex:first.opex,ebitda:first.ebitda,margin:first.rev?first.ebitda/first.rev:0,
    terminalValue,equityExit,projectCashflows,equityCashflows,
    npvProject:valid?npv(wacc,projectCashflows):NaN,
    projectIRR:valid?irr(projectCashflows):NaN,
    equityIRR:valid?irr(equityCashflows):NaN,
    payback:valid?paybackOf(investment,years.map(y=>y.fcff)):NaN,
    equityMultiple:valid&&eqAmt>0?sum(equityCashflows.filter(x=>x>0))/-sum(equityCashflows.filter(x=>x<0)):NaN};
}

function barOperations(b, wave, s, shared, trafficFactor=1) {
  const warnings=[];
  const days=allocateDays(Math.max(0,Math.min(365,Math.round(b.opDays))));
  const annStaff=b.staffCount*b.salary*(1+s.ssRate/100)*14;
  const fixedDirect=annStaff+12*(b.utilitiesMonth+b.rentMonth+b.insuranceMonth+b.otherMonth);
  const sharedPool=12*(s.accountingMonth*shared.accountingPct/100+s.marketingMonth*shared.marketingPct/100+s.miscMonth*shared.miscPct/100);
  const sharedYear1=(sharedPool+shared.extraMonth*12)*shared.barSharePct/100;
  const workSeats=Math.min(b.workSeats,b.seats);
  if(b.workSeats>b.seats) warnings.push('Os lugares para trabalhar fazem parte dos lugares do bar; o calculo limita-os ao total.');
  const monthly=days.map((d,i)=>{
    const waveMonth=wave.monthly[i];
    // Explicit co-opening assumption: days coincide up to the smaller count;
    // shorter bar opening hours reduce exposure proportionally.
    const overlapDays=Math.min(d,waveMonth.days);
    const hourOverlap=s.operatingHoursDay>0?Math.min(1,b.hoursDay/s.operatingHoursDay):0;
    const surfVisits=waveMonth.days>0 ? (waveMonth.people+waveMonth.privateSessions*b.privateGroupSize)*overlapDays/waveMonth.days*hourOverlap*trafficFactor : 0;
    const season=1-b.seasonalPct/100*(1-SF[i]);
    const requested=[
      {id:'surfers',label:'Surfistas',visits:surfVisits*b.surfConversion/100,ticket:b.surfTicket,stay:b.surfStay},
      {id:'companions',label:'Acompanhantes',visits:surfVisits*b.companionsPerSurfer*b.companionConversion/100,ticket:b.companionTicket,stay:b.companionStay},
      {id:'external',label:'Publico externo',visits:d*b.externalDaily*season,ticket:b.externalTicket,stay:b.externalStay},
      {id:'workers',label:'Clientes a trabalhar',visits:d*b.workDaily,ticket:b.workTicket,stay:b.workStay},
    ];
    const totalSeatHours=b.seats*b.hoursDay*d;
    const workerLimit=workSeats*Math.min(b.workHours,b.hoursDay)*d;
    const worker=requested[3];
    const workVisits=worker.stay>0&&worker.stay<=Math.min(b.workHours,b.hoursDay) ? Math.min(worker.visits,workerLimit/worker.stay) : 0;
    const workerHours=workVisits*worker.stay;
    const requestedOtherHours=sum(requested.slice(0,3).map(g=>g.visits*g.stay));
    const otherFactor=requestedOtherHours>0?Math.min(1,Math.max(0,totalSeatHours-workerHours)/requestedOtherHours):1;
    const groups=requested.map((g,j)=>{
      const visits=j===3?workVisits:g.visits*otherFactor;
      return {...g,requested:g.visits,visits,seatHours:visits*g.stay,rev:visits*g.ticket};
    });
    const rev=sum(groups.map(g=>g.rev));
    const cogs=rev*b.cogsPct/100, payments=rev*b.paymentPct/100;
    const concession=rev*b.concessionPct/100, mgmt=rev*b.mgmtPct/100;
    const variable=cogs+payments+concession+mgmt;
    const opexDirect=variable+fixedDirect/12, allocated=sharedYear1/12;
    return {days:d,overlapDays,surfVisits,groups,rev,cogs,payments,concession,mgmt,opexDirect,allocated,
      opex:opexDirect+allocated,ebitda:rev-opexDirect-allocated,
      seatHours:sum(groups.map(g=>g.seatHours)),totalSeatHours,
      unserved:sum(groups.map(g=>g.requested-g.visits))};
  });
  if(sum(monthly.map(m=>m.unserved))>1e-6) warnings.push('A procura excede as horas-lugar disponiveis ou a permanencia nao cabe no horario. O consumo contabiliza apenas visitas atendidas.');
  const baseCAPEX=b.works+b.equipment+b.furniture+b.wifiSockets+b.permits;
  const capex=baseCAPEX*(1+b.contingency/100), maintCapex=capex*b.maintCapexPct/100;
  const annRev=sum(monthly.map(m=>m.rev));
  const variablePct=(b.cogsPct+b.paymentPct+b.concessionPct+b.mgmtPct)/100;
  if(variablePct>=1) warnings.push('Custos variaveis iguais ou superiores a receita: nao existe ponto de equilibrio com estes precos e margens.');
  const revenueBreakdown=monthly[0].groups.map((g,j)=>({id:g.id,label:g.label,
    rev:sum(monthly.map(m=>m.groups[j].rev)),visits:sum(monthly.map(m=>m.groups[j].visits)),
    seatHours:sum(monthly.map(m=>m.groups[j].seatHours))}));
  const operatingYears=Array.from({length:wave.N},(_,i)=>{
    const rev=annRev*(1+b.revenueGrowth/100)**i;
    const directFixed=fixedDirect*(1+b.costGrowth/100)**i;
    const allocated=sharedYear1*(1+s.costGrowth/100)**i;
    const directOpex=directFixed+rev*variablePct;
    const dep=(i<b.depreciationYears?capex/b.depreciationYears:0)+Math.min(i,b.depreciationYears)*maintCapex/b.depreciationYears;
    return {rev,opex:directOpex+allocated,ebitda:rev-directOpex-allocated,dep,maintCapex,
      directFixed,directOpex,allocated,concession:rev*b.concessionPct/100,mgmt:rev*b.mgmtPct/100};
  });
  const visits=sum(revenueBreakdown.map(g=>g.visits));
  const avgTicket=visits?annRev/visits:NaN;
  const contributionMargin=1-variablePct;
  const breakEvenRevenue=contributionMargin>0?(fixedDirect+sharedYear1)/contributionMargin:NaN;
  const annDays=sum(days);
  return {monthly,days,warnings,annStaff,fixedDirect,sharedPool,sharedYear1,baseCAPEX,capex,
    workingCapital:b.initialStock,maintCapex,annRev,operatingYears,revenueBreakdown,contributionMargin,
    directEBITDA:annRev-(annRev*variablePct+fixedDirect),
    breakEvenRevenue,breakEvenCustomersDay:avgTicket>0&&annDays>0?breakEvenRevenue/avgTicket/annDays:NaN,
    avgTicket,visits,visitsDay:annDays?visits/annDays:0,
    occupancy:sum(monthly.map(m=>m.totalSeatHours))?sum(monthly.map(m=>m.seatHours))/sum(monthly.map(m=>m.totalSeatHours)):0,
    costBreakdown:[{label:'Produtos vendidos (CMVMC)',v:annRev*b.cogsPct/100},
      {label:'Pagamentos',v:annRev*b.paymentPct/100},{label:'Concessao',v:annRev*b.concessionPct/100},
      {label:'Gestao',v:annRev*b.mgmtPct/100},{label:'Equipa exclusiva do bar',v:annStaff},
      {label:'Energia, agua e internet',v:b.utilitiesMonth*12},{label:'Renda exclusiva / encargo fixo',v:b.rentMonth*12},
      {label:'Seguro exclusivo',v:b.insuranceMonth*12},{label:'Outros exclusivos',v:b.otherMonth*12},
      {label:'Custos comuns imputados',v:sharedYear1}]};
}

function calculateProject(waveInput=INIT,barInput=BAR_INIT,sharedInput=SHARED_INIT) {
  const s={...INIT,...waveInput}, b={...BAR_INIT,...barInput}, shared={...SHARED_INIT,...sharedInput};
  const wave=calculate(s);
  const operation=barOperations(b,wave,s,shared);
  const {sharedPool}=operation;
  const valid=wave.valid;
  const waveYears=wave.proj.map((y,i)=>{
    const inflation=(1+s.costGrowth/100)**i;
    const credit=sharedPool*shared.barSharePct/100*inflation;
    const extra=shared.extraMonth*12*(1-shared.barSharePct/100)*inflation;
    return {...y,opex:y.opex-credit+extra,ebitda:y.ebitda+credit-extra,allocated:(sharedPool+shared.extraMonth*12)*(1-shared.barSharePct/100)*inflation};
  });
  const common={s,wacc:wave.wacc,valid};
  const waveAllocated=valueComponent({...common,operatingYears:waveYears,capex:wave.capex,exitValue:s.exitValue});
  const bar={...operation,...valueComponent({...common,operatingYears:operation.operatingYears,capex:operation.capex,workingCapital:b.initialStock,exitValue:b.exitValue})};
  const totalYears=waveYears.map((w,i)=>{
    const by=bar.years[i];
    return {rev:w.rev+by.rev,opex:w.opex+by.opex,ebitda:w.ebitda+by.ebitda,
      dep:w.dep+by.dep,maintCapex:w.maintCapex+by.maintCapex};
  });
  // One operating entity: aggregate EBIT before tax. Do not add separate taxes,
  // IRRs or dividends, which are not additive.
  const combined=valueComponent({...common,operatingYears:totalYears,capex:wave.capex+bar.capex,
    workingCapital:b.initialStock,exitValue:s.exitValue+b.exitValue});
  combined.monthly=wave.monthly.map((w,i)=>({rev:w.rev+bar.monthly[i].rev,
    opex:w.cost+bar.monthly[i].opexDirect+shared.extraMonth,
    ebitda:w.ebitda+bar.monthly[i].rev-bar.monthly[i].opexDirect-shared.extraMonth}));
  waveAllocated.monthly=wave.monthly.map(w=>({rev:w.rev,
    opex:w.cost-sharedPool*shared.barSharePct/100/12+shared.extraMonth*(1-shared.barSharePct/100),
    ebitda:w.ebitda+sharedPool*shared.barSharePct/100/12-shared.extraMonth*(1-shared.barSharePct/100)}));
  const independent=barOperations(b,wave,s,shared,0);
  const withoutWaveCustomers={...independent,...valueComponent({...common,operatingYears:independent.operatingYears,
    capex:independent.capex,workingCapital:b.initialStock,exitValue:b.exitValue})};
  const incrementalFlows=combined.projectCashflows.map((cf,i)=>cf-wave.projectCashflows[i]);
  const incremental={investment:bar.investment,ebitda:combined.ebitda-wave.ebitda,
    fcff:combined.first.fcff-wave.first.fcff,
    npv:valid?npv(wave.wacc,incrementalFlows):NaN,
    irr:valid?irr(incrementalFlows):NaN,flows:incrementalFlows};
  return {wave,waveAllocated,bar,combined,withoutWaveCustomers,incremental,sharedPool,
    extraSharedAnnual:shared.extraMonth*12,shared,barInputs:b,
    taxReconciliation:waveAllocated.first.tax+bar.first.tax-combined.first.tax,
    warnings:[...wave.warnings,...bar.warnings]};
}
// Solve only within the explicit daily service capacity; never invent extra tickets.
function ticketBreakEven(waveInput,barInput,sharedInput) {
  const s={...INIT,...waveInput,salesMode:'tickets'};
  const base=calculateProject(s,barInput,sharedInput);
  if(!base.combined.valid)return {valid:false,capacity:base.wave.ticketCapacity};
  const capacity=base.wave.ticketCapacity;
  const solve=metric=>{
    const value=t=>metric(calculateProject({...s,ticketsDay:t},barInput,sharedInput));
    if(value(0)>=0)return 0;
    if(value(capacity)<0)return null;
    let lo=0,hi=capacity;
    for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(value(mid)>=0)hi=mid;else lo=mid;}
    return hi;
  };
  return {valid:true,capacity,
    operating:solve(p=>p.combined.ebitda),cash:solve(p=>p.combined.first.fcfe),
    investment:solve(p=>p.combined.npvProject)};
}
const api={BAR_INIT,SHARED_INIT,calculateProject,valueComponent,ticketBreakEven};
if(typeof module!=='undefined'&&module.exports) module.exports=api;
else root.CitywaveHospitality=api;
})(typeof globalThis!=='undefined'?globalThis:this);
