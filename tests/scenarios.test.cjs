const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../src/finance.js');
const H=require('../src/hospitality.js');
const S=require('../src/scenarios.js');

test('investor scenarios are distinct, capacity-feasible and run through the common model',()=>{
  const scenarios=S.all();
  assert.deepEqual(scenarios.map(x=>x.id),['pessimistic','realistic','optimistic']);
  const outputs=scenarios.map(({inputs},index)=>{
    const {wave,bar,shared}=inputs;
    assert.equal(wave.salesMode,'sessions');
    const capacity=F.calculate(wave).maxSlotsDay;
    assert.ok(wave.sessionsDay<=capacity,`${wave.sessionsDay} daily sessions exceed ${capacity} slots`);
    assert.ok(wave.ridersPerSession<=14);
    assert.ok(wave.opDays>=0&&wave.opDays<=365);
    const project=H.calculateProject(wave,bar,shared);
    assert.equal(project.combined.annRev,project.wave.annRev+project.bar.annRev);
    assert.ok(Math.abs(project.combined.ebitda-(project.wave.ebitda+project.bar.directEBITDA-project.extraSharedAnnual))<1e-6);
    assert.ok(Number.isFinite(project.combined.ebitda));
    assert.equal(bar.operatingMode,'concession');
    assert.equal(wave.staffCount,[6,7,9][index]);
    return project;
  });
  assert.ok(outputs[0].combined.annRev<outputs[1].combined.annRev);
  assert.ok(outputs[1].combined.annRev<outputs[2].combined.annRev);
  assert.equal(scenarios[0].inputs.wave.electricityRate,.20);
  assert.equal(scenarios[1].inputs.wave.electricityRate,F.INIT.electricityRate);
  assert.equal(scenarios[2].inputs.wave.electricityRate,F.INIT.electricityRate);
});

test('scenario assumptions name all wave and bar drivers shown to investors',()=>{
  for(const scenario of S.definitions){
    assert.equal(scenario.assumptions.length,5);
    assert.ok(scenario.assumptions.every(row=>row.pt&&row.en&&row.ptValue&&row.enValue));
    assert.ok(scenario.explanation.pt&&scenario.explanation.en&&scenario.caution.pt&&scenario.caution.en);
  }
});

test('applying an investor scenario gives fresh independent editable inputs',()=>{
  const first=S.build('realistic');
  first.wave.sessionsDay=99;first.bar.externalDaily=999;
  const second=S.build('realistic');
  assert.equal(second.wave.sessionsDay,9);
  assert.equal(second.bar.externalDaily,45);
  assert.throws(()=>S.build('unknown'),/Unknown scenario/);
});

test('concession rent enters project revenue while operator payroll and running costs stay outside',()=>{
  const {wave,bar,shared}=S.build('realistic');
  const rent=H.calculateProject(wave,bar,shared);
  assert.equal(rent.bar.annRev,bar.concessionRentMonth*12);
  assert.equal(rent.bar.annStaff,0);
  assert.equal(rent.bar.workingCapital,0);
  assert.equal(rent.bar.capex,0);
  assert.equal(rent.bar.visits,0);
  assert.equal(rent.bar.revenueBreakdown.length,1);
  assert.equal(rent.bar.revenueBreakdown[0].label,'Renda da concessão');
  assert.equal(rent.bar.fixedDirect,bar.concessionOwnerCostsMonth*12);
  assert.ok(Math.abs(rent.combined.investment-rent.wave.capex)<1e-6);

  const operatorCostsIgnored=H.calculateProject(wave,{...bar,staffCount:40,salary:9000,cogsPct:90,
    utilitiesMonth:10000,rentMonth:20000,initialStock:500000,works:700000,exitValue:500000},shared);
  assert.equal(operatorCostsIgnored.combined.ebitda,rent.combined.ebitda);
  assert.equal(operatorCostsIgnored.combined.investment,rent.combined.investment);

  const higherRent=H.calculateProject(wave,{...bar,concessionRentMonth:bar.concessionRentMonth+1000},shared);
  assert.equal(higherRent.bar.annRev-rent.bar.annRev,12000);
  assert.equal(higherRent.combined.ebitda-rent.combined.ebitda,12000);

  const landlordFitout=H.calculateProject(wave,{...bar,concessionFitoutCapex:10000,concessionExitValue:4000},shared);
  assert.equal(landlordFitout.bar.capex,11000);
  assert.equal(landlordFitout.combined.investment-rent.combined.investment,11000);
  assert.equal(landlordFitout.bar.terminalValue,4000);
});

test('concession rent enters project revenue while concessionaire payroll and operating costs stay outside',()=>{
  const {wave,bar,shared}=S.build('realistic');
  const rent=H.calculateProject(wave,bar,shared);
  assert.equal(rent.bar.annRev,bar.concessionRentMonth*12);
  assert.equal(rent.bar.annStaff,0);
  assert.equal(rent.bar.workingCapital,0);
  assert.equal(rent.bar.capex,0);
  assert.equal(rent.bar.visits,0);
  assert.equal(rent.bar.revenueBreakdown.length,1);
  assert.equal(rent.bar.revenueBreakdown[0].label,'Renda da concessão');
  assert.equal(rent.bar.fixedDirect,bar.concessionOwnerCostsMonth*12);
  assert.ok(Math.abs(rent.combined.investment-rent.wave.capex)<1e-6);

  const operatorCostsIgnored=H.calculateProject(wave,{...bar,staffCount:40,salary:9000,cogsPct:90,
    utilitiesMonth:10000,rentMonth:20000,initialStock:500000,works:700000},shared);
  assert.equal(operatorCostsIgnored.combined.ebitda,rent.combined.ebitda);
  assert.equal(operatorCostsIgnored.combined.investment,rent.combined.investment);

  const higherRent=H.calculateProject(wave,{...bar,concessionRentMonth:bar.concessionRentMonth+1000},shared);
  assert.equal(higherRent.bar.annRev-rent.bar.annRev,12000);
  assert.equal(higherRent.combined.ebitda-rent.combined.ebitda,12000);
});
