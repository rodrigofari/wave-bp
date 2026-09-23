# Bilhetes e break-even — análise atual

Atualizado em 24/09/2026. Gerado por `node analysis/generate-reports.cjs` a partir do motor do simulador. Valores líquidos de IVA. Cenários ilustrativos, não previsões nem orçamentos.

## Exemplo reproduzível na interface

Selecionar bilhetes; procura 70/dia; preço médio 41,807 € após descontos e antes de comissões; sete minutos de onda + um de troca; dez horas/dia e 340 dias. Capacidade de 75 bilhetes/dia, sem utilizações simultâneas. No bar: sazonalidade externa zero, restantes pressupostos iniciais. Este exemplo difere do arranque da página (oito minutos + um, capacidade 66).

Não há receitas de privadas, clínicas, alugueres, eventos ou cartões neste modo. O bar continua a receber surfistas e acompanhantes; mantém também seis clientes/dia a trabalhar. Os valores da tabela são bilhetes por dia aberto em média.

| Clientes externos bar/dia | EBITDA zero | FCFE ano 1 zero | VAL zero dentro de 75/dia | TIR com 70 bilhetes |
| --- | --- | --- | --- | --- |
| 0 | 54.90 | 65.89 | Não atinge a capacidade | -1.58% |
| 30 | 50.43 | 61.43 | Não atinge a capacidade | 2.34% |
| 60 | 45.97 | 56.96 | 73.09 | 5.87% |

Com 70 bilhetes e 60 clientes externos/dia: receita da onda 995 007 €, receita do bar 381 480 €, EBITDA conjunto 354 618 €, FCFE do ano 1 160 720 €, VAL -265 271 € e TIR 5.87%.

O limiar de VAL zero é 73.09 bilhetes/dia à taxa de 8.14%. EBITDA zero cobre operação; FCFE zero cobre também imposto, dívida e manutenção no ano 1; VAL zero remunera o investimento no horizonte. FCFE não é dividendo automaticamente distribuível.

No limite inicial de 66 bilhetes/dia, não se podem usar metas acima de 66 como atingíveis. O simulador limita vendas e sinaliza o retorno que não cabe nessa capacidade. Alterar a permanência é alterar a experiência; não é uma poupança garantida.

A tarifa EEM, o perfil real de consumo da máquina, os orçamentos e a procura não estão validados. Comissões, custo unitário de material e encargos elétricos adicionais iniciam a zero: isso não comprova ausência de custo. Sem rampa de abertura, tesouraria mensal, reporte fiscal de prejuízos ou calendário de IVA. Prazo de dez anos nos cenários abaixo, sem valor residual dos ativos; recupera-se o stock inicial. A TIR é do projeto, não de um sócio após sweat equity.
