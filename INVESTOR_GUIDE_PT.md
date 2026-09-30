# Citywave Funchal — guia do investidor

Atualizado em 30/09/2026. Este guia explica como ler e testar o simulador. Os valores abaixo são o cenário inicial do motor: hipóteses editáveis, não previsões, propostas de financiamento ou orçamentos.

## Em 60 segundos

A proposta combina uma piscina de ondas Citywave no Funchal com um bar simples onde surfistas, acompanhantes, visitantes e pessoas a trabalhar podem consumir. O espaço de trabalho não vende mensalidades nem lugares: essas pessoas são clientes do operador do bar. Na concessão inicial, a Lda. recebe renda fixa, não contabiliza esse consumo. O teleférico e os cruzeiros ajudam a caracterizar a circulação turística, mas os respetivos passageiros não são clientes garantidos. Há sobreposição entre turistas, hotéis, cruzeiros, teleférico e venda online; não some essas populações.

O simulador separa **Onda sem bar**, **Bar / trabalhar** e **Conjunto**. A vista do conjunto é a mais útil para avaliar o investimento total. A onda exige muito capital: no cenário inicial do motor, o conjunto tem investimento de 2 292 400 €, receita anual de 968 149 €, EBITDA de 296 112 €, VAL de -488 788 € e TIR do projeto de 3.50%, a uma taxa de desconto de 8.14%. O EBITDA positivo significa que a operação gera resultado operacional antes de depreciação, juros e imposto; **não significa que o investimento recupera o capital**.

| Indicador — cenário inicial | Onda (quota no conjunto) | Bar no conjunto | Conjunto |
| --- | --- | --- | --- |
| Investimento | 2 292 400 € | 0 € | 2 292 400 € |
| Receita ano 1 | 938 149 € | 30 000 € | 968 149 € |
| EBITDA ano 1 | 284 112 € | 12 000 € | 296 112 € |
| VAL | -562 604 € | 73 816 € | -488 788 € |
| TIR do projeto | 2.74% | Indisponível | 3.50% |

Na coluna da onda, os custos comuns já estão repartidos com o bar. A vista isolada da onda mantém a totalidade desses custos. VAL/TIR das componentes são analíticos e não devem ser somados como se fossem os retornos consolidados.

## Como experimentar

1. Escolha **Conjunto** para ver a piscina e o bar juntos. Compare depois com **Onda sem bar** e **Bar / trabalhar**.
2. Comece pelos controlos à esquerda: preço médio, minutos de onda, horário, dias abertos, vendas/dia, energia e investimento. Os números sublinhados são editáveis.
3. Abra cada secção pelo título. Passe o cursor pelo círculo **i** para ver uma explicação da secção.
4. Edite os inputs do bar no painel **Bar / trabalhar**. O arranque simula concessão, com renda e custos retidos ilustrativos; mude para operação própria para testar vendas diretas.
5. Compare EBITDA, caixa e VAL/TIR. Para testar a procura, altere bilhetes ou sessões da onda; na alternativa de operação própria do bar, altere também visitantes externos. Passageiros turísticos não são conversões automáticas.
6. No painel **IVA e caixa**, escolha se os preços introduzidos são antes ou depois de IVA e teste faturação Citywave e prazo de reembolso. Leia os três gráficos de break-even no topo: variam EBITDA, FCFE do ano 1 e VAL conforme a procura da onda. No modo de sessões, a procura indicada é de pico e a sazonalidade converte-a numa média anual esperada; não é uma agenda diária reservável.

As alterações vivem apenas na sessão do navegador e desaparecem ao recarregar. Partilhe o link do simulador para cada investidor testar os seus próprios cenários; este link não grava nem transmite os valores alterados.

## O que significam as três vistas

| Vista | O que inclui | Para que serve |
|---|---|---|
| Onda sem bar | Piscina, bilhetes/sessões, pessoal e custos originais da onda | Medir o negócio da piscina isoladamente |
| Bar / trabalhar | Renda e custos do proprietário na concessão; vendas e consumo por visita apenas na operação própria | Testar renda ou exploração direta do bar |
| Conjunto | Receitas e custos da onda e do bar; financiamento e impostos consolidados | Avaliar o projeto que precisaria de financiamento |

Os custos partilhados podem ser repartidos entre onda e bar para análise, mas essa repartição não cria poupança. A TIR e o VAL das componentes são analíticos e **não devem ser somados**. Para o retorno total, use o conjunto.

## Bilhetes e capacidade: que produto está a ser simulado?

O modo inicial vende bilhetes de entrada flexível, com uma duração de onda por cliente. Capacidade diária = parte inteira de (minutos abertos ÷ (minutos de onda por bilhete + minutos de troca)). Com dez horas, oito minutos de onda e um minuto de troca, o limite é 66 bilhetes/dia; uma procura editada de 70 fica limitada a 66. A capacidade não presume 12–14 pessoas a surfar simultaneamente: o modelo atual assume uma utilização de cada vez e **não certifica capacidade segura nem operacional**.

Isto é diferente de uma sessão de aula no mar. Os minutos configurados são tempo de utilização da piscina por bilhete, não minutos em pé numa onda. Antes de apresentar capacidade final, a Citywave e a equipa de segurança terão de confirmar o formato de entrada, número de surfistas simultâneos, rotação, descanso, instrução, limpeza e tempo de troca. Aumentar bilhetes/dia sem validar estes limites sobrestima receita.

O preço médio do bilhete é um input independente, já após descontos; no painel IVA decide-se se o valor introduzido é antes ou depois de IVA. A política comercial ainda está por decidir. As comissões de venda são outro custo. No modo bilhetes não se somam privadas, clínicas, alugueres, eventos nem cartões. No modo de sessões existe um mix de níveis: o material está incluído para principiantes, intermédios e crianças; apenas avançados podem optar por aluguer. Coaching extra começa desligado.

## Sessões de grupo: comparação de 45 e 60 minutos

Cada sessão dura 45 ou 60 minutos no total e recebe até 14 pessoas. Não se assume que cada participante usa a onda durante todo esse período: o tempo efetivo varia conforme o nível e a dinâmica do grupo. Com dez horas abertas, sem intervalo entre sessões, cabem até 13 sessões (182 lugares) de 45 minutos ou dez sessões (140 lugares) de 60 minutos por dia. A procura efetiva é limitada por este teto e ajustada pelos fatores mensais de sazonalidade.

| Sessão de grupo | Máx. sessões/dia | Máx. pessoas/dia | Participantes públicos/ano | Tarifa energia | Energia/ano | Receita da onda | EBITDA conjunto | VAL conjunto | TIR projeto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 min | 13 | 182 | 47 017 | 0.16 €/kWh | 326 400 € | 2 064 279 € | 1 519 207 € | 6 480 688 € | 49.90% |
| 60 min | 10 | 140 | 41 235 | 0.16 €/kWh | 326 400 € | 1 814 536 € | 1 260 136 € | 4 974 783 € | 41.21% |

Comparação indicativa do motor, mantendo restantes pressupostos iniciais de preços, procura de pico (14 sessões/dia), energia, custos, bar e financiamento. Os valores de participantes são vendas públicas anuais depois da sazonalidade; capacidade máxima é um teto, não uma previsão de procura. A energia continua calculada pelas horas de funcionamento por dia, por isso encurtar a sessão não reduz automaticamente o custo energético diário. O intervalo entre sessões pode ser editado no simulador e reduz a capacidade disponível.

## Como ganha dinheiro o bar

O arranque simula concessão: a Lda. recebe 2 500 €/mês de renda antes de IVA e suporta 300 €/mês de custos retidos. As vendas de comidas e bebidas pertencem ao concessionário e não entram na receita da Lda. Os valores são inteiramente ilustrativos; a operação própria é editável.

No modo de operação própria, o simulador separa quatro origens para reduzir dupla contagem: surfistas, acompanhantes, público externo e pessoas a trabalhar. Para cada origem, estima visitas, conversão em consumo, consumo médio e duração. Os visitantes a trabalhar usam os mesmos lugares do bar e geram **consumo por visita**, não uma segunda receita de cowork. O limite de capacidade é calculado por horas-lugar mensais; pode falhar picos horários.

A circulação anual do teleférico (aprox. 1,1 milhões de passageiros em 2025, conforme a fonte indicada nos relatórios) e dos cruzeiros é contexto para testar canais, não procura diária à porta. Um passageiro pode não passar no local, ser contado noutro canal ou não consumir. Substitua tráfego por medições de peões, conversões, acordos com hotéis/cruzeiros/teleférico, reservas online e dados de teste. Comissões de intermediários devem ser deduzidas uma vez; o canal online e os parceiros podem ter custos diferentes.

Na alternativa de operação própria, procura diária externa, sazonalidade, lugares, consumo médio, equipa, salários, renda, obras e equipamento são hipóteses. Peça orçamentos e teste sensibilidades. Zero num custo (material, eletricidade auxiliar, comissão) quer dizer “sem valor introduzido”, não “custo nulo”.

## Como ler os números financeiros

| Termo | Em linguagem simples |
|---|---|
| Receita | Vendas do ano, líquidas de IVA no modelo |
| OPEX | Gastos recorrentes necessários à operação |
| EBITDA | Receita menos custos operacionais antes de depreciação, juros e imposto |
| Margem EBITDA | EBITDA ÷ receita; parcela da receita que sobra antes desses itens |
| CAPEX | Investimento em construção, instalação, equipamento e ativos |
| Fundo de maneio | Dinheiro empatado no stock inicial; o modelo assume recuperação no fim |
| Depreciação | Repartição contabilística do custo de ativos pela sua vida útil; não é saída de caixa anual |
| FCFF | Caixa operacional após imposto operacional e investimento de manutenção, antes de dívida |
| FCFE | Caixa após imposto financiado, juros, amortização de dívida e manutenção, antes de dividendos |
| VAL / NPV | Valor atual dos fluxos futuros descontados menos o investimento inicial. VAL positivo supera a taxa de desconto assumida; negativo fica aquém |
| TIR / IRR do projeto | Taxa de retorno implícita dos fluxos do projeto antes de financiamento; compare-a com a taxa de desconto |
| TIR dos acionistas | Retorno dos fluxos de capital próprio, incluindo reforços, dividendos e saída |
| WACC | Taxa usada para descontar fluxos do projeto; neste simulador é calculada a partir dos pressupostos de dívida/capital próprio e CAPM |
| Payback | Tempo até recuperar o investimento através de FCFF acumulado; não mede valor criado depois da recuperação |
| Break-even EBITDA | Bilhetes necessários para cobrir custos operacionais; não cobre investimento, imposto nem amortização da dívida |
| Break-even FCFE | Bilhetes necessários para FCFE do ano 1 igual a zero, incluindo imposto, dívida e manutenção |
| Break-even VAL | Bilhetes necessários para VAL igual a zero no prazo e taxa de desconto escolhidos |

Um EBITDA positivo pode coexistir com FCFE negativo: amortização da dívida e investimento de manutenção consomem caixa. Uma TIR baixa/negativa ou VAL negativo significa que os fluxos modelados não compensam o capital à taxa de desconto e horizonte escolhidos. Dividendos não são automáticos; a distribuição do modelo é uma regra simplificada, não validação legal nem bancária.

## Energia: a variável que merece um orçamento

O caso inicial usa potência máxima de 600 kW, carga média de 100%, dez horas/dia, 340 dias e tarifa editável de 0,16 €/kWh. A fórmula dá 6.000 kWh/dia e 326 400 €/ano. Cada alteração de 0,01 €/kWh muda o custo anual em 20 400 €, mantendo todo o resto igual. A energia é cobrada durante o horário de operação, mesmo com poucos clientes. A tarifa e carga real não estão confirmadas; acrescentos de bombas auxiliares, bar, potência contratada, tarifas horárias e taxas devem ser obtidos da EEM/fornecedor e da especificação técnica. Não conte o mesmo encargo duas vezes.

## Pressupostos e limites que um investidor deve testar

- **Procura e preços:** não há estudo de mercado que valide conversão, preço, volume ou sazonalidade. O crescimento anual aumenta receita/preços, não cria novos clientes automaticamente.
- **Capacidade e segurança:** o modo de sessões simula grupos de 45 ou 60 minutos, limitados a 14 pessoas; a capacidade segura, rotação e tempo efetivo na onda exigem confirmação operacional. O modo de bilhetes flexíveis é uma hipótese separada de utilização individual.
- **Bar:** o arranque simula concessão, com renda e custos do proprietário ilustrativos; operação própria é uma alternativa editável. Valide contrato, investimento e renda negociável.
- **Eletricidade:** tarifa e perfil de carga são hipóteses; o consumo real e o custo contratado podem alterar materialmente o break-even.
- **Imposto e IVA:** IRC e IVA são distintos. O painel IVA modela preço final/bruto, dedutibilidade e uma ponte mensal simplificada; não inclui custo financeiro da espera pelo reembolso no VAL/TIR, nem substitui parecer fiscal.
- **Financiamento:** percentagens e taxa/prazo de dívida são inputs, não ofertas bancárias. O sweat equity é uma ponderação ilustrativa, não acordo societário.
- **Horizonte e saída:** igual ao prazo da concessão, sem perpetuidade; valor residual zero por defeito. A caixa intra-anual, custos de pré-abertura, ramp-up, atrasos e custos de desmantelamento não estão modelados.
- **Consolidação:** uma entidade operacional, custos comuns repartidos analiticamente e impostos do conjunto recalculados. Não some VAL/TIR por componente.

Use este simulador para perguntar “o que teria de ser verdade?” e identificar inputs críticos. Para decisão de investimento, substitua os valores ilustrativos por estudos, especificação/garantias Citywave, orçamentos EEM/obras, plano operacional, propostas de dívida, contratos e revisão fiscal/legal.
