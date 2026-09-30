function VatPanel({vat,onVat,onPreset,s,b,onWave,onBar,result,language='pt'}) {
  const en=language==='en',f=CitywaveFinance;
  const eur=n=>`${f.fmt(Math.round(n))} €`;
  const priceEur=n=>new Intl.NumberFormat(en?'en-GB':'pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const p=result.project.combined,base=result.baselineProject.combined;
  const profiles=[
    ['company',en?'Trading company — taxable':'Sociedade comercial — tributada'],
    ['exempt',en?'Sports exemption — sensitivity':'Isenção desportiva — sensibilidade'],
    ['mixed',en?'Mixed activities — sensitivity':'Atividades mistas — sensibilidade'],
  ];
  const field=(key,label,suffix='%',max=100,step=1,info)=>
    <Row key={key} label={label} value={vat[key]} onChange={x=>onVat(key,x)} suffix={suffix} min={0} max={max} step={step} info={info}/>;
  const openingQuote=s.beginnerPrice;
  const priceLabel=en?'Beginner session':'Sessão principiante';
  const chart=result.months,lowest=Math.min(0,...chart.map(m=>m.cumulativeCash)),highest=Math.max(0,...chart.map(m=>m.cumulativeCash));
  const span=Math.max(1,highest-lowest);
  return <section className="vat-panel" aria-label={en?'VAT and cash flow':'IVA e tesouraria'}>
    <h2 style={{fontSize:24,margin:'8px 0'}}>IVA e tesouraria / VAT & cash</h2>
    <p style={{fontSize:12,lineHeight:1.6,color:'#596474'}}>{en
      ?'The legal structure determines the tax treatment. The trading-company case matches the proposed Lda.; the other cases test risks and are not elective tax regimes. Amounts are planning assumptions until contracts and invoices are reviewed.'
      :'O enquadramento depende da estrutura jurídica. A sociedade comercial corresponde à Lda. indicada pelos promotores; os outros casos são testes de risco, não regimes fiscais que se possam escolher livremente. Os valores são hipóteses até à revisão dos contratos e faturas.'}</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0 20px'}}>{profiles.map(([id,label])=><button key={id} onClick={()=>onPreset(id)} aria-pressed={vat.profile===id} style={{padding:'9px 12px',border:'1px solid #c7ced8',background:vat.profile===id?'#17202b':'#fff',color:vat.profile===id?'#fff':'#17202b',fontWeight:700,cursor:'pointer'}}>{label}</button>)}</div>
    {vat.profile==='custom'&&<p style={{fontSize:11,color:'#9a5514'}}>{en?'Custom tax assumptions — obtain a written assessment before presenting them as the base case.':'Pressupostos fiscais personalizados — peça um enquadramento escrito antes de os apresentar como caso-base.'}</p>}
    <div className="twocol-charts" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
      <div>
        <Section title={en?'Customer prices and VAT':'Preços ao cliente e IVA'} open={true}>
          <label style={{fontSize:12,fontWeight:700}}>{en?'Wave price entered as':'Preço introduzido da onda'}
            <select value={s.pricesIncludeVat?'gross':'net'} onChange={e=>onWave('pricesIncludeVat',e.target.value==='gross')} style={{display:'block',padding:8,marginTop:5}}>
              <option value="net">{en?'Before VAT':'Antes de IVA'}</option><option value="gross">{en?'Final price including VAT':'Preço final com IVA'}</option>
            </select>
          </label>
          <p style={{fontSize:12,lineHeight:1.6}}>{priceLabel}: <strong>{priceEur(openingQuote)}</strong> {en?'entered →':'introduzidos →'} <strong>{priceEur(result.waveNetPrice)}</strong> {en?'net revenue,':'receita líquida,'} <strong>{priceEur(result.waveGrossPrice)}</strong> {en?'final customer price.':'preço final ao cliente.'}</p>
          {b.operatingMode==='concession'?<label style={{fontSize:12,fontWeight:700}}>{en?'Concession rent entered as':'Renda da concessão introduzida como'}
            <select value={b.concessionRentIncludesVat?'gross':'net'} onChange={e=>onBar('concessionRentIncludesVat',e.target.value==='gross')} style={{display:'block',padding:8,marginTop:5}}>
              <option value="net">{en?'Before VAT':'Antes de IVA'}</option><option value="gross">{en?'Final amount including VAT':'Valor final com IVA'}</option>
            </select>
          </label>:<label style={{fontSize:12,fontWeight:700}}>{en?'Bar spending entered as':'Consumo do bar introduzido como'}
            <select value={b.pricesIncludeVat?'gross':'net'} onChange={e=>onBar('pricesIncludeVat',e.target.value==='gross')} style={{display:'block',padding:8,marginTop:5}}>
              <option value="net">{en?'Before VAT':'Antes de IVA'}</option><option value="gross">{en?'Final customer price including VAT':'Preço final ao cliente com IVA'}</option>
            </select>
          </label>}
          <p style={{fontSize:11,color:'#596474'}}>{en?'Changing the price basis recalculates revenue and every return chart. Session prices currently have no confirmed gross/net commercial policy.':'Mudar a base do preço recalcula a receita e todos os indicadores de retorno. Ainda não está definido se os preços comerciais das sessões são finais ou antes de IVA.'}</p>
        </Section>
        <Section title={en?'Tax treatment and recovery':'Tratamento fiscal e dedução'} open={true}>
          {field('waveTaxablePct',en?'Taxable wave sales':'Vendas da onda tributadas')}
          {field('waveRecoveryPct',en?'Recoverable wave input VAT':'IVA dedutível da onda')}
          {field('barTaxablePct',en?'Taxable bar/rent sales':'Vendas/renda do bar tributadas')}
          {field('barRecoveryPct',en?'Recoverable bar input VAT':'IVA dedutível do bar')}
          <p style={{fontSize:10,color:'#657184',lineHeight:1.5}}>{en?'VAT on the wave machine follows its actual use. Taxable bar rent does not make VAT on an exempt wave machine deductible.':'O IVA da máquina segue a utilização efetiva da piscina. Uma renda tributada do bar não torna dedutível o IVA de uma piscina isenta.'}</p>
        </Section>
      </div>
      <div>
        <Section title={en?'VAT rates and Citywave invoice':'Taxas e faturação Citywave'} open={true}>
          {field('waveSalesRate',en?'Wave output VAT rate':'Taxa IVA vendas da onda')}
          {field('barSalesRate',en?'Bar/rent effective output rate':'Taxa efetiva bar/renda')}
          {field('capexVatRate',en?'Effective input VAT on investment':'Taxa efetiva IVA do investimento')}
          {field('opexVatRate',en?'Effective input VAT on eligible running costs':'Taxa efetiva IVA dos custos correntes elegíveis')}
          {field('machineInvoicePct',en?'Citywave VAT paid on supplier invoice':'IVA Citywave pago ao fornecedor','%',100,5,en?'0% models reverse-charge; verify purchase/installation contract.':'0% simula autoliquidação; confirme contrato de compra/instalação.')}
          {field('otherInvoicePct',en?'Other investment VAT paid on invoices':'IVA restante investimento pago em faturas','%',100,5)}
          {field('barInvoicePct',en?'Bar investment VAT paid on invoices':'IVA investimento do bar pago em faturas','%',100,5)}
          <p style={{fontSize:10,color:'#657184',lineHeight:1.5}}>{en?'The Citywave invoice treatment is unconfirmed. Reverse-charge VAT is assessed in the tax return; the deductible share cancels in that return. Contingency is a forecast, not a current invoice.':'O tratamento da fatura Citywave não está confirmado. O IVA autoliquidado entra na declaração; a parte dedutível compensa-se nessa declaração. A contingência é uma previsão, não uma fatura atual.'}</p>
        </Section>
        <Section title={en?'Refund timing':'Prazo do reembolso'} open={false}>
          <label style={{fontSize:12}}><input type="checkbox" checked={vat.requestRefund} onChange={e=>onVat('requestRefund',e.target.checked)}/> {en?'Request refund when credit exceeds €3,000':'Pedir reembolso se o crédito exceder 3.000 €'}</label>
          {field('refundLagMonths',en?'Months from request to cash receipt':'Meses entre pedido e recebimento',' meses',12,1)}
          <p style={{fontSize:10,color:'#657184'}}>{en?'The model settles VAT in the same month as sales and assumes the request is accepted; real filing dates, inspections and guarantees can change cash timing.':'O modelo liquida IVA no mesmo mês das vendas e assume aceitação do pedido; datas reais de declaração, inspeções e garantias podem mudar a tesouraria.'}</p>
        </Section>
      </div>
    </div>
    <h3>{en?'Effect on the combined project':'Efeito no projeto conjunto'}</h3>
    <ComponentTable headings={en?['Measure','Without unrecoverable input VAT','Current VAT assumptions']:['Indicador','Sem IVA não dedutível','Pressupostos de IVA atuais']} rows={[
      [en?'Initial investment':'Investimento inicial',eur(base.investment),eur(p.investment)],
      [en?'Year 1 EBITDA':'EBITDA ano 1',eur(base.ebitda),eur(p.ebitda)],
      [en?'Project NPV':'VAL do projeto',eur(base.npvProject),eur(p.npvProject)],
      [en?'Project IRR':'TIR do projeto',f.pct(base.projectIRR),f.pct(p.projectIRR)],
      [en?'Payback':'Payback',Number.isFinite(base.payback)?`${f.fd(base.payback,2)} ${en?'years':'anos'}`:'—',Number.isFinite(p.payback)?`${f.fd(p.payback,2)} ${en?'years':'anos'}`:'—'],
    ]}/>
    <div className="twocol-charts" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#d8dee7',margin:'16px 0'}}>
      {[[en?'Input VAT paid on initial invoices':'IVA inicial pago em faturas',result.initialInvoiceVAT],
        [en?'Input VAT not deductible':'IVA não dedutível no investimento',result.nonDeductibleCapex],
        [en?'VAT reverse charged':'IVA autoliquidado',result.reverseChargeVAT],
        [en?'Peak VAT cash outflow, year 1':'Pico de saída de caixa do IVA, ano 1',result.peakVatCashDeficit]
      ].map(([label,value])=><div key={label} style={{background:'#fff',padding:14}}><div style={{fontSize:10,color:'#596474'}}>{label}</div><strong style={{fontSize:17}}>{eur(value)}</strong></div>)}
    </div>
    <p style={{fontSize:11,color:'#596474',lineHeight:1.6}}>{en?'The VAT cash figure includes recoverable cash tied up and any permanently unrecoverable VAT. Do not add unrecoverable VAT to investment again: it is already included there. Refund financing costs are not included in NPV or IRR. The chart excludes payroll, debt, construction payment dates and other working capital.':'A saída de caixa de IVA inclui valores temporariamente recuperáveis e qualquer IVA definitivamente não dedutível. Não some o IVA não dedutível novamente ao investimento: já está incluído. O custo de financiar a espera pelo reembolso não entra no VAL nem na TIR. O gráfico exclui salários, dívida, datas das prestações da obra e outro fundo de maneio.'}</p>
    <h3>{en?'Monthly VAT cash balance — first operating year':'Saldo mensal de caixa do IVA — primeiro ano de operação'}</h3>
    <div style={{display:'flex',alignItems:'flex-end',gap:6,height:145,borderBottom:'1px solid #aab2bd',marginBottom:12}}>{chart.map(m=>{
      const h=Math.max(2,Math.abs(m.cumulativeCash)/span*120);
      return <div key={m.month} style={{flex:1,textAlign:'center',minWidth:0}} title={`${f.MONTHS[m.month-1]}: ${eur(m.cumulativeCash)}`}>
        <div style={{fontSize:9,whiteSpace:'nowrap'}}>{f.fmt(m.cumulativeCash)}</div>
        <div style={{height:h,background:m.cumulativeCash<0?'#b86842':'#2b7981',margin:'3px auto',width:'68%'}}/>
        <div style={{fontSize:10}}>{f.MONTHS[m.month-1]}</div>
      </div>;
    })}</div>
    <ComponentTable headings={en?['Month','VAT collected','VAT paid on costs','Tax paid','Refund received','VAT cash balance']:['Mês','IVA cobrado','IVA pago nos custos','IVA entregue','Reembolso recebido','Saldo de caixa IVA']} rows={chart.map(m=>[f.MONTHS[m.month-1],eur(m.output),eur(m.input),eur(m.paid),eur(m.received),eur(m.cumulativeCash)])}/>
    <p style={{fontSize:11,color:'#596474'}}>{en?'Year-end credit not yet refunded':'Crédito por recuperar no fim do ano'}: <strong>{eur(result.closingCredit+result.pendingRefund)}</strong>. {en?'Refund cash after month 12 remains pending and is not counted as received in this chart.':'Um reembolso posterior ao mês 12 fica pendente e não é contado como recebido neste gráfico.'}</p>
    <p style={{fontSize:11,lineHeight:1.65,color:'#596474'}}>{en?'Legal basis':'Base legal'}: <a href="https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva20.aspx">{en?'right to deduct':'direito à dedução'}</a> · <a href="https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva22.aspx">{en?'refund conditions':'condições de reembolso'}</a> · <a href="https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva9.aspx">{en?'sport/lease exemptions':'isenções desporto/arrendamento'}</a>. {en?'Confirm the operating entity, contracts and invoice types with a Portuguese tax adviser before seeking investment.':'Confirmar a entidade exploradora, os contratos e os tipos de fatura com um contabilista certificado ou fiscalista antes de fechar a captação.'}</p>
  </section>;
}
