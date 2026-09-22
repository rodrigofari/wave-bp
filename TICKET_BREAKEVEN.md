# Break-even por bilhete: entrada flexível

Cálculo reproduzível: `node analysis/ticket-breakeven.cjs`.

A entrada flexível altera a comercialização e a fila, mas não elimina o limite
físico de utilizações da onda. Este exercício calcula volume de vendas necessário,
não valida capacidade, segurança, filas ou número de surfistas simultâneos.
Cada bilhete deve ter um direito definido: tempo, voltas ou duração de utilização.

## Pressupostos

- Média anual de bilhetes por dia aberto; 340 dias, dez horas/dia.
- Bilhete médio líquido de IVA após descontos: 41,807 €.
- Sem receitas de privadas, clínicas, aluguer, eventos ou cartões.
- Energia da onda: 326 400 €/ano, mantendo 600 kW a 100% e 0,16 €/kWh.
  Tarifa e fatura total EEM ainda não validadas.
- Bar mantém equipa, investimento e custos ilustrativos. Conversão de surfistas:
  45% a 8 €; 0,5 acompanhantes por surfista, dos quais 60% consomem 8 €.
- Clientes externos do bar: 0/30/60 por dia a 10,50 €. Seis clientes a trabalhar
  por dia a 12 €, separados dos restantes públicos. Todos os consumos líquidos de IVA.
- Custos comuns consolidados uma vez. Stock inicial financiado e recuperado na saída.
- Financiamento, impostos e crescimento dos defaults; sem comissões específicas
  de intermediários turísticos ou custos de material discriminados por utilização.
- Investimento conjunto 2 451 400 €, horizonte dez anos, desconto 8,14025%,
  ativos sem valor residual e recuperação de 5 000 € de stock no fim.

O script reutiliza o motor financeiro distribuindo os bilhetes anuais pela curva
mensal existente. O parâmetro de participantes por sessão é apenas uma ponte
algébrica para obter esse volume: não recomenda grupos nem um horário operacional.

## Três limiares diferentes

| Componente / procura externa | EBITDA zero | FCFE ano 1 zero | VAL zero em dez anos |
|---|---:|---:|---:|
| Apenas onda, sem bar | 53,72 | 64,86 | 81,59 |
| Conjunto, 0 clientes externos/dia | 54,90 | 65,89 | 82,02 |
| Conjunto, 30 clientes externos/dia | 50,43 | 61,43 | 77,56 |
| Conjunto, 60 clientes externos/dia | 45,97 | 56,96 | 73,09 |

Valores em bilhetes de surf por dia aberto, média anual. O cenário de zero
clientes externos ainda inclui consumo dos surfistas/acompanhantes e clientes
a trabalhar. EBITDA zero cobre OPEX; FCFE zero cobre também imposto após juros,
serviço da dívida e manutenção capitalizada. VAL zero recupera e remunera o
investimento ao desconto assumido, não significa simplesmente ter caixa positiva.
O FCFE não é automaticamente distribuível como dividendos.

## 70 bilhetes/dia e 60 clientes externos no bar

23 800 bilhetes/ano × 41,807 € = 995 007 € de receita da onda.
Receita do bar 381 480 €, incluindo 214 200 € dos clientes externos.
EBITDA conjunto 354 618 €; FCFE no ano 1 160 720 €.
TIR do projeto 5,87%; VAL −265 271 €. Existe caixa positiva, mas o retorno
fica abaixo dos 8,14% exigidos no modelo. Arredondando a meta de VAL zero para
bilhetes inteiros, seriam 74 por dia em média, antes de margens de segurança.

Se o bilhete médio líquido subir para 49 €, com o mesmo bar e custos, o limiar
de FCFE zero desce para 49,21 bilhetes/dia e o de VAL zero para 63,15.
Isto não representa 49 € de preço ao consumidor com IVA e comissões incluídos.
Nem é evidência de que o mercado aceita o preço ou mantém as vendas.

## Implicação operacional

70 bilhetes em dez horas equivalem a sete admissões por hora. Se existir uma
única utilização da onda de cada vez e um só turno de dez horas, são no máximo
600/70 = 8,57 minutos de onda por bilhete antes de transições, pausas e incidentes.
Não confundir uma experiência de uma hora em grupo com uma hora individual de
surf efetivo. A operação deve confirmar se há utilizações simultâneas permitidas.

Entrada contínua, marcação flexível ou grupos podem servir a mesma meta de vendas,
mas precisam de controlo de fila e limite de utilização por bilhete. Bilhete
ilimitado não é financeiramente equivalente a uma experiência delimitada.
