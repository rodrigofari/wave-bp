const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../src/finance.js');
const {BAR_INIT,SHARED_INIT,calculateProject,valueComponent}=require('../src/hospitality.js');
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
const sum=a=>a.reduce((x,y)=>x+y,0);
const run=(bar={},shared={},wave={})=>calculateProject({...F.INIT,...wave},{...BAR_INIT,...bar},{...SHARED_INIT,...shared});

test('the wave reference is unchanged by any bar assumption',()=>{
 const a=run(),b=run({externalDaily:200,works:500000},{barSharePct:90});
 for(const key of ['annRev','ebitda','capex','npvProject','projectIRR'])near(a.wave[key],b.wave[key]);
 near(a.wave.annRev,F.calculate(F.INIT).annRev);
});
test('common valuation conventions reproduce the original wave',()=>{
 const w=F.calculate(F.INIT),v=valueComponent({operatingYears:w.proj,capex:w.capex,exitValue:F.INIT.exitValue,s:F.INIT,wacc:w.wacc});
 for(const k of ['ebitda','npvProject','projectIRR','equityIRR','equityMultiple']) {
  if(Number.isNaN(w[k])) assert.ok(Number.isNaN(v[k]));
  else near(v[k],w[k]);
 }
 v.years.forEach((y,i)=>{near(y.fcff,w.proj[i].fcff);near(y.divs,w.proj[i].divs);near(y.balance,w.proj[i].balance);});
});
test('monthly sources, visits and costs reconcile to yearly bar totals',()=>{
 const p=run(),b=p.bar;
 near(sum(b.monthly.map(m=>m.rev)),b.annRev);near(sum(b.monthly.map(m=>m.ebitda)),b.ebitda);
 near(sum(b.revenueBreakdown.map(g=>g.rev)),b.annRev);near(sum(b.costBreakdown.map(c=>c.v)),b.opex);
 near(sum(b.revenueBreakdown.map(g=>g.visits)),b.visits);assert.equal(sum(b.days),BAR_INIT.opDays);
 near(b.monthly[0].groups[2].rev,b.days[0]*BAR_INIT.externalDaily*(1-.5*(1-F.SF[0]))*BAR_INIT.externalTicket);
});
test('stock is funded once, not depreciated, and recovered only at exit',()=>{
 const a=run({initialStock:0}),b=run({initialStock:5000});
 near(b.bar.investment-a.bar.investment,5000);near(b.bar.capex,a.bar.capex);
 near(b.bar.first.dep,a.bar.first.dep);near(b.bar.first.ebitda,a.bar.first.ebitda);
 near(b.bar.bankAmt-a.bar.bankAmt,1750);
 near(b.bar.projectCashflows.at(-1)-a.bar.projectCashflows.at(-1),5000);
 near(b.combined.investment,b.wave.capex+b.bar.capex+5000);
});
test('working visitors generate consumption per visit, never seat rental',()=>{
 const a=run({workDaily:6,workStay:3}),b=run({workDaily:6,workStay:4});
 const wa=a.bar.revenueBreakdown.find(g=>g.id==='workers'),wb=b.bar.revenueBreakdown.find(g=>g.id==='workers');
 near(wa.rev,6*340*12);near(wb.rev,wa.rev);assert.ok(wb.seatHours>wa.seatHours);
 const c=run({workDaily:0});near(c.bar.revenueBreakdown.find(g=>g.id==='workers').rev,0);
});
test('shared bar seats cap consumption instead of inventing capacity',()=>{
 const p=run({seats:5,workSeats:10,workDaily:100,externalDaily:500});
 p.bar.monthly.forEach(m=>{assert.ok(m.seatHours<=m.totalSeatHours+1e-6);near(m.groups[3].seatHours,5*6*m.days);assert.ok(m.unserved>0);});
 const zero=run({seats:0});near(zero.bar.annRev,0);
 const tooLong=run({workStay:7,workHours:6});near(tooLong.bar.revenueBreakdown.find(g=>g.id==='workers').visits,0);
});
test('wave exposure scales with conversion, private groups and co-opening',()=>{
 const a=run({surfConversion:0,companionConversion:0});near(a.bar.revenueBreakdown[0].rev,0);near(a.bar.revenueBreakdown[1].rev,0);
 const p=run({opDays:100});p.bar.monthly.forEach((m,i)=>assert.ok(m.overlapDays<=Math.min(m.days,p.wave.monthly[i].days)));
 const closed=run({}, {}, {opDays:0});near(closed.bar.revenueBreakdown[0].rev,0);near(closed.bar.revenueBreakdown[1].rev,0);assert.ok(closed.bar.revenueBreakdown[2].rev>0);
 const b=run({hoursDay:5,seats:200}),full=run({hoursDay:10,seats:200});near(b.bar.revenueBreakdown[0].rev,full.bar.revenueBreakdown[0].rev*.5);
});
test('shared overhead reallocation never improves total economics',()=>{
 const a=run({}, {barSharePct:0}),b=run({}, {barSharePct:100});
 near(b.bar.ebitda-a.bar.ebitda,-a.sharedPool);near(b.waveAllocated.ebitda-a.waveAllocated.ebitda,a.sharedPool);
 near(a.combined.ebitda,b.combined.ebitda);near(a.combined.npvProject,b.combined.npvProject);near(a.incremental.npv,b.incremental.npv);
 a.combined.years.forEach((y,i)=>near(y.fcff,b.combined.years[i].fcff));
 const extra=run({}, {extraMonth:1000});near(run().combined.ebitda-extra.combined.ebitda,12000);
});
test('operational consolidation is additive and monthly totals agree',()=>{
 for(const shared of [{},{extraMonth:700,barSharePct:55},{accountingPct:0,marketingPct:20,miscPct:10}]){
 const p=run({},shared);
 near(p.combined.annRev,p.waveAllocated.annRev+p.bar.annRev);near(p.combined.opex,p.waveAllocated.opex+p.bar.opex);
 near(p.combined.ebitda,p.wave.ebitda+p.bar.directEBITDA-p.extraSharedAnnual);
 near(sum(p.combined.monthly.map(m=>m.ebitda)),p.combined.ebitda);
 near(sum(p.waveAllocated.monthly.map(m=>m.ebitda)),p.waveAllocated.ebitda);
 p.combined.years.forEach((y,i)=>{near(y.ebitda,p.waveAllocated.years[i].ebitda+p.bar.years[i].ebitda);near(y.dep,p.waveAllocated.years[i].dep+p.bar.years[i].dep);});
 }
});
test('consolidated taxes are recalculated, not summed across analytical units',()=>{
 const p=run({}, {}, {sessionsDay:8});
 assert.ok(p.waveAllocated.first.ebit<0);assert.ok(p.bar.first.ebit>0);
 near(p.combined.first.tax,Math.max(0,p.combined.first.ebit*F.INIT.taxRate/100));
 assert.ok(p.combined.first.tax<p.waveAllocated.first.tax+p.bar.first.tax);
 near(p.taxReconciliation,p.waveAllocated.first.tax+p.bar.first.tax-p.combined.first.tax);
});
test('incremental value reconciles against the unchanged wave reference',()=>{
 const p=run();near(p.incremental.npv,p.combined.npvProject-p.wave.npvProject);
 near(p.incremental.ebitda,p.combined.ebitda-p.wave.ebitda);
 near(p.incremental.investment,p.combined.investment-p.wave.capex);
 near(F.npv(p.wave.wacc,p.incremental.flows),p.incremental.npv);
 near(p.withoutWaveCustomers.revenueBreakdown[0].rev,0);near(p.withoutWaveCustomers.revenueBreakdown[1].rev,0);
});
test('break-even is EBITDA zero at the same mix and contribution margin',()=>{
 const b=run().bar;
 near(b.breakEvenRevenue*b.contributionMargin-b.fixedDirect-b.sharedYear1,0);
 assert.ok(Number.isNaN(run({cogsPct:95,paymentPct:5,concessionPct:5}).bar.breakEvenRevenue));
});
test('consolidated debt, calls, dividends and exit reconcile',()=>{
 for(const changes of [{},{loanYears:5},{loanYears:15},{sessionsDay:1}]){
 const p=run({}, {}, changes), c=p.combined;
 c.years.forEach(y=>{near(y.fcfe,y.netIncome+y.dep-y.maintCapex-y.principal);assert.ok(y.divs<=Math.max(0,y.fcfe)*F.INIT.distPct/100+1e-6);});
 near(c.equityCashflows.at(-1),c.last.divs-c.last.capitalCall+c.equityExit);
 near(c.equityExit,c.terminalValue+c.last.cash-c.last.balance);
 near(F.npv(c.wacc,c.projectCashflows),c.npvProject);
 if(changes.loanYears===5)c.years.slice(5).forEach(y=>near(y.debt,0));
 if(Number.isFinite(c.projectIRR))near(F.npv(c.projectIRR,c.projectCashflows),0,.01);
 }
});
