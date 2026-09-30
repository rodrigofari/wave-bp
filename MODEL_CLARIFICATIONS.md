# Pressupostos comerciais e energia — versão atual

Atualizado em 01/10/2026. Gerado por `node analysis/generate-reports.cjs` a partir do motor do simulador. Receitas e custos operacionais apresentados antes de IVA; o painel IVA separa dedução e tesouraria. Cenários ilustrativos, não previsões nem orçamentos.

## Experiência e material

Clínicas significam coaching especializado adicional e estão desativadas por defeito. Privadas, aluguer avançado, eventos e cartões também começam a zero no caso-base apresentado a investidores. O acompanhamento incluído na experiência não pode ser vendido novamente como suplemento. Material incluído em principiantes, intermédios e crianças; apenas avançados têm aluguer opcional. Preços de sessões: 49 €/39 €/39 €/35 €, interpretados por defeito como antes de IVA, pois o preço final ainda está por decidir, com descontos configuráveis. Cada sessão é cobrada por participante segundo o seu nível; descontos e vendas intermediadas são modelados separadamente.

O custo unitário de material é editável e inicia a zero por falta de orçamento. Lavagem/reposição corrente devem ser distinguidas do investimento inicial e da manutenção capitalizada. Participantes por privada são um único input usado no material e no bar.

## Energia

Referência de reunião registada no repositório: potência máxima de 600 kW para 10 m. Com carga de 100%, dez horas/dia, 340 dias e 0,16 €/kWh, o custo da onda é **326 400 €/ano** para **2 040 000 kWh/ano**. Cada 0,01 €/kWh altera o custo em 20 400 €/ano. O custo mantém-se durante o horário sem vendas.

A referência não substitui uma ficha técnica final. A tarifa de 0,16 €/kWh não é orçamento da EEM. Há campo adicional para potência e consumos auxiliares; não duplicar esses encargos se já estiverem num preço integral por kWh. O bar tem uma rubrica própria de consumos. [ERSE: estrutura tarifária 2026](https://www.erse.pt/media/lipjxgih/estrutura-tarif%C3%A1ria-se-2026.pdf).

## Coerência do simulador único

O resumo, receitas, custos, IVA, investidores, P&L e análise usam sempre o mesmo projeto conjunto. A tabela do resumo separa analiticamente onda e bar, com custos comuns imputados, enquanto imposto e VAL do conjunto são recalculados numa só entidade. Os relatórios são cenários fixos gerados do mesmo motor; não acompanham edições locais até serem regenerados.

A tarifa EEM, o perfil real de consumo da máquina, os orçamentos e a procura não estão validados. Comissões, custo unitário de material e encargos elétricos adicionais iniciam a zero: isso não comprova ausência de custo. Sem rampa de abertura ou calendário completo de tesouraria; o painel IVA mostra uma ponte mensal simplificada apenas no primeiro ano. O IRC inclui reporte simplificado de prejuízos, sujeito a qualificação PME e confirmação das taxas do ano aplicável. Prazo de dez anos nos cenários abaixo, sem valor residual dos ativos; na alternativa de operação própria recupera-se o stock inicial. A TIR é do projeto, não de um sócio após sweat equity.
