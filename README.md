# Citywave Funchal — simulador onda + bar

Simulador de cenários; valores ilustrativos não são previsões nem orçamentos.

## Abrir e simular

Na pasta do repositório, executar `python3 -m http.server 8766` e abrir
http://localhost:8766. A página usa React/Babel via CDN, pelo que necessita de internet.

1. A página abre no painel **Onda sem bar**, com indicadores, gráficos e parâmetros à esquerda. Escolher **Bilhetes / entrada flexível** ou **Sessões de grupo** nessa coluna.
2. Alterar os números sublinhados. O separador **Receitas** inclui a configuração detalhada e o break-even do conjunto em modo bilhetes. Em bilhetes, definir procura diária, receita
   líquida média, minutos de onda e intervalo por bilhete. O tempo limita as vendas.
3. Introduzir comissões, material e encargos elétricos adicionais quando conhecidos.
   Zero significa que ainda não foi incluído um custo, não que não exista.
4. Comparar **Conjunto**, **Onda sem bar** e **Bar / trabalhar**. Na vista do bar,
   editar procura externa, lugares, conversão, equipa, investimento e custos comuns.
5. Em **Onda sem bar**, editar CAPEX, pessoal e estrutura de capital. No modo de
   sessões, a aba **Receitas** permite definir preços por nível e grupos.

O modo inicial é bilhetes. Os valores iniciais de oito minutos + um minuto de troca,
com dez horas de abertura, permitem 66 bilhetes/dia. A procura inicial de 70 é
limitada a 66; o aviso não pode ser interpretado como venda de 70 bilhetes.
O tempo de utilização é uma hipótese operacional, não capacidade certificada.

Preços são líquidos de IVA. O preço médio dos bilhetes já inclui descontos;
comissões são custos separados sobre a receita intermediada. Não descontar duas
vezes. O modelo não converte automaticamente preços ao consumidor com IVA.
Em sessões, material incluído exceto avançados; coaching adicional está desativado.
Em bilhetes, privadas, coaching, alugueres, eventos e cartões não geram receita extra.

Os três break-even do conjunto são diferentes: operação (EBITDA zero), caixa do
primeiro ano (imposto, dívida e manutenção incluídos) e investimento (VAL zero).
Quando a capacidade não chega, o simulador apresenta **Não atinge na capacidade atual**.
As alterações ficam na sessão da página; recarregar repõe os valores iniciais.

## Validação e limites

`node --test tests/*.test.cjs`

`node analysis/generate-reports.cjs --check` verifica que todos os relatórios
publicados correspondem ao motor atual. Para regenerar, executar sem `--check`.

Os testes verificam reconciliações, limites de capacidade, custos, dívida, impostos,
caixa, dividendos, TIR, VAL e raízes do break-even. Não comprovam procura, preços de
mercado, orçamento EEM, especificação final da máquina ou conformidade fiscal.
O imposto é simplificado, sem reporte de prejuízos; não há tesouraria mensal, rampa
de abertura, calendário de IVA ou financiamento automático de défices intranuais.
O prazo do empréstimo pode exceder a concessão: o saldo é liquidado na saída.

Os custos de material por participação são uma média; nas privadas, a estimativa
usa o input único de participantes por privada, também usado no bar. Não duplicar reposição corrente
com investimento de manutenção. O material inicial deve constar do orçamento CAPEX.
Custos fixos adicionais da eletricidade entram todos os meses, mesmo com zero dias.

As contas consolidadas assumem uma entidade operacional. As contas por componente
são analíticas e incluem rateio de custos. As TIR não se somam. A taxa de desconto
é comum para comparabilidade; não mede separadamente o risco do bar.

[Convenções financeiras](FINANCIAL_MODEL.md) · [Clarificações](MODEL_CLARIFICATIONS.md)

Os relatórios `BAR_ANALYSIS.md`, `OPERATING_ANALYSIS.md`, `TICKET_BREAKEVEN.md`
e `MODEL_CLARIFICATIONS.md` são gerados automaticamente do motor atual, tal como
`reports.html`, acessível na página através de **Relatórios e pressupostos atuais**.
Cada relatório identifica o cenário e distingue-o do estado inicial da interface.
Os scripts em `analysis/` permitem reproduzir os exercícios.

## Publicação

A branch de publicação é `claude/setup-citywave-simulator-CnaHi`. O workflow
executa testes e verifica os relatórios antes de publicar apenas `index.html`,
`reports.html` e `src/` no GitHub Pages. A branch de trabalho não publica
automaticamente. Após publicar, confirmar o commit no workflow e a versão servida.
