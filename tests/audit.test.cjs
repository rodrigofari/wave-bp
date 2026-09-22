const test=require('node:test');const assert=require('node:assert/strict');
const F=require('../src/finance');const H=require('../src/hospitality');
const near=(a,b,tol=1e-5)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
let seed=923;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
test('100 varied scenarios reconcile every annual and monthly financial statement',()=>{
 for(let i=0;i<100;i++){
  const s={...F.INIT,salesMode:i%2?'tickets':'sessions',ticketsDay:random()*130,ticketMinutes:2+random()*10,turnaroundMinutes:random()*3,
   operatingHoursDay:6+Math.floor(random()*9),opDays:Math.floor(random()*366),sessionsDay:2+random()*18,ridersPerSession:3+random()*7,
   distributionPct:random()*100,commissionPct:random()*30,equipmentPerVisit:random()*4,energyOtherMonth:random()*3000,
   concessionYears:3+Math.floor(random()*18),loanYears:2+Math.floor(random()*20),loanRate:random()*12,distPct:random()*100,
   taxRate:random()*35,revenueGrowth:random()*10-3,costGrowth:random()*6,depreciationYears:3+Math.floor(random()*17),exitValue:random()*200000-100000};
  const b={...H.BAR_INIT,seats:Math.floor(random()*60),opDays:Math.floor(random()*366),externalDaily:random()*120,initialStock:random()*10000};
  const shared={...H.SHARED_INIT,barSharePct:random()*100,extraMonth:random()*1000};
  const p=H.calculateProject(s,b,shared), c=p.combined;
  near(c.annRev,p.wave.annRev+p.bar.annRev);near(c.ebitda,p.wave.ebitda+p.bar.directEBITDA-shared.extraMonth*12);
  near(c.monthly.reduce((a,m)=>a+m.ebitda,0),c.ebitda);near(p.bar.monthly.reduce((a,m)=>a+m.rev,0),p.bar.annRev);
  near(c.investment,c.eqAmt+c.bankAmt);near(F.npv(c.wacc,c.projectCashflows),c.npvProject);
  let cash=0,earnings=0;
  c.years.forEach(y=>{
   near(y.fcff,y.ebitda-y.tax-y.maintCapex);near(y.fcfe,y.netIncome+y.dep-y.maintCapex-y.principal);
   near(y.cash,cash+y.fcfe-y.divs+y.capitalCall);near(y.retainedEarnings,earnings+y.netIncome-y.divs);
   assert.ok(y.cash>=-1e-6);assert.ok(y.divs<=Math.max(0,earnings+y.netIncome)+1e-6);
   cash=y.cash;earnings=y.retainedEarnings;
  });
  near(c.bankAmt-c.years.reduce((a,y)=>a+y.principal,0),c.last.balance);
  if(Number.isFinite(c.projectIRR))near(F.npv(c.projectIRR,c.projectCashflows),0,.1);
  p.bar.monthly.forEach(m=>assert.ok(m.seatHours<=m.totalSeatHours+1e-6));
 }
});
test('all visitors require a stay that fits within bar opening hours',()=>{
 const p=H.calculateProject(F.INIT,{...H.BAR_INIT,hoursDay:1,surfStay:2,companionStay:2,externalStay:2,workStay:2});
 near(p.bar.annRev,0);
});
test('one private group size drives material and bar visitors',()=>{
 const s={...F.INIT,privatePct:100,privateGroupSize:9,equipmentPerVisit:2};
 const p=H.calculateProject(s,{...H.BAR_INIT,surfConversion:100});
 const privateSessions=p.wave.monthly.reduce((a,m)=>a+m.privateSessions,0);
 near(p.wave.monthly.reduce((a,m)=>a+m.equipment,0),privateSessions*9*2);
 near(p.bar.revenueBreakdown[0].visits,privateSessions*9);
});
test('negative direct ticket margin is disclosed instead of a misleading volume threshold',()=>{
 const r=H.ticketBreakEven({...F.APP_INIT,ticketPrice:1,equipmentPerVisit:5});
 assert.equal(r.valid,false);assert.match(r.reason,/Margem direta/);
});
test('energy comparison uses the edited power and pump count for the selected wave',()=>{
 const c=F.calculate({...F.INIT,kwhMax:510,pumpsCount:13});const row=c.energyComp.find(r=>r.size===F.INIT.waveSize);
 near(row.kwh,510);near(row.pumps,13);near(row.aCost,c.annEnergy);
});
