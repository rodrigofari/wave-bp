# Citywave Funchal — simulador de sessões de grupo

O projeto combina uma piscina de ondas Citywave com um bar em concessão ilustrativa. O simulador é um exercício de planeamento editável para investidores; não é uma previsão de procura nem um orçamento aprovado.

## Abrir e simular

Na pasta do repositório, executar `python3 -m http.server 8766` e abrir http://localhost:8766. A página usa React/Babel via CDN e requer internet.

A onda vende **lugares em sessões de grupo** de 45 ou 60 minutos. Cada participante paga o preço do seu nível; o tempo de sessão é do grupo, e não tempo individual na onda. O cenário inicial é o **realista de referência**: nove sessões de procura de pico por dia, oito participantes por sessão, 60 minutos, 340 dias/ano e bar em concessão. Após sazonalidade, são cerca de 55 participantes públicos por dia aberto em média. O horário limita o número de sessões vendidas. O teto editável é 14 participantes por grupo, ainda sujeito a validação operacional e de segurança. Privadas, clínicas, aluguer, eventos e cartões começam a zero para que a receita-base da onda venha apenas dos lugares vendidos; continuam editáveis.

O simulador apresenta **uma única vista do projeto completo**. A coluna esquerda reúne os pressupostos da onda, bar, energia, investimento, financiamento e IVA. As abas Resumo, Receitas, Custos e CAPEX, IVA e caixa, Investidores, P&L e Análise mostram sempre os valores consolidados da Lda.; a tabela do Resumo identifica separadamente as contribuições da onda e do bar. Os três cenários no topo aplicam conjuntos completos de pressupostos pessimistas, realistas ou otimistas. Os gráficos de break-even na aba Análise variam a procura de sessões e mostram EBITDA, FCFE do ano 1 e VAL. São limiares do modelo, não reservas garantidas.

No topo, na secção de preços e na aba **IVA e caixa**, assinale se os preços introduzidos são **preços finais com IVA**; desmarcado significa valores **antes de IVA**. O número introduzido mantém-se e todo o modelo recalcula: receitas líquidas, EBITDA, fluxos, VAL, gráficos e cenários. A política comercial ainda está por decidir; o arranque mantém os valores antes de IVA. À taxa normal de 22% na Madeira, uma sessão de principiante de 49 € antes de IVA custa 59,78 € ao cliente; se 49 € for o preço final, a receita antes de IVA é 40,16 €. Há um seletor separado para a renda da concessão ou para os consumos do bar. A aba também permite testar IVA dedutível, faturação/autoliquidação da máquina, pedido de reembolso e caixa empatada no primeiro ano. O custo financeiro da espera pelo reembolso não entra no VAL/TIR.

O bar inicia em concessão: a Lda. recebe renda e suporta apenas custos retidos; vendas, salários e stock do operador ficam fora das suas contas. Também é possível testar exploração direta nos controlos à esquerda. O espaço para trabalhar não vende lugares nem mensalidades. A renda de 2 500 €/mês e os custos retidos de 300 €/mês são hipóteses, não propostas.

Edite energia, investimento, financiamento e prazo da concessão. Os zeros em comissões, material ou consumos auxiliares significam que ainda não há orçamento introduzido. A potência de 600 kW é máxima e a carga média de 100% é hipótese conservadora, não medição. As alterações ficam apenas na sessão do navegador e não são guardadas no link partilhado. O seletor PT/EN e o modo escuro mantêm os cálculos iguais.

## Validação e limites

Execute `node --test tests/*.test.cjs` e `node analysis/generate-reports.cjs --check`. Os relatórios são gerados pelo mesmo motor, mas são cenários fixos; não refletem edições locais no navegador. O modelo reconcilia receitas, custos, dívida, impostos, fluxos, retornos e caixa de IVA, mas não valida procura, preços de mercado, capacidade segura, contratos, tarifa elétrica ou enquadramento fiscal. A ponte mensal de IVA cobre apenas o primeiro ano; a tesouraria operacional completa e o custo de financiar atrasos de reembolso não estão modelados.

[Guia do investidor em português](INVESTOR_GUIDE_PT.md) · [Investor guide in English](INVESTOR_GUIDE_EN.md) · [Análise do IVA](IVA_ANALYSIS.md) · [Convenções financeiras](FINANCIAL_MODEL.md) · [Relatórios online](reports.html)

## Publicação

A branch de publicação é `claude/setup-citywave-simulator-CnaHi`. O workflow testa o motor e os relatórios antes de publicar `index.html`, `reports.html`, `investor-guide.html` e `src/` no GitHub Pages.
