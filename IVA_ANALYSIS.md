# IVA e tesouraria — análise do caso-base

Atualizado em 30/09/2026. Gerado por `node analysis/generate-reports.cjs` a partir do motor do simulador. Receitas e custos operacionais apresentados antes de IVA; o painel IVA separa dedução e tesouraria. Cenários ilustrativos, não previsões nem orçamentos.

## Decisão comercial ainda em aberto

A entidade que compra a máquina e fatura os bilhetes será uma **sociedade comercial (Lda.)**. Os promotores ainda não decidiram se os preços exibidos, como 49 € para principiantes, são antes de IVA ou preços finais. O simulador inicia em **antes de IVA**, por compatibilidade com o modelo histórico, e permite mudar para **preço final com IVA** sem alterar o número introduzido. A 22%, 49 € antes de IVA são 59,78 € pagos pelo cliente; 49 € finais representam 40,16 € de receita antes de IVA. A escolha muda todos os resultados financeiros.

| Sensibilidade sessões de grupo | 49 € antes de IVA | 49 € preço final |
| --- | --- | --- |
| Receita da onda no ano 1 | 818 833 € | 671 174 € |
| EBITDA conjunto no ano 1 | 182 761 € | 42 485 € |
| VAL conjunto | -1 147 663 € | -2 097 361 € |
| TIR do projeto | -3.93% | -20.81% |
| Payback | Não recupera no prazo | Não recupera no prazo |

## Hipótese fiscal da Lda.

O caso-base considera vendas da onda e renda de exploração do bar tributadas à taxa normal de 22% na Madeira, com direito a deduzir integralmente o IVA elegível da respetiva atividade. O IVA dedutível não é custo económico; o não dedutível acresce ao investimento ou aos custos correntes. A isenção de serviços desportivos por certas associações é apenas uma sensibilidade, **não um regime optativo da Lda.** A operação do bar é uma concessão ilustrativa, com 2 500 €/mês de renda antes de IVA e 300 €/mês de custos retidos. Uma mera locação de imóvel pode ter tratamento diferente: confirme o contrato.

## Investimento e reembolso

O investimento Citywave de 1 750 000 € gera 385 000 € de IVA teórico à taxa de 22%. O modelo inicia com **0% deste IVA pago na fatura ao fornecedor**, simulando autoliquidação; é uma hipótese por confirmar pela redação do contrato e local de instalação, não um crédito automático pago pelo Estado. O restante investimento inicia com IVA faturado e dedutível. Neste caso-base, o IVA inicialmente pago em faturas é 73 480 € e o pico de défice de caixa exclusivamente de IVA no primeiro ano é 73 480 €. Esse pico **não é CAPEX adicional**; mostra capital temporariamente empatado. O pedido de reembolso é simulado quando o crédito excede 3 000 €, com três meses de espera editáveis. Datas de faturação, declaração, inspeção, garantias e recebimento podem diferir. O custo de financiar a espera não entra no VAL/TIR.

## Fontes e validação necessária

- [Taxas de IVA na Madeira, ofício 25045/2024](https://at.madeira.gov.pt/ficheiros/Oficio_circulado_25045_2024.pdf).
- [CIVA, artigo 20.º: direito à dedução](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva20.aspx).
- [CIVA, artigo 22.º: crédito e reembolso](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva22.aspx).
- [CIVA, artigo 9.º: isenções](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva9.aspx).
- [RITI, artigo 9.º: bens instalados ou montados](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/RITI_2021/Paginas/riti009.aspx).

Peça parecer escrito a um fiscalista com contrato Citywave, contrato de concessão, faturas previstas, NIFs das entidades e classificação das prestações.
