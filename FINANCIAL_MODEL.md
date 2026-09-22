# Convenções e correções do simulador

O motor único está em `src/finance.js`, usado pelo browser e pelos testes.
Executar os testes: `node --test tests/finance.test.cjs`.

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
