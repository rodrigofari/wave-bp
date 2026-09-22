# Clarificação: experiência, material e eletricidade

Atualização de 22/09/2026 após clarificação do promotor.

## Produto e receita

Clínicas significavam coaching adicional especializado. O modelo anterior
assumia 75 € extra para 8% das participações públicas. Esse produto não foi
confirmado pelo promotor e não deve ser confundido com o acompanhamento incluído
na experiência. `clinicPct` passa a zero; continua editável apenas para testar
um serviço adicional real, com custos e capacidade a validar.

Principiantes, intermédios e crianças incluem material no bilhete. Só avançados
usam material próprio e podem alugar opcionalmente. Corrigido o cálculo para
excluir intermédios da receita de aluguer. Mantém-se a hipótese editável de 30%
dos avançados alugarem a 10 €; não é uma venda confirmada. Não foram alterados
os preços de bilhete sem indicação de novos valores comerciais.

Material incluído no preço não significa custo zero. Não existe ainda orçamento
específico e validado de pranchas/fatos, lavagem, desgaste e reposição. Os valores
genéricos de manutenção e investimento não comprovam que estes itens estejam
integralmente cobertos; é necessário discriminá-los sem duplicar custos.

## Energia contabilizada e limitações

O modelo usa a referência de reunião registada no repositório: 600 kW de potência
máxima para a onda de 10 m. Não foi verificada nesta análise uma ficha técnica
final com consumo por modo de funcionamento. A referência de 15 bombas é também
um pressuposto do ficheiro, não uma medição. Removida da interface a afirmação
não comprovada de que principiantes usam necessariamente 50–60% de carga.

600 kW × 100% de carga média × 10 h/dia × 340 dias = 2 040 000 kWh/ano.
Com 0,16 €/kWh: 96 €/hora, 960 €/dia e 326 400 €/ano. A média anual dividida
por doze é 27 200 €/mês, não uma fatura mensal uniforme. O custo está incluído
nos resultados da onda e do conjunto durante todo o horário, mesmo sem vendas.

O preço de 0,16 €/kWh é apenas uma hipótese, não uma tarifa EEM validada para
a instalação. A [ERSE](https://www.erse.pt/atividade/regulacao/tarifas-e-precos-eletricidade)
publica as tarifas; a [estrutura tarifária de 2026](https://www.erse.pt/media/lipjxgih/estrutura-tarif%C3%A1ria-se-2026.pdf)
identifica, para fornecimentos acima de BTN, componentes de potência contratada,
potência em ponta, energia por períodos e energia reativa. A classe de fornecimento
e o perfil da instalação têm de ser confirmados com a EEM.

O cálculo atual não separa esses termos nem garante cobertura de consumos auxiliares,
filtração fora do horário, balneários ou aquecimento, caso exista. O bar tem uma
rubrica própria de energia/água/internet de 900 €/mês, também ilustrativa. O valor
de eletricidade da onda não é um orçamento completo da fatura do complexo.

Sensibilidade à energia, mantendo 2 040 000 kWh/ano e sem acrescentar encargos:
0,12 €/kWh = 244 800 €/ano; 0,16 = 326 400 €; 0,20 = 408 000 €.
Cada 0,01 €/kWh muda o custo anual em 20 400 €. O consumo de pico constante pode
sobrestimar a utilização das bombas, enquanto os termos e auxiliares omitidos
podem subestimar a fatura; não se presume que estes efeitos se compensem.

## Efeito da correção comercial

No cenário de oito participantes por sessão pública, procura de pico de doze
sessões/dia (8,49 vendidas em média), dez horas e bar com captação externa de 2%:

- EBITDA conjunto corrigido: 352 752 €/ano.
- TIR do projeto corrigida: 5,77%, face a 12,61% no cenário anterior.
- VAL corrigido: −276 116 €.

A diferença resulta de retirar as clínicas do cenário base e o aluguer dos
intermédios; não houve redução nem aumento dos 326 400 €/ano de energia.
Continua sem comissões específicas de distribuição turística, rampa de abertura
ou fatura EEM validada. Não representa uma previsão de retorno.
