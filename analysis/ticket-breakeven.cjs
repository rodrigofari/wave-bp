// Same bounded calculation as the interactive ticket controls.
// node analysis/ticket-breakeven.cjs
const F=require('../src/finance');const H=require('../src/hospitality');
const wave={...F.APP_INIT,ticketMinutes:7,turnaroundMinutes:1};
const cases=[0,30,60].map(externalDaily=>{
 const bar={...H.BAR_INIT,externalDaily,seasonalPct:0};const p=H.calculateProject(wave,bar);
 return {externalDaily,thresholds:H.ticketBreakEven(wave,bar),at70:{revenue:p.combined.annRev,ebitda:p.combined.ebitda,fcfe:p.combined.first.fcfe,npv:p.combined.npvProject,irr:p.combined.projectIRR}};
});
console.log(JSON.stringify({wave,cases},null,2));
