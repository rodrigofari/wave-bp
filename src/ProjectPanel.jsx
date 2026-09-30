/* Component views share the wave's financing assumptions; bar inputs are scenarios. */
function ComponentKpis({data}) {
  return <div className="kpi-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#ddd',margin:'20px 0'}}>
    {[
      ['INVESTIMENTO TOTAL',`${fmtK(data.investment)}€`,'CAPEX + stock inicial'],
      ['RECEITA ANO 1',`${fmtK(data.annRev)}€`,'Liquida de IVA'],
      ['EBITDA ANO 1',`${fmtK(data.ebitda)}€`,pct(data.margin)],
      ['VAL DO PROJETO',`${fmtK(data.npvProject)}€`,`TIR: ${pct(data.projectIRR)}`],
    ].map(([label,value,note])=><div key={label} style={{background:'#fff',padding:18}}>
      <div style={{fontSize:9,letterSpacing:1.3,color:'#777'}}>{label}</div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,margin:'5px 0'}}>{value}</div>
      <div style={{fontSize:10,color:'#777'}}>{note}</div>
    </div>)}
  </div>;
}
function ComponentTable({headings,rows}) {
  return <div style={{overflowX:'auto',margin:'14px 0 22px'}}>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:580}}>
      <thead><tr style={{borderBottom:'2px solid #000'}}>{headings.map((h,i)=><th key={i} style={{padding:'10px 8px',textAlign:i?'right':'left'}}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row,i)=><tr key={i} style={{borderBottom:'1px solid #eee'}}>{row.map((cell,j)=><td key={j} style={{padding:'9px 8px',textAlign:j?'right':'left',fontWeight:j?600:400,fontFamily:j?"'IBM Plex Mono',monospace":'inherit'}}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}
function ComponentMonthly({data}) {
  const max=Math.max(...data.map(m=>Math.abs(m.ebitda)),1);
  return <div aria-label="EBITDA mensal" style={{display:'flex',gap:6,alignItems:'flex-end',height:145,margin:'12px 0 24px'}}>
    {data.map((m,i)=><div key={i} style={{flex:1,textAlign:'center',minWidth:0}}>
      <div style={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",color:m.ebitda<0?'#b22':'#111'}}>{fmtK(m.ebitda)}€</div>
      <div style={{height:Math.max(2,100*Math.abs(m.ebitda)/max),background:m.ebitda<0?'#b44':'#222',margin:'4px auto',width:'65%'}} />
      <div style={{fontSize:10,color:'#666'}}>{MONTHS[i]}</div>
    </div>)}
  </div>;
}
function ProjectPanel({mode,project,s,b,shared,updateWave,updateBar,updateShared,onWave,language='pt'}) {
  const {bar,combined,wave,waveAllocated,withoutWaveCustomers,incremental}=project;
  const isBar=mode==='bar', data=isBar?bar:combined;
  const isConcession=b.operatingMode==='concession',en=language==='en';
  const money=n=>`${fmt(n)}€`;
  const barFields=fields=>fields.map(([key,label,suffix='',max=100000,step=1,min=0,info])=><Row key={key} label={label} value={b[key]} onChange={v=>updateBar(key,v)} suffix={suffix} max={max} step={step} min={min} info={info} />);
  const card={background:'#f7f7f5',padding:18,marginBottom:18,fontSize:12,lineHeight:1.65};
  const linkedRevenue=bar.revenueBreakdown.filter(g=>g.id==='surfers'||g.id==='companions').reduce((a,g)=>a+g.rev,0);
  return <section aria-label={isBar?'Analise do bar':'Analise do conjunto'}>
    <div role="note" style={{...card,borderLeft:'3px solid #b88422',background:'#fff9eb'}}>
      <strong>{isConcession?(en?'ILLUSTRATIVE BAR CONCESSION — RENT NOT QUOTED':'CONCESSÃO ILUSTRATIVA DO BAR — RENDA NÃO VALIDADA'):(en?'ILLUSTRATIVE OWNER-OPERATED BAR — NO VALIDATED ESTIMATES':'BAR EXPLORADO PELA EMPRESA — SEM ESTIMATIVAS VALIDADAS')}</strong><br/>
      {isConcession
        ?(en?'The project receives the editable monthly rent. The concessionaire pays bar staff, product costs, stock and operating bills; only owner-retained costs and any landlord-funded fit-out remain in this project model.':'O projeto recebe a renda mensal editável. O concessionário suporta equipa, produtos, stock e contas operacionais; só os custos retidos pelo proprietário e eventual investimento do senhorio ficam neste modelo.')
        :(en?'Starting values are editable placeholders. The work area is part of the bar: there are no desk passes or memberships. Revenue is spend per visit.':'Os valores iniciais são hipóteses editáveis. O espaço de trabalho faz parte do bar: não há passes nem mensalidades. A receita é o consumo por visita.')}
    </div>
    <h2 style={{fontSize:23,marginBottom:5}}>{isBar?'Bar e espaco para trabalhar':'Onda + bar — visao conjunta'}</h2>
    <p style={{fontSize:12,color:'#666',lineHeight:1.6}}>{isBar?'Resultado do bar dentro do projeto, incluindo clientes trazidos pela onda e a sua quota dos custos comuns.':'Componentes separadas e contas consolidadas. Os impostos e o financiamento do conjunto sao recalculados; nao se somam TIR nem dividendos.'}</p>
    <div style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',border:'1px solid #e0e4e9'}}>
      <label style={{fontSize:12,fontWeight:700}}>{en?'Bar operating model':'Modelo de exploração do bar'}
        <select aria-label={en?'Bar operating model':'Modelo de exploração do bar'} value={b.operatingMode||'own'} onChange={e=>updateBar('operatingMode',e.target.value)} style={{display:'block',marginTop:5,padding:8,maxWidth:'100%'}}>
          <option value="own">{en?'Company-operated':'Operação própria'}</option>
          <option value="concession">{en?'Concessionaire pays rent':'Concessão com renda'}</option>
        </select>
      </label>
      <span style={{fontSize:10,color:'#657184',maxWidth:600,lineHeight:1.5}}>{isConcession
        ?(en?'Rent is project revenue; concessionaire sales and payroll do not enter combined project revenue or costs.':'A renda é receita do projeto; vendas e folha salarial do concessionário não entram nas contas consolidadas.')
        :(en?'Customer sales, bar payroll, operating costs and bar fit-out are included in the project.':'Vendas aos clientes, equipa, custos operacionais e investimento no bar entram no projeto.')}</span>
    </div>
    <ComponentKpis data={data} />
    <h3 style={{fontSize:13,textTransform:'uppercase'}}>EBITDA mensal — {isBar?'bar':'conjunto'}</h3>
    <ComponentMonthly data={data.monthly} />
    {project.warnings.length>0&&<div role="status" style={{...card,border:'1px solid #e6d5ae',background:'#fffaf0'}}>{project.warnings.map((w,i)=><div key={i}>{w}</div>)}</div>}
    {!isBar&&<>
      <h3>Contribuicao de cada componente</h3>
      <ComponentTable headings={['Ano 1 / horizonte da concessao','Onda no projeto','Bar no projeto','Conjunto']} rows={[
        ['CAPEX',... [waveAllocated,bar,combined].map(c=>money(c.capex))],
        ['Stock inicial (fundo de maneio)',money(0),money(bar.workingCapital),money(combined.workingCapital)],
        ['Investimento total',... [waveAllocated,bar,combined].map(c=>money(c.investment))],
        ['Receita',... [waveAllocated,bar,combined].map(c=>money(c.annRev))],
        ['OPEX, incluindo custos comuns',... [waveAllocated,bar,combined].map(c=>money(c.opex))],
        ['Dos quais: custos comuns imputados',money(waveAllocated.first.allocated),money(bar.sharedYear1),money(project.sharedPool+project.extraSharedAnnual)],
        ['EBITDA',... [waveAllocated,bar,combined].map(c=>money(c.ebitda))],
        ['Margem EBITDA',... [waveAllocated,bar,combined].map(c=>pct(c.margin))],
        ['Imposto operacional simulado',... [waveAllocated,bar,combined].map(c=>money(c.first.tax))],
        ['FCFF apos investimento de manutencao',... [waveAllocated,bar,combined].map(c=>money(c.first.fcff))],
        ['VAL',... [waveAllocated,bar,combined].map(c=>money(c.npvProject))],
        ['TIR do projeto',... [waveAllocated,bar,combined].map(c=>pct(c.projectIRR))],
      ]} />
      <p style={{fontSize:11,color:'#666',lineHeight:1.6}}>As colunas das componentes incluem imputacao de custos comuns. Os impostos por componente sao analiticos; no conjunto assume-se uma unica entidade operacional. Ajuste de imposto operacional no ano 1: {money(project.taxReconciliation)}. Mesma taxa de desconto de {pct(wave.wacc)} para permitir comparacao.</p>
      <div className="twocol-charts" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div style={card}><strong>O que acrescenta o bar?</strong>
          <Row label="Investimento adicional, incluindo stock" value={incremental.investment} />
          <Row label="EBITDA adicional (ano 1)" value={incremental.ebitda} />
          <Row label="FCFF adicional (ano 1)" value={incremental.fcff} />
          <Row label="VAL adicional vs onda sem bar" value={incremental.npv} />
          <p style={{marginBottom:0}}>Onda sem bar: EBITDA {money(wave.ebitda)} e VAL {money(wave.npvProject)}. O ganho adicional exclui falsas poupancas por mera redistribuicao de custos.</p>
        </div>
        <div style={card}><strong>De onde vem o resultado do bar?</strong>
          <Row label="EBITDA antes de custos comuns" value={bar.directEBITDA} />
          <Row label="Custos comuns imputados" value={bar.sharedYear1} />
          <Row label="EBITDA depois de custos comuns" value={bar.ebitda} />
          <Row label="EBITDA sem consumo da onda" value={withoutWaveCustomers.ebitda} />
          <p style={{marginBottom:0}}>Sem consumo da onda remove apenas surfistas e acompanhantes. Mantem os restantes clientes, capacidade e custos; nao e um orcamento para abrir um bar autonomo noutro local.</p>
        </div>
      </div>
    </>}
    {isBar&&<div className="grid-main" style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:24,alignItems:'start'}}>
      <aside style={{minWidth:0}}>
        {isConcession?<>
          <Section title={en?'Concession rent and owner costs':'Renda da concessão e custos do proprietário'}>
            <Row label={en?'Fixed rent received / month':'Renda fixa recebida / mês'} value={b.concessionRentMonth} onChange={v=>updateBar('concessionRentMonth',v)} suffix="€/mes" max={50000} step={100} />
            <Row label={en?'Owner-retained costs / month':'Custos retidos pelo proprietário / mês'} value={b.concessionOwnerCostsMonth} onChange={v=>updateBar('concessionOwnerCostsMonth',v)} suffix="€/mes" max={20000} step={50} />
            <Row label={en?'Landlord-funded fit-out CAPEX':'CAPEX de instalação pago pelo senhorio'} value={b.concessionFitoutCapex} onChange={v=>updateBar('concessionFitoutCapex',v)} max={1000000} step={1000} />
            <Row label={en?'Owner asset residual value at exit':'Valor residual dos ativos do proprietário na saída'} value={b.concessionExitValue} onChange={v=>updateBar('concessionExitValue',v)} max={1000000} step={1000} />
            <Row label={en?'Contingency on owner CAPEX':'Contingência no CAPEX do proprietário'} value={b.contingency} onChange={v=>updateBar('contingency',v)} suffix="%" max={50} step={1} />
            <Row label={en?'Annual rent growth':'Crescimento anual da renda'} value={b.revenueGrowth} onChange={v=>updateBar('revenueGrowth',v)} suffix="%" max={20} step={.5} min={-20} />
            <Row label={en?'Annual owner-cost growth':'Crescimento anual dos custos do proprietário'} value={b.costGrowth} onChange={v=>updateBar('costGrowth',v)} suffix="%" max={20} step={.5} min={-20} />
            <p style={{fontSize:10,color:'#657184',lineHeight:1.5}}>{en?'Rent is assumed to be paid in all 12 months. The bar operator is responsible for staffing, stock, product costs, utilities and day-to-day operation unless the concession contract assigns a cost to the owner. Enter that cost above.':'Assume-se o pagamento da renda nos 12 meses. O operador suporta equipa, stock, produtos, consumos e operação diária, salvo custos que o contrato atribua ao proprietário. Introduza esses custos acima.'}</p>
          </Section>
        </>:<>
        <Section title="Lugares e horario">
          {barFields([
            ['seats','Lugares totais','',200],['hoursDay','Horas aberto/dia','h',24,1,1],['opDays','Dias aberto/ano','',365],
            ['seasonalPct','Sazonalidade do publico externo','%',100,5,0,'0% = procura uniforme; 100% = fatores mensais da onda'],
          ])}
        </Section>
        <Section title="Consumo ligado a onda">
          {barFields([
            ['surfConversion','Surfistas que consomem','%',100],['surfTicket','Consumo por surfista','€',100,.5],['surfStay','Permanencia do surfista','h',6,.25,.25],
            ['companionsPerSurfer','Acompanhantes por surfista','',5,.1],['companionConversion','Acompanhantes que consomem','%',100],
            ['companionTicket','Consumo por acompanhante','€',100,.5],['companionStay','Permanencia acompanhante','h',6,.25,.25],
          ])}
        </Section>
        <Section title="Clientes externos">
          {barFields([
            ['externalDaily','Visitas externas/dia (referencia)','',500,1,0,'Antes da sazonalidade; exclui surfistas, acompanhantes e clientes a trabalhar'],
            ['externalTicket','Consumo por visita externa','€',150,.5],['externalStay','Permanencia visita externa','h',6,.1,.1],
          ])}
        </Section>
        <Section title="Espaco para trabalhar">
          {barFields([
            ['workSeats','Lugares para trabalhar','',200,1,0,'Incluidos nos lugares totais do bar, nao adicionais'],
            ['workHours','Janela para trabalhar/dia','h',24],['workDaily','Clientes a trabalhar/dia','',100],
            ['workTicket','Consumo durante toda a visita','€',100,.5],['workStay','Permanencia media a trabalhar','h',12,.5,.5],
          ])}
        </Section>
        <Section title="Custos exclusivos do bar" open={false}>
          {barFields([
            ['cogsPct','Custo dos produtos vendidos','% receita',95,.5],['paymentPct','Comissoes de pagamento','% receita',10,.1],
            ['concessionPct','Concessao sobre receitas do bar','%',20,.5],['mgmtPct','Remuneracao de gestao do bar','%',20,.5],
            ['staffCount','Equipa adicional exclusiva','pessoas',20],['salary','Salario medio mensal','€',5000,50],
            ['utilitiesMonth','Energia, agua e internet','€/mes',10000,50],['rentMonth','Renda/encargo fixo exclusivo','€/mes',20000,100],
            ['insuranceMonth','Seguro exclusivo','€/mes',3000,50],['otherMonth','Outros custos exclusivos','€/mes',5000,50],
          ])}
          <p style={{fontSize:11,color:'#666'}}>Pessoal: 14 pagamentos + encargos de {fd(s.ssRate,2)}%. Sem duplicar os funcionarios da onda. Nao repetir aqui custos incluidos no pool comum.</p>
        </Section>
        <Section title="Investimento e projecao do bar" open={false}>
          {barFields([
            ['works','Obras e instalacoes','€',1000000,5000],['equipment','Equipamento do bar','€',500000,1000],
            ['furniture','Mesas, cadeiras e mobiliario','€',200000,1000],['wifiSockets','Wi-Fi e tomadas','€',50000,500],
            ['permits','Projeto e licencas','€',100000,1000],['contingency','Contingencia sobre CAPEX','%',30],
            ['initialStock','Stock inicial (recuperado na saida)','€',100000,500],['depreciationYears','Vida util dos ativos','anos',25,1,1],
            ['maintCapexPct','Investimento manutencao anual','% CAPEX',15,.5],['revenueGrowth','Crescimento precos/receita','%/ano',20,.5,-20],
            ['costGrowth','Crescimento custos fixos','%/ano',20,.5,-20],['exitValue','Venda residual liquida','€',1000000,10000,-1000000],
          ])}
        </Section>
        </>}
      </aside>
      <main style={{minWidth:0}}>
        <h3>{isConcession?(en?'Rent received by the project':'Renda recebida pelo projeto'):(en?'Bar revenue by source':'Receitas do bar por origem')}</h3>
        <ComponentTable headings={isConcession?(en?['Item','Annual revenue','% revenue']:['Rubrica','Receita anual','% receita']):(en?['Customers','Visits/year','Spend/year','% revenue']:['Clientes','Visitas/ano','Consumo/ano','% receita'])} rows={bar.revenueBreakdown.map(g=>isConcession?[g.label,money(g.rev),pct(bar.annRev?g.rev/bar.annRev:0)]:[g.label,fmt(g.visits),money(g.rev),pct(bar.annRev?g.rev/bar.annRev:0)])} />
        {isConcession
          ?<p style={{fontSize:11,lineHeight:1.6,color:'#666'}}>{en?'Project revenue here is the fixed rent only. The concessionaire’s sales and customer conversion are not counted as company revenue.':'A receita do projeto é apenas a renda fixa. As vendas do operador e a conversão dos seus clientes não são contadas como receita da empresa.'}</p>
          :<p style={{fontSize:11,lineHeight:1.6,color:'#666'}}>Surfistas e acompanhantes geram {money(linkedRevenue)}, {pct(bar.annRev?linkedRevenue/bar.annRev:0)} da receita do bar. Inclui participantes de privadas; os dias de abertura sao considerados coincidentes ate ao menor numero de dias de cada mes. O horario mais curto reduz a exposicao proporcionalmente.</p>}
        <h3>{isConcession?(en?'Costs retained by the owner':'Custos suportados pelo proprietário'):(en?'Bar costs':'Custos do bar')}</h3>
        {bar.costBreakdown.map(c=><Row key={c.label} label={c.label} value={c.v} />)}
        <Row label="EBITDA apos custos comuns" value={bar.ebitda} total />
        <div style={{...card,marginTop:20}}>
          <strong>{isConcession?(en?'Concession EBITDA break-even':'Equilíbrio EBITDA da concessão'):(en?'Operating break-even':'Ponto de equilibrio operacional')}</strong>
          <Row label={en?'Annual revenue for zero EBITDA':'Receita anual para EBITDA zero'} value={bar.breakEvenRevenue} />
          {isConcession?<Row label={en?'Monthly rent assumed':'Renda mensal assumida'} value={b.concessionRentMonth} suffix={en?'€/month':'€/mês'} />:<>
            <Row label="Visitas/dia ao consumo medio atual" value={bar.breakEvenCustomersDay} suffix="" step={.1} />
            <Row label="Visitas/dia simuladas" value={bar.visitsDay} suffix="" step={.1} />
            <Row label="Consumo medio por visita" value={bar.avgTicket} step={.01} />
          </>}
          <p style={{marginBottom:0}}>{isConcession
            ?(en?'Includes owner-retained and allocated shared costs, but excludes concessionaire costs. Excludes tax, debt and investment recovery.':'Inclui custos retidos pelo proprietário e custos comuns imputados, mas exclui custos do concessionário. Não inclui impostos, dívida nem recuperação do investimento.')
            :(en?'Includes shared costs, but excludes tax, debt and investment recovery. Current customer mix and average spend are held constant.':'Inclui custos comuns. Não cobre impostos, dívida ou recuperação do investimento. O mix e o consumo médio simulados mantêm-se constantes neste indicador.')}</p>
        </div>
        {!isConcession&&<>
          <h3>Trabalhar no bar: uso de lugares</h3>
          <Row label="Ocupacao media das horas-lugar" value={bar.occupancy*100} suffix="%" step={.1} />
          <ComponentTable headings={['Origem','Receita / hora-lugar','Margem de contribuicao / hora-lugar']} rows={bar.revenueBreakdown.map(g=>[g.label,`${fd(g.seatHours?g.rev/g.seatHours:NaN,2)}€/h`,`${fd(g.seatHours?g.rev*bar.contributionMargin/g.seatHours:NaN,2)}€/h`])} />
          <p style={{fontSize:11,color:'#666'}}>Margem de contribuicao depois de produtos, pagamentos, concessao e gestao; antes de pessoal e restantes custos fixos.</p>
          <p style={{fontSize:11,color:'#666',lineHeight:1.6}}>Os clientes a trabalhar usam os mesmos lugares e permanecem mais tempo. O limite e aplicado por horas-lugar mensais; nao garante capacidade em horas de ponta. As visitas de trabalho sao limitadas primeiro aos seus lugares/janela, e as restantes origens partilham a capacidade residual proporcionalmente. Nao ha receita de cowork separada.</p>
          <h3>Bar sem o consumo trazido pela onda</h3>
          <Row label="Receita" value={withoutWaveCustomers.annRev} />
          <Row label="EBITDA (mesmos custos)" value={withoutWaveCustomers.ebitda} />
          <Row label="VAL" value={withoutWaveCustomers.npvProject} />
        </>}
      </main>
    </div>}
    <Section title="Custos partilhados e financiamento" open={!isBar}>
      <div className="twocol-charts" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24}}>
        <div>
          <p style={{fontSize:12,lineHeight:1.6}}>Defina que parte das rubricas ja existentes na onda serve ambas as atividades. Sao reclassificadas, nao somadas novamente.</p>
          {[
            ['accountingPct','Contabilidade da onda partilhada'],['marketingPct','Marketing da onda partilhado'],['miscPct','Diversos da onda partilhados'],
            ['barSharePct','Quota do pool imputada ao bar'],
          ].map(([key,label])=><Row key={key} label={label} value={shared[key]} onChange={v=>updateShared(key,v)} suffix="%" max={100} />)}
          <Row label="Pool anual ja incluido na onda" value={project.sharedPool} />
          <Row label="Novos custos comuns adicionais" value={shared.extraMonth} onChange={v=>updateShared('extraMonth',v)} suffix="€/mes" max={20000} step={100} />
          <p style={{fontSize:11,color:'#666'}}>Alterar a quota muda a contribuicao atribuida a cada componente, mas nao o resultado do conjunto. Custos realmente novos entram apenas na linha adicional.</p>
        </div>
        <div>
          <p style={{fontSize:12,lineHeight:1.6}}>Concessao e financiamento comuns. As percentagens dos socios e do banco, definidas na onda, aplicam-se tambem ao investimento adicional.</p>
          <Row label="Anos de concessao do conjunto" value={s.concessionYears} onChange={v=>updateWave('concessionYears',v)} suffix="anos" min={3} max={25} />
          <Row label="Taxa efetiva de imposto assumida" value={s.taxRate} onChange={v=>updateWave('taxRate',v)} suffix="%" max={50} step={.1} />
          <Row label="Juro bancario" value={s.loanRate} onChange={v=>updateWave('loanRate',v)} suffix="%" max={20} step={.25} />
          <Row label="Prazo do emprestimo" value={s.loanYears} onChange={v=>updateWave('loanYears',v)} suffix="anos" min={2} max={25} />
          <Row label="Percentagem de distribuicao" value={s.distPct} onChange={v=>updateWave('distPct',v)} suffix="%" max={100} step={5} />
          <Row label="Divida do conjunto" value={combined.bankAmt} />
          <Row label="Capital proprio do conjunto" value={combined.eqAmt} />
          <button onClick={onWave} style={{marginTop:10,padding:'8px 12px',border:'1px solid #222',background:'#fff',cursor:'pointer'}}>Editar onda e estrutura de capital</button>
        </div>
      </div>
    </Section>
    <h3>Caixa e retorno — {isBar?'bar (imputacao analitica)':'conjunto'}</h3>
    <div className="twocol-charts" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      <div style={card}>
        <Row label="FCFE do ano 1" value={data.first.fcfe} />
        <Row label="Dividendos do ano 1" value={data.first.divs} />
        <Row label="TIR dos acionistas" value={data.equityIRR*100} suffix="%" step={.01} />
        <Row label="Multiplo do capital" value={data.equityMultiple} suffix="x" step={.01} />
      </div>
      <div style={card}>
        <Row label="Reforcos durante a operacao" value={data.years.reduce((a,y)=>a+y.capitalCall,0)} />
        <Row label="Caixa retida na saida" value={data.last.cash} />
        <Row label="Divida pendente na saida" value={data.last.balance} />
        <Row label="Liquidacao final dos acionistas" value={data.equityExit} />
      </div>
    </div>
    <ComponentTable headings={['Ano','Receita','EBITDA','Imposto apos juros','FCFE','Dividendos','Reforcos','Divida final']} rows={data.years.map(y=>[y.y,money(y.rev),money(y.ebitda),money(y.equityTax),money(y.fcfe),money(y.divs),money(y.capitalCall),money(y.balance)])} />
    <p style={{fontSize:11,color:'#666',lineHeight:1.7}}>Horizonte de {wave.N} anos, valor residual editavel, sem perpetuidade. O stock inicial e recuperado ao valor contabilistico no fim; nao e depreciado e nao cresce. Precos liquidos de IVA, sem calendario de IVA, pre-abertura ou tesouraria intranual. Imposto simplificado sem reporte de prejuizos. Equipa do bar adicional; pessoal partilhado deve ser repartido manualmente para evitar duplicacoes. Eventos e pacotes da onda devem excluir consumo ja contabilizado no bar. O modelo nao presume mais vendas da onda por existir um bar.</p>
  </section>;
}

function SimulationControls({s,b,shared,modelInputs,updateWave,project}) {
  const ticket=s.salesMode==='tickets';
  const thresholds=React.useMemo(()=>ticket?CitywaveHospitality.ticketBreakEven(modelInputs.wave,modelInputs.bar,modelInputs.shared):null,[modelInputs,ticket]);
  const fields=items=>items.map(([key,label,suffix,min,max,step=1])=><Row key={key} label={label} value={s[key]} onChange={v=>updateWave(key,v)} suffix={suffix} min={min} max={max} step={step}/>);
  const result=v=>v===null?'Nao atinge na capacidade atual':`${fd(v,2)} bilhetes/dia`;
  return <section aria-label="Configuracao da simulacao" style={{border:'1px solid #ddd',padding:18,marginBottom:24}}>
    <label style={{fontWeight:700}}>Modelo de venda <select aria-label="Modelo de venda" value={s.salesMode} onChange={e=>updateWave('salesMode',e.target.value)} style={{padding:8,maxWidth:'100%'}}>
      <option value="tickets">Bilhetes / entrada flexivel</option><option value="sessions">Sessoes de grupo</option>
    </select></label>
    <p style={{fontSize:12,lineHeight:1.6}}>Os preços são {s.pricesIncludeVat?'finais com IVA':'antes de IVA'}; altere esta base em IVA e caixa. Material incluído exceto avançados. O bar continua separado, com consumo de surfistas e procura externa editável. Os valores são hipóteses; os resultados não validam procura nem orçamentos.</p>
    <div className="twocol-charts" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24}}>
      <div>
        {ticket?fields([
          ['ticketsDay','Procura de bilhetes por dia aberto','',0,500,.1],
          ['ticketPrice','Receita media por bilhete apos descontos','€',0,200,.01],
          ['ticketMinutes','Minutos efetivos de onda por bilhete','min',1,60,.5],
          ['turnaroundMinutes','Troca / intervalo por bilhete','min',0,20,.5],
        ]):<p style={{fontSize:12}}>Configure duracao, grupos e precos por nivel em Onda sem bar → Receitas. A procura de pico e ajustada pela sazonalidade e limitada aos horarios disponiveis.</p>}
        {fields([['operatingHoursDay','Horas de funcionamento da onda','h',1,24],['opDays','Dias de funcionamento da onda','',0,365]])}
        {ticket&&<p style={{fontSize:12,lineHeight:1.6}}>Capacidade: <strong>{project.wave.ticketCapacity} bilhetes/dia</strong>, uma utilizacao de cada vez, incluindo trocas. Volume uniforme por dia aberto, sem rampa nem sazonalidade. Neste modo nao se somam privadas, clinicas, alugueres, eventos ou cartoes. Vendas efetivas: <strong>{fd(project.wave.avgPeopleDay,1)}/dia</strong>. Esta capacidade e uma hipotese operacional, nao uma especificacao de seguranca.</p>}
      </div>
      <div>
        {fields([
          ['distributionPct','Receita da onda vendida por intermediarios','%',0,100],
          ['commissionPct','Comissao sobre receita liquida intermediada','%',0,100],
          ['equipmentPerVisit','Custo medio de material por participacao','€',0,30,.1],
          ['kwhMax','Potencia maxima da onda','kW',100,1500,10],
          ['avgPumpLoad','Carga media durante funcionamento','%',0,100,5],
          ['electricityRate','Preco medio da energia (hipotese)','€/kWh',.01,1,.001],
          ['energyOtherMonth','Potencia e consumos auxiliares adicionais','€/mes',0,50000,100],
        ])}
        <p style={{fontSize:11,color:'#666',lineHeight:1.6}}>Comissoes aplicadas uma vez como custo, sem reduzir novamente o preco. Material: lavagem/desgaste/reposicao corrente media, excluindo investimento ja contabilizado. Nao repetir custos existentes. Encargos eletricos adicionais nao estao incluidos no €/kWh salvo se introduzir uma media integral; nesse caso mantenha a linha adicional a zero. Valores zero nao constituem orcamentos validados.</p>
      </div>
    </div>
    {ticket&&thresholds.valid&&<>
      <h3>Break-even do conjunto</h3>
      <ComponentTable headings={['Limiar','Bilhetes vendidos por dia aberto']} rows={[
        ['Operacao: EBITDA zero',result(thresholds.operating)],
        ['Caixa ano 1: apos imposto, divida e manutencao',result(thresholds.cash)],
        [`Investimento: VAL zero a ${pct(project.wave.wacc)} em ${project.wave.N} anos`,result(thresholds.investment)],
      ]}/>
      <p style={{fontSize:11,lineHeight:1.6}}>Inclui o bar e os custos comuns. Se a meta excede a capacidade, nao e apresentado um retorno atingivel. Caixa positiva nao equivale a dividendos nem recuperacao do investimento. Todos os limiares mantem os restantes pressupostos atuais.</p>
    </>}
    {ticket&&!thresholds.valid&&<p role="alert">{thresholds.reason}</p>}
  </section>;
}
