// Ticket-volume economics, NOT a validated service-capacity schedule.
// Run: node analysis/ticket-breakeven.cjs
const F=require('../src/finance.js');
const H=require('../src/hospitality.js');
function run(ticketsDay,externalDaily=60,netTicket=41.807){
 const wave={...F.INIT,privatePct:0,clinicPct:0,rentalAdvancedPct:0,eventMonthly:0,communityCards:0,
  beginnerPrice:netTicket,intermediatePrice:netTicket,advancedPrice:netTicket,kidsPrice:netTicket,bonoPct:0};
 // Reuse the engine's monthly seasonality to distribute annual ticket volume.
 // ridersPerSession is an algebraic bridge here, not an operating group size.
 const sessions=F.calculate(wave).monthly.reduce((a,m)=>a+m.publicSessions,0);
 wave.ridersPerSession=ticketsDay*wave.opDays/sessions;
 const p=H.calculateProject(wave,{...H.BAR_INIT,externalDaily,seasonalPct:0});
 const actual=p.wave.monthly.reduce((a,m)=>a+m.people,0);
 if(Math.abs(actual-ticketsDay*340)>1e-6)throw Error('Ticket volume does not reconcile');
 if(Math.abs(p.wave.annRev-actual*netTicket)>1e-6)throw Error('Unexpected ancillary revenue');
 return p;
}
function threshold(fn){let lo=0,hi=300;if(fn(hi)<0)return null;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(fn(mid)>=0)hi=mid;else lo=mid;}return hi;}
const cases=[0,30,60].map(externalDaily=>{
 const p=run(70,externalDaily);
 const tests={operating:t=>run(t,externalDaily).combined.ebitda,cash:t=>run(t,externalDaily).combined.first.fcfe,investment:t=>run(t,externalDaily).combined.npvProject};
 const thresholds=Object.fromEntries(Object.entries(tests).map(([k,fn])=>[k,threshold(fn)]));
 for(const [k,v]of Object.entries(thresholds))if(v!==null&&Math.abs(tests[k](v))>.001)throw Error('Threshold not zero');
 return {externalDaily,thresholds,at70:{waveRevenue:p.wave.annRev,barRevenue:p.bar.annRev,ebitda:p.combined.ebitda,fcfe:p.combined.first.fcfe,npv:p.combined.npvProject,irr:p.combined.projectIRR,energy:p.wave.annEnergy}};
});
const waveOnly={operating:threshold(t=>run(t).wave.ebitda),cash:threshold(t=>run(t).wave.first.fcfe),investment:threshold(t=>run(t).wave.npvProject)};
const netPrices=[35,41.807,49].map(price=>({price,cash:threshold(t=>run(t,60,price).combined.first.fcfe),investment:threshold(t=>run(t,60,price).combined.npvProject)}));
console.log(JSON.stringify({assumptions:{days:340,hours:10,netTicket:41.807,noPrivateClinicsRentalsEventsCards:true,barWorkerDaily:6,externalTicket:10.5,concessionYears:10,wacc:run(70).wave.wacc},cases,waveOnly,netPrices},null,2));
