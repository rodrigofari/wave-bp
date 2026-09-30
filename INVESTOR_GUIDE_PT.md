# Citywave Funchal — guia do investidor

Atualizado em 30/09/2026. Este guia explica como ler e testar o simulador. Os valores abaixo são o cenário inicial do motor: hipóteses editáveis, não previsões, propostas de financiamento ou orçamentos.

## Em 60 segundos

A proposta combina uma piscina de ondas Citywave no Funchal com um bar simples onde surfistas, acompanhantes, visitantes e pessoas a trabalhar podem consumir. O espaço de trabalho não vende mensalidades nem lugares: essas pessoas são clientes do operador do bar. Na concessão inicial, a Lda. recebe renda fixa, não contabiliza esse consumo. O teleférico e os cruzeiros ajudam a caracterizar a circulação turística, mas os respetivos passageiros não são clientes garantidos. Há sobreposição entre turistas, hotéis, cruzeiros, teleférico e venda online; não some essas populações.

O simulador apresenta o projeto conjunto numa única vista; a tabela do resumo identifica separadamente a contribuição da onda e do bar. Todos os indicadores principais referem-se ao investimento total. A onda exige muito capital: no cenário inicial do motor, o conjunto tem investimento de 2 292 400 €, receita anual de 808 563 €, EBITDA de 144 505 €, VAL de -1 371 916 € e TIR do projeto de -6.96%, a uma taxa de desconto de 8.14%. O EBITDA positivo significa que a operação gera resultado operacional antes de depreciação, juros e imposto; **não significa que o investimento recupera o capital**.

| Indicador — cenário inicial | Onda (quota no conjunto) | Bar no conjunto | Conjunto |
| --- | --- | --- | --- |
| Investimento | 2 292 400 € | 0 € | 2 292 400 € |
| Receita ano 1 | 778 563 € | 30 000 € | 808 563 € |
| EBITDA ano 1 | 132 505 € | 12 000 € | 144 505 € |
| VAL | -1 451 695 € | 73 816 € | -1 371 916 € |
| TIR do projeto | -8.11% | Indisponível | -6.96% |

Na coluna da onda, os custos comuns já estão repartidos com o bar. A simulação sem bar, calculável pelo motor, mantém a totalidade desses custos. VAL/TIR das componentes são analíticos e não devem ser somados como se fossem os retornos consolidados.

## Como experimentar

1. Abra o simulador único: o cabeçalho e todas as abas mostram o projeto completo; a tabela do Resumo discrimina onda, bar e conjunto.
2. Comece pelos controlos à esquerda: duração da sessão, pessoas por grupo, procura de sessões, preços por nível, horário, energia e investimento. Os números sublinhados são editáveis.
3. Abra cada grupo de pressupostos pelo título e passe o cursor pelo ícone **i** para ler a explicação.
4. Edite os inputs do bar na coluna esquerda, em **Bar e espaço de trabalho**. O arranque simula concessão, com renda e custos retidos ilustrativos; mude para operação própria para testar vendas diretas.
5. Compare EBITDA, caixa e VAL/TIR. Para testar a procura, altere sessões de grupo; na alternativa de operação própria do bar, altere também visitantes externos. Passageiros turísticos não são conversões automáticas.
6. Na aba **IVA e caixa**, escolha se os preços introduzidos são antes ou depois de IVA e teste faturação Citywave e prazo de reembolso. Leia os três gráficos de break-even em **Análise**: variam EBITDA, FCFE do ano 1 e VAL conforme a procura da onda. No modo de sessões, a procura indicada é de pico e a sazonalidade converte-a numa média anual esperada; não é uma agenda diária reservável.

As alterações vivem apenas na sessão do navegador e desaparecem ao recarregar. Partilhe o link do simulador para cada investidor testar os seus próprios cenários; este link não grava nem transmite os valores alterados.

## Como ler as três componentes no Resumo

| Componente | O que inclui | Para que serve |
|---|---|---|
| Onda sem bar | Piscina, sessões de grupo, pessoal e custos da onda | Medir o negócio da piscina isoladamente |
| Bar / trabalhar | Renda e custos do proprietário na concessão; vendas e consumo por visita apenas na operação própria | Testar renda ou exploração direta do bar |
| Conjunto | Receitas e custos da onda e do bar; financiamento e impostos consolidados | Avaliar o projeto que precisaria de financiamento |

Os custos partilhados podem ser repartidos entre onda e bar para análise, mas essa repartição não cria poupança. A TIR e o VAL das componentes são analíticos e **não devem ser somados**. Para o retorno total, use o conjunto.

## Sessões e capacidade: o que o modelo vende?

A Lda. vende lugares em sessões de grupo de 45 ou 60 minutos. Cada pessoa paga o preço do seu nível; a duração é do grupo inteiro, não o tempo individual na onda. O arranque usa 9 sessões de procura de pico por dia, 8 participantes por sessão, 60 minutos, dez horas abertas e 340 dias/ano: cerca de 54.8 participantes públicos por dia aberto em média. A sazonalidade reduz a procura em cada mês; a capacidade limita as vendas ao número inteiro de grupos que cabe no horário. Com 60 minutos e sem intervalo adicional, cabem no máximo dez grupos por dia. O limite editável é de 14 pessoas por grupo, mas a segurança e a rotação têm de ser confirmadas pela Citywave e pela equipa operacional.

Os preços por nível são 49 €/39 €/39 €/35 € para principiantes/intermédios/avançados/crianças no caso-base, com descontos editáveis. O seletor de IVA no topo, em Preços e na aba IVA escolhe se os números introduzidos são antes de IVA ou preços finais; a política comercial ainda está por decidir. Material está incluído para principiantes, intermédios e crianças; avançados podem alugá-lo. Sessões privadas substituem grupos públicos; privadas, aluguer, eventos, cartões e coaching adicional começam desligados no caso-base. Vendas intermediadas geram comissão separada.

## Sessões de grupo: comparação de 45 e 60 minutos

Cada sessão dura 45 ou 60 minutos no total e recebe até 14 pessoas. Não se assume que cada participante usa a onda durante todo esse período: o tempo efetivo varia conforme o nível e a dinâmica do grupo. Com dez horas abertas, sem intervalo entre sessões, cabem até 13 sessões (104 lugares) de 45 minutos ou dez sessões (80 lugares) de 60 minutos com oito participantes por grupo por dia. A procura efetiva é limitada por este teto e ajustada pelos fatores mensais de sazonalidade.

| Sessão de grupo | Máx. sessões/dia | Máx. pessoas/dia | Participantes públicos/ano | Tarifa energia | Energia/ano | Receita da onda | EBITDA conjunto | VAL conjunto | TIR projeto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 min | 13 | 104 | 24 830 | 0.16 €/kWh | 326 400 € | 1 038 085 € | 391 050 € | 63 064 € | 8.70% |
| 60 min | 10 | 80 | 23 090 | 0.16 €/kWh | 326 400 € | 965 307 € | 321 912 € | -338 820 € | 4.98% |

Comparação indicativa do motor, mantendo restantes pressupostos iniciais de preços, procura de pico (12 sessões/dia), energia, custos, bar e financiamento. Os valores de participantes são vendas públicas anuais depois da sazonalidade; capacidade máxima é um teto, não uma previsão de procura. A energia continua calculada pelas horas de funcionamento por dia, por isso encurtar a sessão não reduz automaticamente o custo energético diário. O intervalo entre sessões pode ser editado no simulador e reduz a capacidade disponível.

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
| Break-even EBITDA | Volume médio de participantes necessário para cobrir custos operacionais; não cobre investimento, imposto nem amortização da dívida |
| Break-even FCFE | Volume médio de participantes necessário para FCFE do ano 1 igual a zero, incluindo imposto, dívida e manutenção |
| Break-even VAL | Volume médio de participantes necessário para VAL igual a zero no prazo e taxa de desconto escolhidos |

Um EBITDA positivo pode coexistir com FCFE negativo: amortização da dívida e investimento de manutenção consomem caixa. Uma TIR baixa/negativa ou VAL negativo significa que os fluxos modelados não compensam o capital à taxa de desconto e horizonte escolhidos. Dividendos não são automáticos; a distribuição do modelo é uma regra simplificada, não validação legal nem bancária.

## Energia: a variável que merece um orçamento

O caso inicial usa potência máxima de 600 kW, carga média de 100%, dez horas/dia, 340 dias e tarifa editável de 0,16 €/kWh. A fórmula dá 6.000 kWh/dia e 326 400 €/ano. Cada alteração de 0,01 €/kWh muda o custo anual em 20 400 €, mantendo todo o resto igual. A energia é cobrada durante o horário de operação, mesmo com poucos clientes. A tarifa e carga real não estão confirmadas; acrescentos de bombas auxiliares, bar, potência contratada, tarifas horárias e taxas devem ser obtidos da EEM/fornecedor e da especificação técnica. Não conte o mesmo encargo duas vezes.

## Pressupostos e limites que um investidor deve testar

- **Procura e preços:** não há estudo de mercado que valide conversão, preço, volume ou sazonalidade. O crescimento anual aumenta receita/preços, não cria novos clientes automaticamente.
- **Capacidade e segurança:** o modo de sessões simula grupos de 45 ou 60 minutos, limitados a 14 pessoas; a capacidade segura, rotação e tempo efetivo na onda exigem confirmação operacional. A procura vendida é uma média anual esperada, não reservas confirmadas.
- **Bar:** o arranque simula concessão, com renda e custos do proprietário ilustrativos; operação própria é uma alternativa editável. Valide contrato, investimento e renda negociável.
- **Eletricidade:** tarifa e perfil de carga são hipóteses; o consumo real e o custo contratado podem alterar materialmente o break-even.
- **Imposto e IVA:** IRC e IVA são distintos. O painel IVA modela preço final/bruto, dedutibilidade e uma ponte mensal simplificada; não inclui custo financeiro da espera pelo reembolso no VAL/TIR, nem substitui parecer fiscal.
- **Financiamento:** percentagens e taxa/prazo de dívida são inputs, não ofertas bancárias. O sweat equity é uma ponderação ilustrativa, não acordo societário.
- **Horizonte e saída:** igual ao prazo da concessão, sem perpetuidade; valor residual zero por defeito. A caixa intra-anual, custos de pré-abertura, ramp-up, atrasos e custos de desmantelamento não estão modelados.
- **Consolidação:** uma entidade operacional, custos comuns repartidos analiticamente e impostos do conjunto recalculados. Não some VAL/TIR por componente.

Use este simulador para perguntar “o que teria de ser verdade?” e identificar inputs críticos. Para decisão de investimento, substitua os valores ilustrativos por estudos, especificação/garantias Citywave, orçamentos EEM/obras, plano operacional, propostas de dívida, contratos e revisão fiscal/legal.
