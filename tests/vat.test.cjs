const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../src/finance.js');
const H=require('../src/hospitality.js');
const V=require('../src/vat.js');
const close=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);

test('trading company: reverse-charged Citywave VAT does not create a supplier cash advance',()=>{
  const bar=H.APP_BAR_INIT,r=V.calculate(F.APP_INIT,bar,H.SHARED_INIT,V.VAT_INIT);
  const raw=H.calculateProject(F.APP_INIT,bar,H.SHARED_INIT);
  close(r.project.combined.npvProject,raw.combined.npvProject);
  close(r.nonDeductibleCapex,0);
  close(r.reverseChargeVAT,1_750_000*.22);
  close(r.reverseChargeDeductible,r.reverseChargeVAT);
  close(r.initialInvoiceVAT,(raw.wave.capex-1_750_000-raw.wave.contAmt)*.22);
  close(r.months[0].reverse,r.reverseChargeVAT);
});

test('sports exemption sensitivity makes wave VAT a cost without claiming bar rent recovers machine VAT',()=>{
  const v={...V.VAT_INIT,...V.PROFILES.exempt};
  const r=V.calculate(F.APP_INIT,H.APP_BAR_INIT,H.SHARED_INIT,v);
  const machineVat=1_750_000*.22;
  assert.ok(r.nonDeductibleCapex>=machineVat);
  assert.ok(r.project.wave.capex>r.baselineProject.wave.capex);
  assert.ok(r.project.combined.npvProject<r.baselineProject.combined.npvProject);
  close(r.project.bar.capex,r.baselineProject.bar.capex);
  close(r.months[0].reverse,machineVat);
  close(r.months[0].output,r.project.bar.monthly[0].rev*.22);
});

test('gross ticket prices reduce net revenue and leave the concession rent unchanged',()=>{
  const wave={...F.APP_INIT,salesMode:'tickets',pricesIncludeVat:true,ticketsDay:40,opDays:100,ticketPrice:49};
  const r=V.calculate(wave,H.APP_BAR_INIT,H.SHARED_INIT,V.VAT_INIT);
  close(r.project.wave.annRev,40*100*49/1.22);
  close(r.project.bar.annRev,12*H.APP_BAR_INIT.concessionRentMonth);
  close(r.waveNetPrice,Math.round(49/1.22*100)/100,.01);
  close(r.waveGrossPrice,49);
});

test('€49 beginner session can be modelled as a net quote or a final customer price',()=>{
  const net=V.calculate({...F.INIT,salesMode:'sessions',pricesIncludeVat:false},H.APP_BAR_INIT,H.SHARED_INIT,V.VAT_INIT);
  const gross=V.calculate({...F.INIT,salesMode:'sessions',pricesIncludeVat:true},H.APP_BAR_INIT,H.SHARED_INIT,V.VAT_INIT);
  close(net.waveNetPrice,49);
  close(net.waveGrossPrice,59.78);
  close(gross.waveNetPrice,40.16,.01);
  close(gross.waveGrossPrice,49);
  close(gross.project.wave.annRev,net.project.wave.annRev/1.22);
  assert.ok(gross.project.combined.npvProject<net.project.combined.npvProject);
});

test('wages carry no input VAT and invoice credit is neither refunded nor offset twice',()=>{
  const bar=H.APP_BAR_INIT;
  const r1=V.calculate(F.APP_INIT,bar,H.SHARED_INIT,V.VAT_INIT);
  const r2=V.calculate({...F.APP_INIT,staffCount:F.APP_INIT.staffCount+3},bar,H.SHARED_INIT,V.VAT_INIT);
  close(r1.months[0].input,r2.months[0].input);
  const credited=r1.months.reduce((a,m)=>a+m.deductible,0)+r1.initialDeductibleVAT+r1.reverseChargeDeductible;
  const used=r1.months.reduce((a,m)=>a+m.output+m.reverse-m.paid+m.requested,0)+r1.closingCredit;
  close(credited,used,1);
  assert.ok(r1.months.every(m=>m.credit>=0&&m.pending>=0));
});

test('refund timing changes the VAT cash bridge but not project EBITDA or NPV',()=>{
  const fast=V.calculate(F.APP_INIT,H.APP_BAR_INIT,H.SHARED_INIT,{...V.VAT_INIT,refundLagMonths:1});
  const slow=V.calculate(F.APP_INIT,H.APP_BAR_INIT,H.SHARED_INIT,{...V.VAT_INIT,refundLagMonths:6});
  close(fast.project.combined.npvProject,slow.project.combined.npvProject);
  close(fast.project.combined.ebitda,slow.project.combined.ebitda);
  assert.ok(fast.months.some(m=>m.received>0));
  assert.ok(slow.months.some(m=>m.received>0));
  assert.ok(slow.peakVatCashDeficit>=fast.peakVatCashDeficit);
});
