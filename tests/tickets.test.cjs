const test=require('node:test');const assert=require('node:assert/strict');
const F=require('../src/finance');const H=require('../src/hospitality');
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const wave={...F.INIT,salesMode:'tickets',ticketsDay:70,ticketMinutes:7,turnaroundMinutes:1};
const bar={...H.BAR_INIT,externalDaily:60,seasonalPct:0};
test('tickets enforce service capacity and ignore session ancillary sales',()=>{
 const c=F.calculate({...wave,ticketsDay:100,privatePct:50,clinicPct:90,eventMonthly:9000});
 assert.equal(c.ticketCapacity,75);near(c.avgPeopleDay,75);
 near(c.annRev,75*340*41.807);c.revBk.slice(1).forEach(x=>near(x.v,0));
 c.monthly.forEach(m=>{near(m.people,m.days*75);near(m.sessions,0);near(m.privateSessions,0);});
 near(F.calculate({...wave,ticketMinutes:8,turnaroundMinutes:1}).avgPeopleDay,66);
});
test('commission, material and auxiliary electricity reconcile independently',()=>{
 const base=F.calculate(wave);
 const c=F.calculate({...wave,distributionPct:50,commissionPct:20,equipmentPerVisit:2,energyOtherMonth:1000});
 const commission=70*340*41.807*.5*.2,material=70*340*2;
 near(c.ebitda,base.ebitda-commission-material-12000);
 near(c.costBk.reduce((a,x)=>a+x.v,0),c.opex);
 near(c.monthly.reduce((a,x)=>a+x.cost,0),c.opex);
 near(c.proj[1].commission,commission*1.03);near(c.proj[1].equipment,material*1.02);
 near(c.annEnergy,600*10*340*.16);
 near(c.sensMatrix[c.sensElec.indexOf(wave.electricityRate)][c.sensRevPcts.indexOf(1)],c.ebitda);
});
test('ticket break-even reproduces independently computed operating threshold',()=>{
 const result=H.ticketBreakEven(wave,bar,H.SHARED_INIT);
 // Wave fixed: 249480 staff + 326400 energy + 30000 water + 27000 maintenance
 // + 35000 insurance + 30000 marketing + 9600 accounting + 18000 misc.
 // Bar fixed 99768.75; fixed bar sales 60*340*10.5 + 6*340*12.
 // Surf-driven bar sales per ticket .45*8 + .5*.6*8 = 6.
 const fixed=249480+326400+30000+27000+35000+30000+9600+18000+99768.75;
 const independent=(fixed-(60*340*10.5+6*340*12)*.615)/(340*(41.807*.95+6*.615));
 near(result.operating,independent);
 for(const [key,metric]of [['operating',p=>p.combined.ebitda],['cash',p=>p.combined.first.fcfe],['investment',p=>p.combined.npvProject]]){
  const p=H.calculateProject({...wave,ticketsDay:result[key]},bar,H.SHARED_INIT);near(metric(p),0,.001);
 }
 const p=H.calculateProject(wave,bar,H.SHARED_INIT);
 near(p.combined.ebitda,354617.72);near(p.combined.first.fcfe,160720.2467197626);
});
test('break-even flags impossible capacity, invalid funding and zero operating days',()=>{
 const capped=H.ticketBreakEven({...wave,ticketMinutes:8,turnaroundMinutes:1},bar,H.SHARED_INIT);
 assert.equal(capped.capacity,66);assert.equal(capped.investment,null);
 const zero=H.ticketBreakEven({...wave,opDays:0},bar,H.SHARED_INIT);assert.equal(zero.investment,null);
 assert.equal(H.ticketBreakEven({...wave,bankPct:0},bar,H.SHARED_INIT).valid,false);
});
test('higher selling costs cannot improve ticket break-even or returns',()=>{
 const a=H.ticketBreakEven(wave,bar,H.SHARED_INIT);
 const b=H.ticketBreakEven({...wave,distributionPct:60,commissionPct:25,equipmentPerVisit:3},bar,H.SHARED_INIT);
 assert.ok(b.operating>a.operating);assert.ok(b.cash>a.cash||b.cash===null);assert.equal(b.investment,null);
});
