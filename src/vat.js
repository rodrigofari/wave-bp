/* VAT assumptions and first-year cash bridge. Legal status is an input, not a tax election. */
(function(root){
'use strict';
const F=typeof module!=='undefined'&&module.exports?require('./finance.js'):root.CitywaveFinance;
const H=typeof module!=='undefined'&&module.exports?require('./hospitality.js'):root.CitywaveHospitality;
const clamp=x=>Math.max(0,Math.min(100,Number(x)||0))/100;
const money=x=>Math.round(x*100)/100;
const VAT_INIT={
  profile:'company',waveTaxablePct:100,waveRecoveryPct:100,
  barTaxablePct:100,barRecoveryPct:100,
  waveSalesRate:22,barSalesRate:22,capexVatRate:22,opexVatRate:22,
  machineInvoicePct:0,otherInvoicePct:100,barInvoicePct:100,
  refundLagMonths:3,requestRefund:true,
};
const PROFILES={
  company:{profile:'company',waveTaxablePct:100,waveRecoveryPct:100,barTaxablePct:100,barRecoveryPct:100},
  exempt:{profile:'exempt',waveTaxablePct:0,waveRecoveryPct:0,barTaxablePct:100,barRecoveryPct:100},
  mixed:{profile:'mixed',waveTaxablePct:50,waveRecoveryPct:50,barTaxablePct:100,barRecoveryPct:100},
};
function prepare(waveInput,barInput,sharedInput,vatInput){
  const w={...F.APP_INIT,...waveInput},b={...H.BAR_INIT,...barInput},shared={...H.SHARED_INIT,...sharedInput};
  const v={...VAT_INIT,...vatInput};
  const wr=clamp(v.waveRecoveryPct),br=clamp(v.barRecoveryPct),cr=clamp(v.capexVatRate),or=clamp(v.opexVatRate);
  const machine=w.citywaveCost*(1+w.saltwaterUplift/100);
  const baseWave=F.calculate({...w,vatCapexAdditional:0});
  const otherWave=Math.max(0,baseWave.capex-machine);
  const baseBar=H.calculateProject({...w,vatCapexAdditional:0},{...b,vatCapexAdditional:0},shared).bar;
  const machineVat=machine*cr,otherVat=otherWave*cr,barVat=baseBar.capex*cr;
  // Contingency remains in the investment budget, but no supplier has invoiced it yet.
  const otherBilledVat=Math.max(0,otherWave-baseWave.contAmt)*cr;
  const barBilledVat=baseBar.capex/(1+Math.max(0,b.contingency)/100)*cr;
  const stock=b.operatingMode==='own'?b.initialStock:0,stockVat=stock*cr;
  const waveVat=machineVat+otherVat;
  const sharedRecovery=portion=>wr*(1-portion)+br*portion;
  const shareFor=key=>clamp(shared[key])*clamp(shared.barSharePct);
  const blendedRecovery=sharedRecovery(clamp(shared.barSharePct));
  const effectiveWave={...w,vatSalesRate:v.waveSalesRate,vatTaxableSalesPct:v.waveTaxablePct,
    vatCapexAdditional:waveVat*(1-wr),vatOperatingUpliftPct:v.opexVatRate*(1-wr),
    vatSharedAccountingUpliftPct:v.opexVatRate*(1-sharedRecovery(shareFor('accountingPct'))),
    vatSharedMarketingUpliftPct:v.opexVatRate*(1-sharedRecovery(shareFor('marketingPct'))),
    vatSharedMiscUpliftPct:v.opexVatRate*(1-sharedRecovery(shareFor('miscPct')))};
  const effectiveBar={...b,vatSalesRate:v.barSalesRate,vatTaxableSalesPct:v.barTaxablePct,
    concessionVatRate:v.barSalesRate,concessionTaxablePct:v.barTaxablePct,
    vatCapexAdditional:barVat*(1-br),vatCostUpliftPct:v.opexVatRate*(1-br),
    initialStock:stock+stockVat*(1-br)};
  const effectiveShared={...shared,extraMonth:shared.extraMonth*(1+or*(1-blendedRecovery))};
  return {wave:effectiveWave,bar:effectiveBar,shared:effectiveShared,
    capex:{machine,machineVat,otherWave,otherVat,otherBilledVat,bar:baseBar.capex,barVat,barBilledVat,stock,stockVat,
      waveNonDeductible:waveVat*(1-wr),barNonDeductible:(barVat+stockVat)*(1-br)},vat:v};
}
// VAT output divided by net revenue. For gross-input mixed sales, taxable and
// exempt customers pay the same gross price and have different net receipts.
function outputRatio(rate,taxablePct,grossInput){
  const r=Math.max(0,rate)/100,t=clamp(taxablePct);
  return grossInput?t*r/(1+r-t*r):t*r;
}
function calculate(waveInput,barInput,sharedInput,vatInput){
  const prep=prepare(waveInput,barInput,sharedInput,vatInput),v=prep.vat;
  const baselineProject=H.calculateProject(
    {...waveInput,vatSalesRate:v.waveSalesRate,vatTaxableSalesPct:v.waveTaxablePct},
    {...barInput,vatSalesRate:v.barSalesRate,vatTaxableSalesPct:v.barTaxablePct,
      concessionVatRate:v.barSalesRate,concessionTaxablePct:v.barTaxablePct},sharedInput);
  const project=H.calculateProject(prep.wave,prep.bar,prep.shared);
  const w=prep.wave,b=prep.bar,shared=prep.shared,c=prep.capex;
  const wr=clamp(v.waveRecoveryPct),br=clamp(v.barRecoveryPct),or=clamp(v.opexVatRate);
  const machineInvoice=c.machineVat*clamp(v.machineInvoicePct);
  const otherInvoice=c.otherBilledVat*clamp(v.otherInvoicePct);
  const barInvoice=c.barBilledVat*clamp(v.barInvoicePct)+c.stockVat;
  const invoiceCapex=machineInvoice+otherInvoice+barInvoice;
  const deductibleInvoiceCapex=(machineInvoice+otherInvoice)*wr+barInvoice*br;
  const reverseCharge=(c.machineVat-machineInvoice)+(c.otherBilledVat-otherInvoice)+(c.barBilledVat+c.stockVat-barInvoice);
  const reverseDeductible=(c.machineVat-machineInvoice+c.otherBilledVat-otherInvoice)*wr+(c.barBilledVat+c.stockVat-barInvoice)*br;
  const waveRatio=outputRatio(v.waveSalesRate,v.waveTaxablePct,w.pricesIncludeVat);
  const barRatio=outputRatio(v.barSalesRate,v.barTaxablePct,b.operatingMode==='concession'?b.concessionRentIncludesVat:b.pricesIncludeVat);
  const sharedRecovery=(key)=>wr*(1-clamp(shared[key])*clamp(shared.barSharePct))+br*clamp(shared[key])*clamp(shared.barSharePct);
  let credit=deductibleInvoiceCapex,pending=0,netCash=-invoiceCapex,peakDeficit=Math.max(0,-netCash);
  const refunds=Array(13+Math.max(0,Math.round(v.refundLagMonths))).fill(0);
  const months=project.wave.monthly.map((wm,i)=>{
    const bm=project.bar.monthly[i];
    const output=wm.rev*waveRatio+bm.rev*barRatio;
    const waveDirectBase=wm.energy/(1+w.vatOperatingUpliftPct/100)+w.waterMonth+w.maintMonth+w.energyOtherMonth+wm.equipment/(1+w.vatOperatingUpliftPct/100);
    const waveSharedBase=w.accountingMonth+w.marketingMonth+w.miscMonth;
    const barBase=b.operatingMode==='concession'?b.concessionOwnerCostsMonth:bm.cogs/(1+b.vatCostUpliftPct/100)+b.utilitiesMonth+b.otherMonth;
    const extraBase=(sharedInput||H.SHARED_INIT).extraMonth||0;
    const input=(waveDirectBase+waveSharedBase+barBase+extraBase)*or;
    const deductible=or*(waveDirectBase*wr+w.accountingMonth*sharedRecovery('accountingPct')+
      w.marketingMonth*sharedRecovery('marketingPct')+w.miscMonth*sharedRecovery('miscPct')+
      barBase*br+extraBase*(wr*(1-clamp(shared.barSharePct))+br*clamp(shared.barSharePct)));
    const reverse=i===0?reverseCharge:0,reverseCredit=i===0?reverseDeductible:0;
    const balance=output+reverse-deductible-reverseCredit-credit;
    const paid=Math.max(0,balance);
    credit=Math.max(0,-balance);
    const month=i+1;
    let requested=0;
    if(v.requestRefund&&credit>3000&&pending===0){
      requested=credit;pending=credit;credit=0;
      const receiptMonth=month+Math.max(0,Math.round(v.refundLagMonths));
      if(receiptMonth<refunds.length)refunds[receiptMonth]=requested;
    }
    const received=refunds[month]||0;
    pending-=received;
    const cashMovement=output-input-paid+received;
    netCash+=cashMovement;
    peakDeficit=Math.max(peakDeficit,-netCash);
    return {month,output:money(output),input:money(input),deductible:money(deductible),reverse:money(reverse),paid:money(paid),requested:money(requested),received:money(received),credit:money(credit),pending:money(pending),cashMovement:money(cashMovement),cumulativeCash:money(netCash)};
  });
  const waveBasePrice=waveInput.salesMode==='tickets'?waveInput.ticketPrice:waveInput.beginnerPrice;
  const waveNetPrice=waveBasePrice*(w.pricesIncludeVat?1-clamp(v.waveTaxablePct)+clamp(v.waveTaxablePct)/(1+v.waveSalesRate/100):1);
  const waveGrossPrice=w.pricesIncludeVat?waveBasePrice:waveBasePrice*(1+clamp(v.waveTaxablePct)*v.waveSalesRate/100);
  return {project,baselineProject,inputs:prep,months,initialInvoiceVAT:money(invoiceCapex),initialDeductibleVAT:money(deductibleInvoiceCapex),
    reverseChargeVAT:money(reverseCharge),reverseChargeDeductible:money(reverseDeductible),
    nonDeductibleCapex:money(c.waveNonDeductible+c.barNonDeductible),peakVatCashDeficit:money(peakDeficit),
    closingCredit:money(credit),pendingRefund:money(pending),closingVatCash:money(netCash),
    waveGrossPrice:money(waveGrossPrice),waveNetPrice:money(waveNetPrice)};
}
const api={VAT_INIT,PROFILES,prepare,calculate,outputRatio};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else root.CitywaveVAT=api;
})(typeof globalThis!=='undefined'?globalThis:this);
