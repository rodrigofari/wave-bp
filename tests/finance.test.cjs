const test = require('node:test');
const assert = require('node:assert/strict');
const {INIT,calculate,irr,npv,debtSchedule,allocateDays,paybackOf} = require('../src/finance.js');
const sum = a => a.reduce((x,y)=>x+y,0);
const near = (actual,expected,tolerance=1e-6) => assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
const run = changes => calculate({...INIT,...changes});

test('CAPEX, salaries and annuity match independent arithmetic',()=>{
 const c=run({}); near(c.capex,2292400);near(c.annStaff,249480);near(c.mp,8707.49738588114);
 const zero=debtSchedule(1200,0,2,3);near(zero.payment,50);near(zero.annual[0].principal,600);near(zero.annual[2].debt,0);
});
test('whole operating days reconcile for every allowed annual count',()=>{
 const calendar=[31,28,31,30,31,30,31,31,30,31,30,31];
 for(let n=0;n<=365;n++){const days=allocateDays(n);assert.equal(sum(days),n);days.forEach((d,i)=>assert.ok(Number.isInteger(d)&&d>=0&&d<=calendar[i]));}
});
test('monthly revenue, categories, costs and EBITDA reconcile to annuals',()=>{
 for(const changes of [{},{mgmtPct:5},{opDays:365},{opDays:205,avgPumpLoad:55,privatePct:30}]){
 const c=run(changes);near(sum(c.mRev),c.annRev);near(sum(c.mCost),c.opex);near(sum(c.mProfit),c.ebitda);
 near(sum(c.revBk.map(x=>x.v)),c.annRev);near(sum(c.costBk.map(x=>x.v)),c.opex);near(sum(c.monthly.map(x=>x.energy)),c.annEnergy);
 }
});
test('bookings never exceed capacity and private sessions replace public sessions',()=>{
 const c=run({sessionsDay:50,privatePct:25});
 c.monthly.forEach(m=>{near(m.sessions,m.days*10);near(m.privateSessions+m.publicSessions,m.sessions);near(m.people,m.publicSessions*6);});
 const noPrivate=run({sessionsDay:10,privatePct:0}), privateOnly=run({sessionsDay:10,privatePct:100});
 near(privateOnly.revBk[0].v,0);near(privateOnly.revBk[1].v,0);near(privateOnly.revBk[3].v,0);
 near(sum(noPrivate.monthly.map(m=>m.sessions)),sum(privateOnly.monthly.map(m=>m.sessions)));
});
test('session duration and turnaround determine daily capacity',()=>{
 assert.equal(run({sessionMinutes:30}).maxSlotsDay,20);
 assert.equal(run({sessionMinutes:45,sessionGapMinutes:15}).maxSlotsDay,10);
 assert.equal(run({sessionMinutes:90}).maxSlotsDay,6);
 const fortyFive=run({sessionMinutes:45,sessionGapMinutes:0,ridersPerSession:14,sessionsDay:14});
 const sixty=run({sessionMinutes:60,sessionGapMinutes:0,ridersPerSession:14,sessionsDay:14});
 assert.equal(fortyFive.maxSlotsDay,13);assert.equal(fortyFive.maxRidersDay,182);
 assert.equal(sixty.maxSlotsDay,10);assert.equal(sixty.maxRidersDay,140);
 fortyFive.monthly.forEach(m=>assert.ok(m.people<=m.sessions*14+1e-8));
 sixty.monthly.forEach(m=>assert.ok(m.people<=m.sessions*14+1e-8));
 assert.ok(run({sessionMinutes:30}).annRev>run({}).annRev);
});
test('mix is normalized and zero mix disables return indicators',()=>{
 const c=run({beginnerPct:90,intermediatePct:60,advancedPct:30,kidsPct:20});near(c.annRev,run({}).annRev);
 const z=run({beginnerPct:0,intermediatePct:0,advancedPct:0,kidsPct:0});assert.equal(z.valid,false);assert.ok(Number.isNaN(z.projectIRR));
});
test('debt amortization stops and residual balances are correct',()=>{
 const c=run({loanYears:5});near(sum(c.proj.map(y=>y.principal)),c.bankAmt);
 c.proj.slice(5).forEach(y=>{near(y.debt,0);near(y.balance,0);});
 near(run({loanYears:15}).last.balance,343214.058435258);
 near(run({concessionYears:5}).last.balance,455862.177786476);
});
test('FCFF and FCFE reconcile including the actual tax shield',()=>{
 for(const changes of [{},{beginnerPrice:90,mgmtPct:5},{sessionsDay:1},{taxRate:0}]){
 const c=run(changes);
 c.proj.forEach(y=>{
 near(y.fcff,y.ebitda-y.tax-y.maintCapex);
 near(y.fcfe,y.netIncome+y.dep-y.maintCapex-y.principal);
 near(y.fcfe,y.fcff-y.debt+y.tax-y.equityTax);
 });}
});
test('management cost changes EBITDA, taxable results and project value',()=>{
 const a=run({}),b=run({mgmtPct:5});near(a.ebitda-b.ebitda,a.annRev*.05);assert.ok(b.npvProject<a.npvProject);
 b.proj.forEach(y=>near(y.mgmt,y.rev*.05));
});
test('one compounded projection feeds P&L and percentage revenue costs',()=>{
 const c=run({mgmtPct:5});assert.strictEqual(c.proj,c.fcfYears);
 c.proj.forEach((y,i)=>{near(y.rev,c.annRev*1.03**i);near(y.concession,y.rev*.05);near(y.mgmt,y.rev*.05);});
});
test('maintenance starts in year one; its depreciation begins next year',()=>{
 const c=run({depreciationYears:5,concessionYears:10});
 near(c.first.maintCapex,c.capex*.02);near(c.first.dep,c.capex/5);
 near(c.proj[1].dep,c.capex/5+c.maintCapex/5);near(c.proj[5].dep,c.maintCapex);
});
test('cash and retained earnings roll forward; dividends cannot consume missing cash or profits',()=>{
 for(const changes of [{},{sessionsDay:1},{distPct:100,beginnerPrice:90},{loanYears:5}]){
 const c=run(changes);let cash=0,earnings=0;
 c.proj.forEach(y=>{near(y.cash,cash+y.fcfe-y.divs+y.capitalCall);near(y.retainedEarnings,earnings+y.netIncome-y.divs);
 assert.ok(y.divs<=Math.max(0,y.fcfe)*({...INIT,...changes}.distPct)/100+1e-6);assert.ok(y.divs<=Math.max(0,earnings+y.netIncome)+1e-6);
 assert.ok(y.cash>=-1e-6);cash=y.cash;earnings=y.retainedEarnings;
 });}
});
test('equity exit releases retained cash, settles debt and includes capital calls',()=>{
 const c=run({distPct:0,loanYears:15,exitValue:500000});
 c.proj.forEach(y=>near(y.divs,0));near(c.equityExit,500000+c.last.cash-c.last.balance);
 near(c.equityCashflows.at(-1),c.last.divs-c.last.capitalCall+c.equityExit);
 const low=run({sessionsDay:1});assert.ok(low.proj.some(y=>y.capitalCall>0));assert.ok(low.equityCashflows.slice(1).some(x=>x<0));
 near(c.equityMultiple,sum(c.equityCashflows.filter(x=>x>0))/-sum(c.equityCashflows.filter(x=>x<0)));
});
test('all sensitivity base cases match the same first operating year',()=>{
 const c=run({mgmtPct:5});const base=c.revScenarios.find(x=>x.p===1);
 near(base.rev,c.first.rev);near(base.ebitda,c.first.ebitda);near(base.fcf,c.first.fcff);near(base.net,c.first.fcfe);
 near(c.sensMatrix[c.sensElec.indexOf(INIT.electricityRate)][c.sensRevPcts.indexOf(1)],c.ebitda);
 // A price change cannot silently save electricity or marketing costs.
 const half=c.revScenarios.find(x=>x.p===.5);near(c.opex-half.opx,(c.annRev-half.rev)*.10);
});
test('concession determines every horizon; no automatic perpetuity',()=>{
 const c=run({concessionYears:5});assert.equal(c.proj.length,5);assert.equal(c.projectCashflows.length,6);near(c.terminalValue,0);
 assert.notEqual(c.npvProject,run({}).npvProject);near(npv(c.wacc,c.projectCashflows),c.npvProject);
 const exit=run({concessionYears:5,exitValue:100000});near(exit.npvProject-c.npvProject,100000/(1+c.wacc)**5);
});
test('IRR validates roots and does not invent returns',()=>{
 near(irr([-100,110]),.1);near(irr([-100,50]),-.5);
 assert.ok(Number.isNaN(irr([-100,-20,-10])));assert.ok(Number.isNaN(irr([-100,0,0])));
 assert.ok(Number.isNaN(irr([-100,230,-132])));assert.ok(Number.isNaN(irr([0,100])));
 const c=run({sessionsDay:1});assert.ok(Number.isNaN(c.projectIRR));assert.ok(Number.isNaN(c.equityIRR));
 for(const changes of [{},{ridersPerSession:10},{concessionYears:25,loanYears:5}]){const c=run(changes);if(Number.isFinite(c.projectIRR))near(npv(c.projectIRR,c.projectCashflows),0,.01);}
});
test('payback uses accumulated cash; invalid funding disables investment returns',()=>{
 near(paybackOf(100,[30,40,60]),2.5);assert.equal(paybackOf(100,[20,30]),Infinity);
 const c=run({bankPct:0});assert.equal(c.valid,false);assert.ok(Number.isNaN(c.equityIRR));assert.ok(Number.isNaN(c.npvProject));assert.ok(Number.isNaN(c.invRet[0].roi));
});

test('negative disposal proceeds are a cash outflow, not an impossible perpetuity',()=>{
 const a=run({exitValue:0}),b=run({exitValue:-100000});
 near(b.npvProject-a.npvProject,-100000/(1+a.wacc)**a.N);
 near(b.equityExit-a.equityExit,-100000);
});
test('the sum of individual equity flows reconciles to company equity flows',()=>{
 const c=run({sessionsDay:1,exitValue:100000,loanYears:15});
 const owners=c.capTableData;
 c.equityCashflows.forEach((flow,t)=>{
   const individual=sum(owners.map(o=>t===0 ? -o.cash : flow*o.ownership/100));
   near(individual,flow);
 });
 const profitable=run({ridersPerSession:10,distPct:100});
 const retained=run({ridersPerSession:10,distPct:0});
 assert.ok(profitable.proj.some(y=>y.divs>0));
 assert.ok(retained.last.cash>profitable.last.cash);
 assert.notEqual(profitable.equityIRR,retained.equityIRR);
});

test('base experience has no clinic surcharge and equipment rental applies only to advanced riders',()=>{
 const c=run({});
 near(c.revBk[1].v,0);
 const publicPeople=c.monthly.reduce((a,m)=>a+m.people,0);
 near(c.revBk[3].v,publicPeople*.15*.30*10);
 const intermediate=run({beginnerPct:0,intermediatePct:100,advancedPct:0,kidsPct:0});
 near(intermediate.revBk[3].v,0);
 const advanced=run({beginnerPct:0,intermediatePct:0,advancedPct:100,kidsPct:0});
 near(advanced.revBk[3].v,advanced.monthly.reduce((a,m)=>a+m.people,0)*.30*10);
});
