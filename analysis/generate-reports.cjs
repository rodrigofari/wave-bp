// All published reports come from the same engines/defaults as the interface.
// node analysis/generate-reports.cjs [--check]
const fs=require('node:fs');const path=require('node:path');
const F=require('../src/finance');const H=require('../src/hospitality');
const money=x=>Number.isFinite(x)?`${F.fmt(x)} €`:'Indisponível';
const percent=x=>Number.isFinite(x)?`${(x*100).toFixed(2)}%`:'Indisponível';
const n=x=>Number.isFinite(x)?x.toFixed(2):'Não atinge a capacidade';
const table=(headers,rows)=>[headers,headers.map(()=> '---'),...rows].map(r=>'| '+r.join(' | ')+' |').join('\n');
const intro='Atualizado em 23/09/2026. Gerado por `node analysis/generate-reports.cjs` a partir do motor do simulador. Valores líquidos de IVA. Cenários ilustrativos, não previsões nem orçamentos.\n\n';
const p=H.calculateProject(F.APP_INIT);
const ticketWave={...F.APP_INIT,ticketMinutes:7,turnaroundMinutes:1};
const ticketBar={...H.BAR_INIT,externalDaily:60,seasonalPct:0};
const q=H.calculateProject(ticketWave,ticketBar);
const bt=H.ticketBreakEven(ticketWave,ticketBar);
const rows=[0,30,60].map(externalDaily=>{
 const b={...ticketBar,externalDaily};const r=H.ticketBreakEven(ticketWave,b);const c=H.calculateProject(ticketWave,b).combined;
 return [externalDaily,n(r.operating),n(r.cash),n(r.investment),percent(c.projectIRR)];
});
const sources='A localização pretendida junto ao Teleférico do Funchal é informação do promotor. O [Diário de Notícias de 27/05/2026](https://www.dnoticias.pt/2026/5/27/493459-teleferico-do-funchal-investe-45-milhoes/) reporta cerca de 1,1 milhões de passageiros em 2025. É contexto histórico, não contagem de clientes distintos nem de peões à porta. Não somamos teleférico, hotéis e cruzeiros, pois existe sobreposição. Os canais de venda devem ser avaliados por reservas e comissões, não somados como populações independentes.';
const caveats='A tarifa EEM, o perfil real de consumo da máquina, os orçamentos e a procura não estão validados. Comissões, custo unitário de material e encargos elétricos adicionais iniciam a zero: isso não comprova ausência de custo. Sem rampa de abertura, tesouraria mensal, reporte fiscal de prejuízos ou calendário de IVA. Prazo de dez anos nos cenários abaixo, sem valor residual dos ativos; recupera-se o stock inicial. A TIR é do projeto, não de um sócio após sweat equity.';
const docs={};
docs['BAR_ANALYSIS.md']='# Onda e bar — análise atual\n\n'+intro+
'## Cenário inicial da página\n\nO modo inicial é bilhetes: procura de 70/dia, limitada a **66 vendas/dia** por oito minutos de onda + um de troca em dez horas. Bar com 36 lugares, 45 visitas externas/dia de referência antes da sazonalidade de 50%, seis clientes a trabalhar/dia e três funcionários adicionais.\n\n'+
table(['Indicador','Onda no projeto','Bar no projeto','Conjunto'],[
 ['Investimento',money(p.waveAllocated.investment),money(p.bar.investment),money(p.combined.investment)],
 ['Receita ano 1',money(p.waveAllocated.annRev),money(p.bar.annRev),money(p.combined.annRev)],
 ['EBITDA ano 1',money(p.waveAllocated.ebitda),money(p.bar.ebitda),money(p.combined.ebitda)],
 ['VAL',money(p.waveAllocated.npvProject),money(p.bar.npvProject),money(p.combined.npvProject)],
 ['TIR',percent(p.waveAllocated.projectIRR),percent(p.bar.projectIRR),percent(p.combined.projectIRR)]])+ '\n\n'+
`Os custos comuns existentes somam ${money(p.sharedPool)}, dos quais ${money(p.bar.sharedYear1)} são imputados ao bar. A onda sem bar teria EBITDA de ${money(p.wave.ebitda)}. A melhoria real ao acrescentar o bar é ${money(p.incremental.ebitda)}/ano de EBITDA; redistribuir custos não gera poupança. Impostos consolidados são recalculados, portanto VAL e TIR analíticos não devem ser somados.\n\n`+
table(['Origem do consumo do bar','Receita anual'],p.bar.revenueBreakdown.map(g=>[g.label,money(g.rev)]))+`\n\nSem consumo dos surfistas/acompanhantes, mantendo os outros clientes e custos, o EBITDA do bar seria ${money(p.withoutWaveCustomers.ebitda)}. É uma sensibilidade, não a previsão de um bar autónomo noutro local. Quem trabalha paga consumo por visita, não mensalidades.\n\n`+sources+'\n\n'+caveats+'\n';
const groupRows=[6,8,10].flatMap(ridersPerSession=>[10,12,14].map(sessionsDay=>{
 const r=H.calculateProject({...F.INIT,ridersPerSession,sessionsDay},ticketBar);
 return [ridersPerSession,sessionsDay,n(r.wave.monthly.reduce((a,m)=>a+m.sessions,0)/F.INIT.opDays),n(r.wave.avgPeopleDay),money(r.combined.ebitda),percent(r.combined.projectIRR),money(r.combined.npvProject)];
}));
docs['OPERATING_ANALYSIS.md']='# Participantes, sessões e horários — análise atual\n\n'+intro+
'## Sessões de grupo\n\nEste quadro usa explicitamente o modo de sessões: dez horas, sessões de 60 minutos sem intervalo adicional, máximo dez sessões/dia. A procura de pico é ajustada à sazonalidade; não é o número de sessões realizadas. Bar com 60 visitas externas/dia uniformes a 10,50 €, além do consumo ligado à onda e de quem trabalha. Mantêm-se privadas, aluguer apenas a avançados, eventos e cartões nos valores iniciais. Clínicas desligadas.\n\n'+
table(['Participantes públicos/sessão','Procura de pico','Sessões vendidas/dia','Participações públicas/dia','EBITDA conjunto','TIR','VAL'],groupRows)+'\n\n'+
'## Horário com procura de pico de 12 e oito participantes\n\n'+table(['Horas/dia','Sessões vendidas/dia','EBITDA conjunto','TIR'],[8,9,10,11,12].map(operatingHoursDay=>{const r=H.calculateProject({...F.INIT,ridersPerSession:8,sessionsDay:12,operatingHoursDay},ticketBar);return [operatingHoursDay,n(r.wave.monthly.reduce((a,m)=>a+m.sessions,0)/340),money(r.combined.ebitda),percent(r.combined.projectIRR)];}))+'\n\n'+
'A energia aumenta com as horas mesmo que não haja vendas. A equipa não aumenta automaticamente: extensões de horário exigem orçamento de escala. A média de participantes representa lugares vendidos, não surfistas simultâneos. Encurtar sessões não prova que se consiga manter preço e procura.\n\n'+
'As referências operacionais [Citywave Viena](https://www.city-wave.at/faqs/) e [Citywave Tokyo](https://citywave-tokyo.jp/english/) mostram grupos de dimensão variável; não certificam a configuração local. O produto turístico deve ter material e acompanhamento definidos e preço líquido compatível com os custos de venda.\n\n'+caveats+'\n';
docs['TICKET_BREAKEVEN.md']='# Bilhetes e break-even — análise atual\n\n'+intro+
'## Exemplo reproduzível na interface\n\nSelecionar bilhetes; procura 70/dia; preço médio 41,807 € após descontos e antes de comissões; sete minutos de onda + um de troca; dez horas/dia e 340 dias. Capacidade de 75 bilhetes/dia, sem utilizações simultâneas. No bar: sazonalidade externa zero, restantes pressupostos iniciais. Este exemplo difere do arranque da página (oito minutos + um, capacidade 66).\n\n'+
'Não há receitas de privadas, clínicas, alugueres, eventos ou cartões neste modo. O bar continua a receber surfistas e acompanhantes; mantém também seis clientes/dia a trabalhar. Os valores da tabela são bilhetes por dia aberto em média.\n\n'+
table(['Clientes externos bar/dia','EBITDA zero','FCFE ano 1 zero','VAL zero dentro de 75/dia','TIR com 70 bilhetes'],rows)+'\n\n'+
`Com 70 bilhetes e 60 clientes externos/dia: receita da onda ${money(q.wave.annRev)}, receita do bar ${money(q.bar.annRev)}, EBITDA conjunto ${money(q.combined.ebitda)}, FCFE do ano 1 ${money(q.combined.first.fcfe)}, VAL ${money(q.combined.npvProject)} e TIR ${percent(q.combined.projectIRR)}.\n\n`+
`O limiar de VAL zero é ${n(bt.investment)} bilhetes/dia à taxa de ${percent(q.wave.wacc)}. EBITDA zero cobre operação; FCFE zero cobre também imposto, dívida e manutenção no ano 1; VAL zero remunera o investimento no horizonte. FCFE não é dividendo automaticamente distribuível.\n\n`+
'No limite inicial de 66 bilhetes/dia, não se podem usar metas acima de 66 como atingíveis. O simulador limita vendas e sinaliza o retorno que não cabe nessa capacidade. Alterar a permanência é alterar a experiência; não é uma poupança garantida.\n\n'+caveats+'\n';
docs['MODEL_CLARIFICATIONS.md']='# Pressupostos comerciais e energia — versão atual\n\n'+intro+
'## Experiência e material\n\nClínicas significam coaching especializado adicional e estão desativadas por defeito. O acompanhamento incluído na experiência não pode ser vendido novamente como suplemento. Material incluído em principiantes, intermédios e crianças; apenas avançados têm aluguer opcional. Preços de sessões: 49 €/39 €/39 €/35 €, líquidos de IVA, com descontos configuráveis. Preço médio de bilhetes flexíveis é um input independente já após descontos.\n\n'+
'O custo unitário de material é editável e inicia a zero por falta de orçamento. Lavagem/reposição corrente devem ser distinguidas do investimento inicial e da manutenção capitalizada. Participantes por privada são um único input usado no material e no bar.\n\n'+
'## Energia\n\nReferência de reunião registada no repositório: potência máxima de 600 kW para 10 m. Com carga de 100%, dez horas/dia, 340 dias e 0,16 €/kWh, o custo da onda é **326 400 €/ano** para **2 040 000 kWh/ano**. Cada 0,01 €/kWh altera o custo em 20 400 €/ano. O custo mantém-se durante o horário sem vendas.\n\n'+
'A referência não substitui uma ficha técnica final. A tarifa de 0,16 €/kWh não é orçamento da EEM. Há campo adicional para potência e consumos auxiliares; não duplicar esses encargos se já estiverem num preço integral por kWh. O bar tem uma rubrica própria de consumos. [ERSE: estrutura tarifária 2026](https://www.erse.pt/media/lipjxgih/estrutura-tarif%C3%A1ria-se-2026.pdf).\n\n'+
'## Coerência das vistas\n\nConjunto agrega onda e bar como uma entidade. Onda sem bar, incluindo os seus separadores Investidores, P&L e Análise, refere-se apenas à piscina. Bar mostra a contribuição com custos comuns imputados. Os relatórios são cenários fixos gerados do mesmo motor; não acompanham edições locais até serem regenerados.\n\n'+caveats+'\n';
// Minimal escaped Markdown rendering for this controlled report format.
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inline=s=>escape(s).replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
function render(md){let inTable=false;return md.split('\n').map(line=>{if(line.startsWith('|')){if(/^\|[\s|:-]+$/.test(line))return '';const cells=line.slice(1,-1).split('|');const open=inTable?'':'<div class="scroll"><table>';const tag=inTable?'td':'th';inTable=true;return open+'<tr>'+cells.map(c=>`<${tag}>${inline(c.trim())}</${tag}>`).join('')+'</tr>';}
 const end=inTable?'</table></div>':'';inTable=false;const m=/^(#{1,3}) (.*)$/.exec(line);return end+(m?`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`:line?`<p>${inline(line)}</p>`:'');}).join('\n')+(inTable?'</table></div>':'');}
docs['reports.html']='<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatórios atuais — Citywave Funchal</title><style>body{font:16px/1.6 system-ui;margin:24px auto;padding:0 18px;max-width:1100px;color:#222}h1{line-height:1.2}article{border-top:2px solid #222;margin-top:36px;padding-top:20px}.scroll{overflow:auto}table{border-collapse:collapse;font-size:14px;width:100%}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:right}th:first-child,td:first-child{text-align:left}a{color:#075d9b}code{background:#f5f5f5}nav a{display:inline-block;margin:4px 12px 4px 0}</style></head><body><a href="./">← Voltar ao simulador</a><h1>Relatórios e pressupostos atuais</h1><p>Versão 23/09/2026. Valores gerados do mesmo motor financeiro da página. São cenários fixos identificados; não refletem alterações feitas na sua sessão.</p><nav>'+Object.keys(docs).map((k,i)=>`<a href="#report-${i}">${k.replace('.md','')}</a>`).join('')+'</nav>'+Object.values(docs).map((v,i)=>`<article id="report-${i}">${render(v)}</article>`).join('')+'</body></html>\n';
let stale=false;
for(const [file,body]of Object.entries(docs)){const target=path.join(__dirname,'..',file);if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==body){console.error('Out of date: '+file);stale=true;}}else fs.writeFileSync(target,body);}
if(stale)process.exitCode=1;
else console.log(process.argv.includes('--check')?'Reports match current model.':'Updated reports from current model.');
