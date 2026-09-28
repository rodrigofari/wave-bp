const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../src/finance.js');
const H=require('../src/hospitality.js');
const S=require('../src/scenarios.js');

test('investor scenarios are distinct, capacity-feasible and run through the common model',()=>{
  const scenarios=S.all();
  assert.deepEqual(scenarios.map(x=>x.id),['pessimistic','realistic','optimistic']);
  const outputs=scenarios.map(({inputs})=>{
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
    assert.equal(bar.staffCount,H.BAR_INIT.staffCount);
    assert.equal(wave.staffCount,F.APP_INIT.staffCount);
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
    assert.equal(scenario.assumptions.length,4);
    assert.ok(scenario.assumptions.every(row=>row.pt&&row.en&&row.ptValue&&row.enValue));
    assert.ok(scenario.explanation.pt&&scenario.explanation.en&&scenario.caution.pt&&scenario.caution.en);
  }
});

test('applying an investor scenario gives fresh independent editable inputs',()=>{
  const first=S.build('realistic');
  first.wave.sessionsDay=99;first.bar.externalDaily=999;
  const second=S.build('realistic');
  assert.equal(second.wave.sessionsDay,7);
  assert.equal(second.bar.externalDaily,45);
  assert.throws(()=>S.build('unknown'),/Unknown scenario/);
});
