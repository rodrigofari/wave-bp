# IRC da Lda. — análise do caso-base

Atualizado em 01/10/2026. Gerado por `node analysis/generate-reports.cjs` a partir do motor do simulador. Receitas e custos operacionais apresentados antes de IVA; o painel IVA separa dedução e tesouraria. Cenários ilustrativos, não previsões nem orçamentos.

## IRC e prejuízos fiscais da Lda.

A referência de 2026 na Madeira é 13,3% de IRC geral, ou 10,5% sobre os primeiros 50 000 € de matéria coletável por ano para PME/Small Mid Cap elegíveis, com 13,3% no excedente. A elegibilidade PME é **hipótese a confirmar** após definir capital e empresas associadas. O caso-base assume derrama municipal de 0% como hipótese editável; a taxa aplicável no Funchal para os anos futuros deve ser confirmada. O simulador permite editar cada taxa e o limite anual.

Prejuízos fiscais transitam de ano para ano; em cada ano, só podem abater até 65% do lucro positivo. A derrama introduzida incide sobre lucro positivo antes deste abatimento. O IRC da onda e do bar isolados é analítico; a Lda. paga o imposto do conjunto. O FCFF usa imposto antes da dívida e o FCFE usa imposto após juros. O WACC aplica a taxa marginal geral à dívida como aproximação, pelo que um ano sem lucro pode não realizar esse benefício imediatamente.

No ano 1 do caso-base, o lucro tributável consolidado antes de juros é 33 259 €, o IRC operacional é 3492 €, e o IRC após juros é 0 €. O VAL conjunto com estes pressupostos é -1 106 241 €. Trata-se de aproximação anual: não modela diferenças fiscais de depreciação, tributações autónomas, limitações de juros ou calendário de pagamentos por conta. As taxas de 2026 são mantidas como hipótese nos restantes anos.

Fontes: [Orçamento Regional da Madeira para 2026, art. 19.º](https://at.madeira.gov.pt/Ficheiros/Diplomas/DLR/ORAM2026.pdf) · [CIRC, art. 52.º](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/CIRC_2R/Pages/irc52.aspx) · [Lista AT de derramas municipais do período de 2025](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/instrucoes_administrativas/Documents/Oficio_circulado_20288_2026.pdf).

