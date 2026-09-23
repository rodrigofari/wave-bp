# Pressupostos comerciais e energia — versão atual

Atualizado em 24/09/2026. Gerado por `node analysis/generate-reports.cjs` a partir do motor do simulador. Valores líquidos de IVA. Cenários ilustrativos, não previsões nem orçamentos.

## Experiência e material

Clínicas significam coaching especializado adicional e estão desativadas por defeito. O acompanhamento incluído na experiência não pode ser vendido novamente como suplemento. Material incluído em principiantes, intermédios e crianças; apenas avançados têm aluguer opcional. Preços de sessões: 49 €/39 €/39 €/35 €, líquidos de IVA, com descontos configuráveis. Preço médio de bilhetes flexíveis é um input independente já após descontos.

O custo unitário de material é editável e inicia a zero por falta de orçamento. Lavagem/reposição corrente devem ser distinguidas do investimento inicial e da manutenção capitalizada. Participantes por privada são um único input usado no material e no bar.

## Energia

Referência de reunião registada no repositório: potência máxima de 600 kW para 10 m. Com carga de 100%, dez horas/dia, 340 dias e 0,16 €/kWh, o custo da onda é **326 400 €/ano** para **2 040 000 kWh/ano**. Cada 0,01 €/kWh altera o custo em 20 400 €/ano. O custo mantém-se durante o horário sem vendas.

A referência não substitui uma ficha técnica final. A tarifa de 0,16 €/kWh não é orçamento da EEM. Há campo adicional para potência e consumos auxiliares; não duplicar esses encargos se já estiverem num preço integral por kWh. O bar tem uma rubrica própria de consumos. [ERSE: estrutura tarifária 2026](https://www.erse.pt/media/lipjxgih/estrutura-tarif%C3%A1ria-se-2026.pdf).

## Coerência das vistas

Conjunto agrega onda e bar como uma entidade. Onda sem bar, incluindo os seus separadores Investidores, P&L e Análise, refere-se apenas à piscina. Bar mostra a contribuição com custos comuns imputados. Os relatórios são cenários fixos gerados do mesmo motor; não acompanham edições locais até serem regenerados.

A tarifa EEM, o perfil real de consumo da máquina, os orçamentos e a procura não estão validados. Comissões, custo unitário de material e encargos elétricos adicionais iniciam a zero: isso não comprova ausência de custo. Sem rampa de abertura, tesouraria mensal, reporte fiscal de prejuízos ou calendário de IVA. Prazo de dez anos nos cenários abaixo, sem valor residual dos ativos; recupera-se o stock inicial. A TIR é do projeto, não de um sócio após sweat equity.
