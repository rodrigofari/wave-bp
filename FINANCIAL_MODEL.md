# Convenções e correções do simulador

O motor único está em `src/finance.js`, usado pelo browser e pelos testes.
Executar os testes: `node --test tests/*.test.cjs`.

## Operação e receitas

- Os dias de operação são distribuídos por mês pelo método dos maiores restos.
  São dias inteiros e a soma coincide exatamente com o input anual.
- Capacidade diária = parte inteira de horas × 60 / (duração + intervalo).
- O input de sessões representa **procura diária de pico**, antes da sazonalidade.
  Em cada mês, as vendas são o menor entre procura sazonal e capacidade.
  A interface avisa quando limita vendas. A sazonalidade não encurta o horário.
- Privadas substituem sessões públicas. Participantes públicos = sessões públicas
  × pessoas por grupo; os extras por pessoa incidem apenas nesses participantes.
- O preço de clinic é um suplemento ao bilhete. Eventos e cartões são receitas
  acessórias sem sessões incluídas; eventos exclusivos devem entrar como privadas.
- O mix é normalizado como pesos; a interface avisa se não somar 100%. Um mix
  vazio ou um financiamento que não feche impede apresentar retornos válidos.
- Todos os preços e custos são líquidos de IVA. Não se presume uma taxa fiscal
  legal: a taxa efetiva é um pressuposto editável.
- As categorias, os meses e os totais derivam dos mesmos registos, sem
  arredondamentos financeiros intermédios. Arredondamentos são de apresentação.

## Custos e projeção

A projeção tem exatamente os anos da concessão. O P&L, DCF e sensibilidades usam
as mesmas fórmulas. O crescimento é composto; a receita cresce por preço/receita
por participante, mantendo o volume constante. A concessão e a comissão de gestão
incidem na receita de cada ano. A gestão é custo operacional no EBITDA.

Energia = potência × carga × horas × dias × tarifa, em todos os meses. Custos
fixos e energia crescem à taxa de custos configurada. As sensibilidades de receita
alteram preços/receita por participante, não o volume: não reduzem automaticamente
o consumo nem o marketing. Esta convenção é igual nas duas tabelas.

O investimento de manutenção ocorre desde o primeiro ano, a uma percentagem do
CAPEX inicial, constante em euros. A depreciação inicial termina na vida útil
configurada; cada investimento de manutenção é depreciado pela mesma vida útil,
a partir do ano seguinte. Não se deve confundir manutenção operacional e compras
de ativos: os inputs devem abranger despesas diferentes.

## Dívida, impostos e distribuição

A dívida é amortizada mensalmente, incluindo juros e capital separados, e agregada
por ano. A prestação cessa no vencimento; o saldo efetivo é deduzido na saída.
A taxa zero continua a amortizar capital.

- EBIT = EBITDA − depreciação.
- Imposto operacional = máximo(0, EBIT × taxa).
- Imposto do acionista/empresa alavancada = máximo(0, (EBIT − juros) × taxa).
- FCFF = EBITDA − imposto operacional − investimento de manutenção.
- FCFE = EBITDA − imposto após juros − investimento de manutenção − juros − capital pago.

Os impostos são simplificados: sem reporte fiscal de prejuízos ou limites à
dedução de juros. A diferença entre impostos operacionais e impostos após juros
representa o benefício fiscal efetivamente utilizável neste modelo.

Dividendos = menor entre a percentagem configurada do FCFE positivo e resultados
acumulados positivos disponíveis antes da distribuição. É um limite económico e
contabilístico simplificado, não uma determinação de dividendos legalmente
permitidos: reservas legais e contratos de financiamento não são modelados.

Défices anuais consomem primeiro caixa retida; o remanescente é uma chamada de
capital, proporcional à participação. Caixa retida não ganha juros. Não se presume
financiamento gratuito: chamadas de capital são fluxos negativos dos acionistas.

## Avaliação e retornos

Não há perpetuidade automática. O input de venda residual é o recebimento líquido
de impostos e custos de saída no fim da concessão, zero por defeito. Pode ser
negativo se os custos de desmantelamento excederem a recuperação dos ativos.

O VAL do projeto desconta FCFF e venda residual ao WACC e deduz o CAPEX inicial.
O WACC é uma taxa de desconto constante assumida, calculada com os pesos iniciais
D/E; não é uma valorização dinâmica da vantagem fiscal da dívida amortizável.

Os fluxos dos acionistas incluem investimento inicial, dividendos, chamadas de
capital e, no fim, venda residual + caixa acumulada − dívida pendente. Um saldo de
saída negativo é mais capital necessário. Remuneração de gestão não é retorno do
capital e fica separada nos quadros dos fundadores.

A TIR só é apresentada quando o investimento inicial é negativo, existe retorno
positivo e há uma única mudança de sinal. A raiz é verificada numericamente.
Fluxos não convencionais, com potencial ambiguidade, apresentam TIR indisponível.
O múltiplo é recebimentos positivos / entradas de capital (incluindo reforços),
não `(1 + TIR)^anos`. Payback usa fluxos acumulados, com interpolação anual,
excluindo a venda final. Sem recuperação dentro da concessão, é indisponível.

O sweat equity preserva os pesos do acordo anterior: não foi reinterpretado como
uma percentagem final da empresa. O peso é normalizado com os pesos de capital
próprio e a percentagem final é mostrada. A taxa agregada dos acionistas não deve
ser confundida com o retorno de cada sócio, pois o sweat altera essa distribuição.

Removeram-se o Sharpe com volatilidade arbitrária, os comparáveis históricos não
verificados e a capitalização da TIR como se fosse um rendimento garantido. As
alternativas apresentadas estão identificadas como taxas ilustrativas.

## Limites que continuam explícitos

Sem IVA em tesouraria, variações de fundo de maneio, pré-abertura, impostos pessoais
ou saldo de caixa mensal. Os reforços anuais não medem necessidades de financiamento
dentro do ano. Não há validação externa de procura, preços, consumo, custos,
capacidades físicas ou fiscalidade. Estes continuam a ser pressupostos do utilizador.


## Bar, espaço para trabalhar e consolidação

`src/hospitality.js` acrescenta três perspetivas sem alterar a referência da onda:

- **Onda sem bar:** o modelo existente, com os seus custos originais.
- **Bar / trabalhar:** contribuição do bar dentro do projeto, depois de imputação
  dos custos comuns. Sem passes de cowork ou mensalidades.
- **Conjunto:** receitas, ativos e custos de ambas as operações; impostos,
  financiamento e distribuições recalculados como uma única entidade.

Todos os inputs iniciais do bar são **ilustrativos e não validados**, conforme a
indicação do utilizador de que ainda não existem estimativas. A análise narrativa
inicial está em `BAR_ANALYSIS.md` e deve ser recalculada se os inputs mudarem.

As visitas do bar pertencem a quatro grupos disjuntos: surfistas, acompanhantes,
público externo e pessoas que vão trabalhar. As duas primeiras origens dependem
das participações vendidas pela onda (incluindo uma dimensão assumida para grupos
privados), da conversão em consumo e da coincidência dos horários/dias de abertura.
Não se presume que toda a participação seja um cliente único nem que gere consumo.

A contagem externa é uma referência diária antes da sazonalidade editável. Os
clientes a trabalhar têm procura diária uniforme. O ticket representa consumo
líquido de IVA por visita inteira; aumentar a permanência não aumenta automaticamente
a receita. O consumo pago em pacotes da onda deve ser excluído para não se contar
novamente no bar.

Os lugares de trabalho estão incluídos nos lugares do bar. As horas-lugar de
trabalho são limitadas pelos lugares, horário e permanência; o restante consumo é
limitado proporcionalmente pelas horas-lugar restantes. Trata-se de capacidade
agregada mensal, não de garantia de disponibilidade em horas de ponta. O modelo
não simula filas, reservas, intervalos de limpeza nem turnos do pessoal.

Os custos exclusivos do bar incluem produtos vendidos, pagamentos, concessão,
gestão, equipa adicional, renda, consumos, seguros e outros. CMVMC e comissões
acompanham a receita; custos fixos crescem à sua taxa própria. Pessoal tem 14
pagamentos e os encargos patronais configurados na onda. O stock inicial é fundo
de maneio constante, financiado na abertura e recuperado pelo valor contabilístico
no fim; não é CAPEX depreciável nem uma segunda despesa de produtos vendidos.

Os custos comuns existentes são as parcelas selecionadas de contabilidade,
marketing e diversos da onda. A parte imputada ao bar é retirada da onda no
quadro de componentes. Não se adiciona o pool outra vez. Só a rubrica de custos
comuns adicionais aumenta o OPEX do conjunto. Alterar a quota de imputação nunca
altera o EBITDA, VAL ou TIR consolidados. Não se presume poupança de pessoal nem
receita adicional da onda pela existência do bar.

A diferença entre conjunto e onda sem bar mede o investimento e cash flow
incrementais reais. A TIR e o VAL de cada componente não devem ser somados: os
impostos separados são imputações analíticas e o imposto agregado incide no EBIT
agregado. O simulador mostra a reconciliação do imposto operacional. A taxa de
desconto, prazo, estrutura financeira, imposto e payout comuns são os da onda,
como convenção comparativa, não uma calibração do risco específico do bar.

O cenário “sem consumo da onda” retira surfistas e acompanhantes, mantendo os
custos e as outras origens de procura. Não é uma previsão de operação autónoma
noutro local: não recalcula renda, marketing ou equipa para essa hipótese. Pode
libertar lugares para procura externa previamente limitada pela capacidade.

O ponto de equilíbrio do bar usa receita × margem de contribuição = custos fixos
exclusivos + imputação dos custos comuns. É equilíbrio EBITDA; não inclui impostos,
dívida nem recuperação do investimento. As visitas necessárias usam o mix e o
consumo médio simulados, sem presumir que essa procura possa ser captada.

## Clarificação comercial de 22/09/2026

Material incluído nos bilhetes, exceto avançados: aluguer opcional aplica-se apenas
à proporção de avançados. Coaching extra (`clinicPct`) desativado por defeito.
O preço elétrico é hipótese não validada pela EEM; não separa potência, períodos
horários nem consumos auxiliares. Ver `MODEL_CLARIFICATIONS.md` para limitações
e impacto nos cenários anteriores.

## Simulação interativa de bilhetes (23/09/2026)

`salesMode=tickets` usa procura uniforme por dia aberto e preço médio líquido
após descontos; não aplica sazonalidade de sessões nem receitas acessórias.
Vendas/dia = mínimo(procura, piso(horas × 60 / (minutos + troca))). Não presume
utilizações simultâneas. Capacidade por minutos é um pressuposto editável.

Comissões = receita da onda × percentagem intermediada × taxa de comissão;
material corrente = participações × custo unitário. As comissões acompanham a
receita projetada; custo unitário de material e encargos elétricos adicionais
acompanham inflação de custos. Energia da onda é cobrada por todo o horário.
Na sensibilidade a preço/receita, o volume e custo de material mantêm-se constantes.

`ticketBreakEven` recalcula o conjunto para procurar EBITDA zero, FCFE do ano 1
zero e VAL zero dentro da capacidade diária. Um limiar fora da capacidade retorna
indisponível. Financiamento inválido ou local incompatível desativa os limiares.
Partilha de custos não melhora artificialmente o resultado total.
