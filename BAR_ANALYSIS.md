# Citywave + bar com espaço para trabalhar

> **Histórico de cenários anteriores à clarificação do material incluído.**
> Os quadros abaixo usavam clínicas como suplemento e aluguer para intermédios e
> avançados. O modelo atual desativa clínicas por defeito e cobra aluguer opcional
> apenas a avançados. Estes resultados históricos não são os resultados atuais.
> Ver [clarificação e contas corrigidas](MODEL_CLARIFICATIONS.md). O script
> `analysis/operating-scenarios.cjs` usa agora os pressupostos atuais e não reproduz
> os quadros históricos abaixo.


**Cenário ilustrativo, não previsão.** Ainda não existem estimativas próprias para
o bar. Os números abaixo são os defaults editáveis de `src/hospitality.js`, ligados
aos defaults da onda em `src/finance.js`. Não são benchmarks de mercado nem
orçamentos de fornecedores. Valores líquidos de IVA; horizonte de dez anos e
valor residual dos ativos zero. O stock inicial é recuperado no fim.

## O que está a ser analisado

O projeto tem duas atividades económicas: piscina de ondas e bar. O espaço para
trabalhar é uma utilização do bar, sem mensalidades nem aluguer de postos. A receita
é apenas o consumo durante a visita. As vistas permitem comparar a onda sem bar,
as contribuições de cada componente dentro do projeto e o resultado consolidado.

## Hipóteses iniciais do bar

| Hipótese | Cenário de exploração |
|---|---:|
| Lugares totais | 36 |
| Dos quais disponíveis para trabalhar | 10, durante 6 horas/dia |
| Horário e dias de abertura | 12 horas/dia, 340 dias/ano |
| Clientes externos, antes de sazonalidade | 45/dia |
| Consumo por cliente externo | 10,50 € por visita |
| Clientes a trabalhar | 6/dia, 3 horas por visita |
| Consumo de quem trabalha | 12 € por visita inteira |
| Surfistas que consomem no bar | 45%, com consumo médio de 8 € |
| Acompanhantes | 0,5 por surfista; 60% consomem 8 € |
| Participantes assumidos por sessão privada | 6 |
| Equipa adicional do bar | 3 pessoas a 1 250 €/mês, 14 pagamentos + encargos |
| Produtos vendidos | 32% da receita |
| Pagamentos e concessão | 1,5% + 5% da receita |
| Custos fixos exclusivos, incluindo pessoal | 99 769 €/ano |
| Custos comuns imputados | 14 400 €/ano |
| CAPEX do bar, com contingência | 154 000 € |
| Stock inicial | 5 000 € |
| Investimento adicional total | 159 000 € |

O CAPEX inclui obras, equipamentos, mobiliário, Wi-Fi/tomadas, projeto e licenças.
A capacidade limita a procura por horas-lugar; não garante disponibilidade no pico.
Os grupos de clientes são exclusivos: quem vai trabalhar não é contado novamente
como público externo. Os surfistas vêm das vendas efetivas da onda após capacidade.

## Resultados ilustrativos

| Indicador | Onda sem bar | Bar dentro do projeto | Conjunto |
|---|---:|---:|---:|
| Investimento inicial | 2 292 400 € | 159 000 € | 2 451 400 € |
| Receita no ano 1 | 940 771 € | 277 525 € | 1 218 297 € |
| EBITDA no ano 1 | 168 253 € | 56 509 € | 239 162 € |
| TIR do projeto | −4,66% | 28,45% | −0,57% |
| VAL, à taxa comum de 8,14% | −1 209 341 € | +192 507 € | −936 382 € |

A coluna da onda sem bar é o cenário de referência e **não é aditiva** à coluna
do bar depois do rateio. No quadro aditivo de componentes dentro do projeto,
o EBITDA da onda é 182 653 €: 14 400 € de custos existentes passaram a estar
imputados ao bar. Assim, 182 653 € + 56 509 € = 239 162 €.

O ganho real de acrescentar o bar é aproximadamente **70 909 €/ano de EBITDA**,
com 159 000 € de investimento adicional. O VAL incremental é aproximadamente
**+272 960 €**. O bar melhora o conjunto, mas este cenário ainda não permite
recuperar e remunerar adequadamente todo o investimento em dez anos.

A TIR de 28,45% do bar refere-se à sua contribuição com tráfego da onda e custos
imputados. Não significa que um bar isolado, sem a piscina, teria esse retorno.
Também não é a TIR de um investidor externo específico após sweat equity.

## De onde vêm os 277,5 mil euros do bar

| Origem | Receita anual | Parcela aproximada |
|---|---:|---:|
| Surfistas | 66 969 € | 24,1% |
| Acompanhantes | 44 646 € | 16,1% |
| Público externo | 141 431 € | 51,0% |
| Clientes que vão trabalhar | 24 480 € | 8,8% |

Cerca de **40% da receita depende diretamente de surfistas e acompanhantes**.
Retirando esse consumo, mas mantendo os mesmos custos e os outros clientes,
o EBITDA do bar passa de +56 509 € para aproximadamente **−12 133 €/ano**.
O bar tem potencial como complemento da onda neste exemplo; ainda não demonstra
independência comercial.

O ponto de equilíbrio operacional é aproximadamente **185 640 €/ano de receita**,
ou **58 visitas/dia** ao consumo médio e mix atuais. O cenário simula aproximadamente
87 visitas/dia. Este equilíbrio cobre custos operacionais e comuns, não dívida,
impostos ou recuperação do investimento.

## O espaço para trabalhar

Seis clientes por dia a consumir 12 € geram 24 480 €/ano. Com os custos variáveis
assumidos, acrescentam cerca de **15 055 €/ano de margem de contribuição**, antes de
custos fixos específicos. A receita é 4 €/hora-lugar; a margem de contribuição é
2,46 €/hora-lugar. O público externo gera aproximadamente 13,13 € de receita e
8,07 € de margem por hora-lugar com o ticket/permanência assumidos.

Isso não torna a permanência longa necessariamente indesejável. Se ocupa mesas
que estariam vazias, gera margem adicional. Se impede vendas de maior contribuição
em períodos cheios, existe custo de oportunidade. O cenário usa apenas cerca de
20% das horas-lugar totais em média; esta média não estabelece ocupação no almoço,
ao fim da tarde ou em eventos.

## Sensibilidade: não confundir o exemplo com uma previsão

Mantêm-se todos os outros pressupostos, incluindo a onda de seis participantes:

| Alteração isolada | Receita do bar | EBITDA do bar após custos comuns | VAL do conjunto |
|---|---:|---:|---:|
| Exemplo inicial | 277 525 € | 56 509 € | −936 382 € |
| Público externo de referência: 30/dia | 230 382 € | 27 516 € | −1 104 912 € |
| Público externo de referência: 60/dia | 324 669 € | 85 503 € | −767 851 € |
| Conversão de surfistas: 25% | 247 762 € | 38 205 € | −1 042 782 € |
| Sem clientes a trabalhar | 253 045 € | 41 454 € | −1 023 893 € |

Se a onda vender oito participantes por grupo, mantendo a procura de sessões e
todos os pressupostos do bar, o conjunto passa a uma TIR de aproximadamente
**14,34%** e VAL de **+789 009 €**. Isso exige mais participações vendidas na onda,
e não é uma simples melhoria gratuita de capacidade. O bar também recebe mais
visitas nesse cenário, sem voltar a contar bilhetes da onda como receita sua.

## Interpretação e próximos dados

A configuração com bar merece ser estudada: cria uma segunda fonte de margem e
monetiza acompanhantes e permanência no local. Mas os números ilustrativos não
resolvem, por si só, a economia da onda configurada atualmente. A ordem de
validação seria:

1. Área, lotação, condições de ruído e horário utilizável, incluindo o espaço para trabalhar.
2. Orçamento adicional para obras, equipamentos e mobiliário, sem repetir infraestruturas da onda.
3. Oferta de bebidas/comida e margem por produto; depois ticket líquido por visita.
4. Procura externa e conversão real de surfistas/acompanhantes, por faixa horária.
5. Escala de pessoal que cubra o horário e identificação de recursos realmente partilháveis.
6. Renda/concessão e confirmação de quais os custos comuns existentes que o bar aproveita.

O simulador permite mudar cada hipótese sem alterar a referência da onda. Custos
partilhados são reclassificados uma única vez; impostos e dívida do conjunto são
recalculados sobre os valores consolidados. Estes são resultados de cenários,
não uma validação de mercado ou recomendação para comprometer capital.

## Atualização: localização junto ao Teleférico do Funchal

Informação recebida em 22/09/2026: pretende-se implantar o projeto junto à estação
inferior do Teleférico do Funchal, na zona do Jardim do Almirante Reis, conforme
as imagens fornecidas pelo promotor. A imagem mostra a proximidade física;
não mede o percurso efetivo dos peões, a visibilidade da entrada ou a conversão.

O [Diário de Notícias, de 27/05/2026](https://www.dnoticias.pt/2026/5/27/493459-teleferico-do-funchal-investe-45-milhoes/)
reporta cerca de 1,1 milhões de passageiros em 2025, numa notícia com declarações
da administração. É uma referência específica deste teleférico. Não confundir com
as estatísticas agregadas dos vários teleféricos da Madeira. A notícia não define
se o indicador representa pessoas distintas ou utilizações/percursos. Não se deve
multiplicar por dois para contar ida e volta, nem dividir automaticamente por dois.
Também regista uma paragem de três meses em 2026; o fluxo histórico não garante
igual exposição no ano de abertura do projeto.

**Revisão da interpretação:** o bar deve ser estudado como negócio com procura
externa própria, apoiado pela localização e complementado pela onda. Os 40% de
receita ligada à onda no exemplo anterior são resultado dos inputs, não uma
estimativa observada da dependência comercial deste local. Os 45 clientes externos
por dia de referência não incorporavam qualquer contagem pedonal desta localização.

### Sensibilidade à captação do fluxo

Exercício exploratório, mantendo ticket líquido de 10,50 €, 340 dias de abertura,
consumo da onda e clientes a trabalhar do exemplo anterior. A procura externa
anterior é **substituída**, não acrescida. Não se acrescentam separadamente
cruzeiristas, turistas da Zona Velha ou residentes: podem sobrepor-se ao público
contabilizado e ainda não existem estimativas independentes.

Fórmula: visitas anuais externas = 1 100 000 × 340 / 365 × captação efetiva.
A repartição uniforme no calendário é apenas uma simplificação. Não se aplica
novamente a sazonalidade da onda a este total. A captação efetiva é uma relação
entre visitas de consumo e o indicador bruto de passageiros; agrega exposição,
horários, eventual repetição na contagem e conversão. Não é uma taxa medida de
entrada entre peões que passam à porta.

| Captação efetiva ilustrativa | Visitas externas/dia aberto | Receita externa/ano | EBITDA total do bar após custos comuns | VAL do conjunto |
|---|---:|---:|---:|---:|
| 0,5% | 15 | 53 795 € | 2 613 € | −1 249 666 € |
| 1% | 30 | 107 589 € | 35 697 € | −1 057 361 € |
| 2% | 60 | 215 178 € | 101 864 € | −672 749 € |
| 3% | 90 | 322 767 € | 168 031 € | −288 138 € |

Calculado com `calculateProject`, substituindo `externalDaily` por
`1100000 / 365 * captacao / 100` e `seasonalPct` por zero. Os restantes inputs
mantêm os defaults. São sensibilidades, não probabilidades nem previsões.
Os custos e a equipa são constantes: nos cenários de maior procura, é necessário
validar reforços de pessoal e capacidade em períodos de ponta antes de aceitar
estas margens. O VAL mantém dez anos e taxa de desconto de aproximadamente 8,14%.

No cenário de 2%, retirando todo o consumo dos surfistas e acompanhantes mas
mantendo os clientes externos e a trabalhar, o EBITDA do bar é **+33 221 €/ano**.
Logo, a conclusão de perda sem surfistas não é estrutural: muda com a procura
externa. No mesmo cenário, a TIR do conjunto é cerca de 2,10%, ainda inferior à
taxa de desconto; um bar operacionalmente rentável não garante o retorno do
investimento total na piscina.

Sem consumo ligado à onda, e mantendo os 24 480 €/ano de quem trabalha, o bar
precisaria de cerca de **45 visitas externas por dia aberto a 10,50 €** para EBITDA
zero. Isto equivale a aproximadamente 1,50% de captação efetiva no exercício acima.
É um limiar operacional com os custos assumidos, não um ponto de recuperação do
capital investido. Se apenas metade do indicador bruto representar oportunidades
relevantes, a conversão necessária nessa base será aproximadamente o dobro.

A localização passa a ser um fator central da análise. O dado decisivo a recolher
é o fluxo em frente à entrada proposta, por hora e época, e a sua conversão em
consumo. Uma entrada visível e acessível a quem não surfa, lugares com vista para
a onda e serviço adequado ao visitante de passagem são hipóteses comerciais a
validar. A procura do espaço para trabalhar deve manter-se separada, sobretudo
pelo seu maior tempo de ocupação das mesas.

Esta atualização acrescenta cenários ao relatório; não altera automaticamente
os defaults ilustrativos do simulador sem uma escolha de captação suportada.


A análise de participantes, sessões diárias, horários e limiares de retorno está
em [OPERATING_ANALYSIS.md](OPERATING_ANALYSIS.md), com cálculo reproduzível em
`analysis/operating-scenarios.cjs`.
