# Procura, capacidade e retorno: Citywave + bar no Funchal

> **Histórico de cenários anteriores à clarificação do material incluído.**
> Os quadros abaixo usavam clínicas como suplemento e aluguer para intermédios e
> avançados. O modelo atual desativa clínicas por defeito e cobra aluguer opcional
> apenas a avançados. Estes resultados históricos não são os resultados atuais.
> Ver [clarificação e contas corrigidas](MODEL_CLARIFICATIONS.md). O script
> `analysis/operating-scenarios.cjs` usa agora os pressupostos atuais e não reproduz
> os quadros históricos abaixo.


Análise de cenários de 22/09/2026. Reproduzir com
`node analysis/operating-scenarios.cjs`. Não altera os defaults do simulador.

## Conclusão

Com os preços e custos atuais, aumentar a média de participantes pagantes por
sessão de seis para oito ou dez é mais eficaz do que acrescentar horas sem procura.
Uma hipótese de trabalho é oferecer grupos até dez participantes e testar uma
média de oito lugares vendidos. A capacidade segura, qualidade e equipa necessária
para a configuração local precisam de confirmação; a largura de dez metros não
significa dez surfistas simultâneos.

Para o conjunto atingir VAL zero, o cenário de oito participantes precisa de
7,77 sessões vendidas por dia, em média anual. Para uma TIR de 12%, precisa de 8,39.
Ambos assumem cerca de 60 visitas externas/dia ao bar, além do consumo dos
surfistas, acompanhantes e clientes a trabalhar, e as receitas acessórias atuais.
Sem receitas de clínicas, os mesmos limiares sobem para 8,73 e 9,42 sessões/dia.
São metas comerciais exigentes, não uma previsão derivada do movimento pedonal.

## Evidência e pressupostos

- Localização pretendida junto ao Teleférico do Funchal/Jardim do Almirante Reis,
  segundo o promotor e imagens fornecidas. Não existe contagem validada de peões
  à porta ou de conversão em surf/bar.
- Cerca de 1,1 milhões de passageiros em 2025, segundo notícia com declarações da
  administração: [Diário de Notícias, 27/05/2026](https://www.dnoticias.pt/2026/5/27/493459-teleferico-do-funchal-investe-45-milhoes/).
  Definição de pessoa única versus percurso não esclarecida. A referência é
  histórica; a notícia refere uma paragem de três meses em 2026.
- Não somamos passageiros de cruzeiros, turistas da Zona Velha, residentes e
  passageiros do teleférico: há sobreposição desconhecida. Os estabelecimentos
  vizinhos são também concorrentes pela despesa e tempo dos visitantes.
- Referências operacionais primárias: [Citywave Viena](https://www.city-wave.at/faqs/)
  anuncia até 12 pessoas por sessão de aproximadamente 60 minutos; [Citywave Tokyo](https://citywave-tokyo.jp/english/)
  anuncia 12 principiantes/crianças e 10 intermédios/avançados, com 60 minutos para
  grupos a partir de quatro pessoas. São referências de outras operações, não
  certificação da capacidade ou procura no Funchal.
- Investimento conjunto: 2 451 400 €. Horizonte: dez anos. Taxa de desconto:
  8,14025%. Valor residual dos ativos: zero; recuperação do stock inicial no fim.
- TIR de 12% usada como objetivo ilustrativo de comparação, não como meta aprovada
  pelo promotor nem retorno garantido. Retornos do projeto antes do financiamento;
  não representam a TIR individual de um investidor após sweat equity.
- Onda: 340 dias, energia de 600 kW a 100% de carga e 0,16 €/kWh, salários/equipa
  atuais, crescimento de preços de 3% e custos fixos de 2%. Sem rampa inicial.
- Preço público médio líquido após descontos: 41,807 €/participação. Mantêm-se
  suplementos de clínicas de 75 € para 8% das participações públicas, aluguer,
  eventos e cartões. As clínicas são suplementos, não sessões adicionais gratuitas.
- Privadas ocupam 5% das sessões, a 250 €/grupo e seis visitantes por privada no
  bar. Participantes públicos médios não se aplicam automaticamente às privadas.
- Bar: 36 lugares, três pessoas adicionais, custos do cenário ilustrativo anterior.
  Referência central: 1 100 000 / 365 × 2% = 60,27 visitas externas/dia aberto,
  a 10,50 € líquidos. A procura externa anterior é substituída, não somada.
  A taxa efetiva de 2% é hipotética; não é uma conversão pedonal medida.
  Mantêm-se seis clientes a trabalhar/dia a 12 €/visita.

## Capacidade e vendas são coisas distintas

Capacidade diária = piso[horas abertas × 60 / (minutos de sessão + intervalo)].

| Formato | Horário | Máximo de sessões/dia |
|---|---:|---:|
| 60 minutos, troca sem intervalo adicional | 10 h | 10 |
| 60 minutos + 10 minutos de intervalo | 10 h | 8 |
| 45 minutos + 5 minutos de intervalo | 10 h | 12 |
| 60 minutos, troca sem intervalo adicional | 12 h | 12 |

O intervalo zero pressupõe check-in/briefing antecipados e transição operacional
compatível. Dez sessões de 60 minutos não deixam uma pausa adicional na onda.
Encurtar sessões pode alterar preço, satisfação e procura: os retornos abaixo
usam 60 minutos; não se presume que 45 minutos vendam ao mesmo preço.

No motor atual, `sessionsDay` representa procura diária no pico, antes de aplicar
sazonalidade e capacidade. Com dez slots e procura de pico de 10/12/14 sessões,
as vendas médias anuais são 7,61/8,49/9,12 sessões por dia. As sessões médias
incluem públicas e privadas. Frações representam médias, não horários fracionários.
O modelo cobra energia durante todas as horas de funcionamento, incluindo slots
não vendidos. Uma programação sazonal precisa de um orçamento mensal próprio.

## Resultado a dez horas/dia e 2% de captação externa do bar

| Média de pagantes por sessão pública | Sessões vendidas/dia (média anual) | Participações públicas/dia | EBITDA conjunto ano 1 | TIR do projeto | VAL |
|---|---:|---:|---:|---:|---:|
| 6 | 7,61 | 43,4 | 130 244 € | −8,34% | −1 588 374 € |
| 6 | 9,12 | 52,0 | 284 517 € | 2,10% | −672 749 € |
| 8 | 7,61 | 57,8 | 377 874 € | 7,04% | −130 091 € |
| 8 | 8,49 | 64,5 | 496 537 € | 12,61% | +559 663 € |
| 8 | 9,12 | 69,3 | 581 347 € | 16,27% | +1 052 641 € |
| 10 | 7,61 | 72,3 | 625 504 € | 18,09% | +1 309 311 € |

Oito participantes × 8,49 sessões × 95% de sessões públicas = 64,5 participações
públicas/dia, cerca de 21 935/ano. Somam-se aproximadamente 2,55 participantes/dia
em privadas, assumindo seis por grupo. São participações vendidas, não clientes
únicos: um residente pode voltar várias vezes. Neste cenário o payback simples
do projeto, após imposto operacional e manutenção, é aproximadamente 5,84 anos.
Não é o prazo de recebimento de dividendos de um investidor.

Mesmo com dez sessões vendidas todos os dias e seis participantes por sessão
pública, o VAL permanece cerca de −150 mil € e a TIR em 6,87% neste cenário de bar.
O problema não se resolve apenas preenchendo a agenda com grupos de seis.

## Limiar de retorno e efeito do movimento no bar

Sessões vendidas/dia necessárias para VAL zero, mantendo dez slots/dia:

| Clientes externos do bar/dia | Com 6 participantes | Com 8 participantes | Com 10 participantes |
|---|---:|---:|---:|
| 30,1 (captação efetiva 1%) | Não atinge | 8,27 | 6,66 |
| 60,3 (2%) | Não atinge | 7,77 | 6,26 |
| 90,4 (3%) | 9,60 | 7,28 | 5,86 |

Com 60,3 clientes externos/dia, a TIR de 12% exige aproximadamente 8,39 sessões
com oito participantes, ou 6,75 com dez. Mantêm-se receitas acessórias e preços.
O bar ajuda, mas a quantidade de surf vendido continua a determinar grande parte
da viabilidade. O limiar central de VAL zero corresponde a cerca de 59
participações públicas/dia, além de privadas.

## Otimização operacional e comercial

1. **Preencher grupos antes de prolongar o horário.** Abrir dez lugares e vender
   oito em média corresponde a 80% de ocupação dos lugares nas sessões públicas
   realizadas. Isso é distinto da percentagem de horários vendidos. Se houver
   8,49 sessões/dia, a ocupação de slots é 84,9%; combinada com oito lugares em dez,
   resulta em cerca de 67,9% dos lugares de referência, incluindo horários privados.
   Nem todos os grupos têm de ter o mesmo tamanho: segmentar níveis e preservar
   uma experiência vendável é mais importante do que maximizar o número no papel.
2. **Horário condicionado por reservas.** Com procura de pico de dez sessões,
   aumentar de dez para doze horas não gera vendas adicionais no modelo e custa
   mais 65 280 €/ano de energia. Com procura de pico de doze, os resultados são:

   | Horas/dia | Sessões vendidas/dia | EBITDA conjunto | TIR |
   |---|---:|---:|---:|
   | 8 | 7,48 | 426 009 € | 9,26% |
   | 9 | 8,07 | 472 557 € | 11,48% |
   | 10 | 8,49 | 496 537 € | 12,61% |
   | 11 | 8,88 | 516 002 € | 13,52% |
   | 12 | 9,13 | 517 413 € | 13,63% |

   A 12.ª hora acrescenta apenas 1 411 €/ano de EBITDA antes de qualquer reforço
   de pessoal. Não suporta uma extensão generalizada sem confirmar o custo da
   escala. O modelo não acrescenta automaticamente funcionários ao prolongar
   o horário. A tabela mantém procura fixa e não é uma previsão de disponibilidade
   dos clientes para mudar de hora. Agrupar horários em dias fracos e estender
   nos picos é uma hipótese a testar com reservas e restrições de equipa.
3. **Rever preço das privadas nos horários fortes.** Oito bilhetes públicos
   líquidos representam 334,46 € antes de suplementos/aluguer. Uma privada de
   250 € ocupa o mesmo slot. Subir para 400 € no cenário de 7,61 sessões/dia gera
   +18 429 €/ano de EBITDA se todas as privadas continuarem a vender: TIR passa
   de 7,04% para 7,95%. É sensibilidade de preço, não evidência de aceitação.
   Fora de ponta, uma privada pode preencher um slot que ficaria vazio.
4. **Medir consumo real por configuração.** Reduzir a carga média de 100% para
   80%, mantendo qualidade e vendas, pouparia 65 280 €/ano e elevaria a TIR do
   cenário de 7,61 sessões/dia de 7,04% para 10,07%. É uma hipótese técnica a
   validar com a Citywave; não se assume que a redução seja viável ou gratuita.
5. **Bar orientado também para quem não surfa.** Entrada visível e acessível,
   oferta que sirva visitas curtas e vista para a onda podem ajudar a captar
   passagem. Validar contagens/conversão separadamente de surf. Lugares usados
   para trabalhar devem ser geridos em função dos picos, mantendo consumo por
   visita e sem inventar receita de mensalidades.

## Dependências que mudam a decisão

O suplemento de clínicas de 75 € para 8% dos participantes acrescenta em média
6 € por participação pública. No cenário de oito participantes e 7,61 sessões,
retirá-lo reduz o EBITDA em 112 047 €/ano e a TIR de 7,04% para 1,03%.
No cenário de 8,49 sessões, a TIR passa de 12,61% para 6,72%.
É necessário provar a venda deste suplemento e os seus custos/tempo; não deve
ser contado novamente se já fizer parte do preço da sessão.

Sem receitas de clínicas, os limiares com 60,3 clientes externos/dia são:

| Média de participantes | Sessões/dia para VAL zero | Sessões/dia para TIR de 12% |
|---|---:|---:|
| 8 | 8,73 | 9,42 |
| 10 | 7,03 | 7,59 |

Uma quarta pessoa no bar custa aproximadamente 21 656 €/ano nos pressupostos
salariais atuais. No cenário de oito participantes e 7,61 sessões, a combinação
mais adversa de apenas 1% de captação externa, ausência de clínicas e uma quarta
pessoa no bar leva a uma TIR de −4,51%. Não somar ganhos das otimizações sem
recalcular impostos, procura e capacidade do cenário conjunto.

## Próxima decisão

Usar como hipóteses de validação: grupos até dez com média de oito vendidos;
agendamento de 8–10 sessões de 60 minutos em 8–10 horas diárias;
extensão apenas onde as reservas pagam
a energia e a escala; e bar com 30/60/90 visitas externas diárias como sensibilidades.
O caso central de retorno depende de demonstrar aproximadamente 65 participações
públicas e 60 clientes externos de bar por dia aberto. Sem clínicas, a meta para
12% sobe para cerca de 72 participações públicas/dia.

Recolher fluxo pedonal em frente à entrada, conversão em reservas/consumo,
reservas por nível e hora, repetição dos residentes, cancelamentos, custo elétrico
por configuração e orçamento de equipa por escala. Converter movimento turístico
em sessões de surf exige disponibilidade de tempo, vontade de participar e
check-in/equipamento; uma venda de café não prova procura para surf.
