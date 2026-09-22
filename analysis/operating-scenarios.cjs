// Reproduce with: node analysis/operating-scenarios.cjs
// Scenarios, not demand forecasts; original simulator inputs remain unchanged.
const F = require('../src/finance.js');
const H = require('../src/hospitality.js');
const total = xs => xs.reduce((a,b)=>a+b,0);
const barAtCapture = capture => ({...H.BAR_INIT,externalDaily:1100000/365*capture/100,seasonalPct:0});
function run(wave={}, capture=2, bar={}) {
  const s={...F.INIT,...wave};
  const p=H.calculateProject(s,{...barAtCapture(capture),...bar});
  const sessions=total(p.wave.monthly.map(m=>m.sessions));
  const publicVisits=total(p.wave.monthly.map(m=>m.people));
  return {p,metrics:{riders:s.ridersPerSession,peakDemand:s.sessionsDay,hours:s.operatingHoursDay,
    minutes:s.sessionMinutes,gap:s.sessionGapMinutes,slots:p.wave.maxSlotsDay,
    sessionsDay:sessions/s.opDays,publicVisits,publicVisitsDay:publicVisits/s.opDays,
    occupancy:p.wave.avgOccupancy,barExternalDaily:barAtCapture(capture).externalDaily,
    revenue:p.combined.annRev,ebitda:p.combined.ebitda,npv:p.combined.npvProject,
    irr:p.combined.projectIRR,payback:p.combined.payback,
    fcfe:p.combined.first.fcfe,barRevenue:p.bar.annRev,energy:p.wave.annEnergy}};
}
function threshold(riders,capture,targetRate,overrides={}) {
  // Increasing peak demand keeps the existing monthly seasonality and slot cap.
  const wave={...overrides,ridersPerSession:riders};
  const max=run(wave,capture).metrics.slots;
  let lo=0, hi=max/Math.min(...F.SF);
  if(F.npv(targetRate,run({...wave,sessionsDay:hi},capture).p.combined.projectCashflows)<0)return null;
  for(let i=0;i<55;i++){
    const mid=(lo+hi)/2;
    if(F.npv(targetRate,run({...wave,sessionsDay:mid},capture).p.combined.projectCashflows)>=0)hi=mid;else lo=mid;
  }
  return run({...wave,sessionsDay:hi},capture).metrics;
}
const wacc=F.calculate(F.INIT).wacc;
const results={assumptions:{passengers:1100000,barCapturePct:2,barTicket:10.5,wacc,targetReturn:.12,years:10},
  original:H.calculateProject().combined,
  grid:[6,8,10].flatMap(riders=>[8,10,12,14].map(sessionsDay=>run({ridersPerSession:riders,sessionsDay}).metrics)),
  thresholds:[1,2,3].flatMap(capture=>[6,8,10].map(riders=>({capture,riders,wacc:threshold(riders,capture,wacc),target12:threshold(riders,capture,.12)}))),
  schedules:[{operatingHoursDay:8,sessionMinutes:60,sessionGapMinutes:0},{operatingHoursDay:10,sessionMinutes:60,sessionGapMinutes:0},{operatingHoursDay:10,sessionMinutes:60,sessionGapMinutes:10},{operatingHoursDay:10,sessionMinutes:45,sessionGapMinutes:5},{operatingHoursDay:12,sessionMinutes:60,sessionGapMinutes:0}].map(w=>run({...w,ridersPerSession:8,sessionsDay:10}).metrics),
  hoursAtPeak12:[7,8,9,10,11,12].map(operatingHoursDay=>run({operatingHoursDay,ridersPerSession:8,sessionsDay:12}).metrics),
  levers:{base:run({ridersPerSession:8,sessionsDay:10}).metrics,
    demand12:run({ridersPerSession:8,sessionsDay:12}).metrics,
    private400:run({ridersPerSession:8,sessionsDay:10,privatePrice:400}).metrics,
    pump80:run({ridersPerSession:8,sessionsDay:10,avgPumpLoad:80}).metrics,
    extraBarStaff:run({ridersPerSession:8,sessionsDay:10},2,{staffCount:4}).metrics,
    downside:run({ridersPerSession:8,sessionsDay:10,clinicPct:0},1,{staffCount:4}).metrics},
};
// Keep output compact and independently check financial/capacity reconciliation.
delete results.original.years;delete results.original.monthly;
for(const m of results.grid){if(m.sessionsDay>m.slots+1e-8)throw Error('Capacity exceeded');}
for(const t of results.thresholds){for(const [key,rate] of [['wacc',wacc],['target12',.12]]){
 if(t[key]&&Math.abs(t[key].irr-rate)>1e-6)throw Error('Return threshold failed');
}}
console.log(JSON.stringify(results,null,2));
