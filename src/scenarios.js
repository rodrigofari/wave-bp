/* Investor-facing planning cases. Every case is illustrative, editable and
   runs through the same financial engine as the regular simulator. */
(function(root) {
  'use strict';
  const F = typeof module !== 'undefined' && module.exports ? require('./finance.js') : root.CitywaveFinance;
  const H = typeof module !== 'undefined' && module.exports ? require('./hospitality.js') : root.CitywaveHospitality;
  const scale = (value, factor) => Math.round(value * factor * 100) / 100;

  const definitions = [
    {
      id: 'pessimistic',
      title: {pt:'Pessimista', en:'Downside'},
      positioning: {pt:'Procura e margem sob pressão', en:'Demand and margins under pressure'},
      explanation: {
        pt:'Testa uma abertura mais lenta: menos grupos e participantes, menor preço realizado e menor renda pela concessão, com maior pressão de energia e investimento.',
        en:'Tests a slower ramp-up: fewer groups and riders, lower realized prices and concession rent, with more pressure from energy and initial investment.'
      },
      wave: {
        salesMode:'sessions', sessionMinutes:60, sessionGapMinutes:0, ridersPerSession:5,
        sessionsDay:4, opDays:300, staffCount:5, bonoPct:25, bonoDiscount:20,
        electricityRate:0.20, contingency:15, revenueGrowth:1, costGrowth:3,
        beginnerPrice:scale(F.INIT.beginnerPrice,.90), intermediatePrice:scale(F.INIT.intermediatePrice,.90),
        advancedPrice:scale(F.INIT.advancedPrice,.90), kidsPrice:scale(F.INIT.kidsPrice,.90),
      },
      bar: {
        operatingMode:'concession', opDays:300, concessionRentMonth:1500,
        concessionOwnerCostsMonth:300, concessionFitoutCapex:0,
        externalDaily:25, externalTicket:8.5, surfConversion:35,
        companionConversion:45, workDaily:3, revenueGrowth:1, costGrowth:3,
      },
      assumptions: [
        {pt:'Onda',en:'Wave',ptValue:'4 sessões de pico/dia · 5 pessoas/grupo · 60 min · 300 dias/ano',enValue:'4 peak sessions/day · 5 people/group · 60 min · 300 days/year'},
        {pt:'Equipa da onda',en:'Wave team',ptValue:'5 pessoas (pressuposto de folha salarial)',enValue:'5 people (payroll assumption)'},
        {pt:'Preço',en:'Price',ptValue:'Preços por nível −10%; descontos 25% × 20%',enValue:'Skill-level prices −10%; discounts 25% × 20%'},
        {pt:'Bar em concessão',en:'Bar concession',ptValue:'Renda 1.500€/mês · custos retidos pelo proprietário 300€/mês · CAPEX do proprietário 0€',enValue:'€1,500/month rent · €300/month retained owner costs · €0 owner-funded CAPEX'},
        {pt:'Pressão de custos',en:'Cost pressure',ptValue:'Energia 0,20€/kWh · contingência CAPEX 15% · custos +3%/ano',enValue:'Energy €0.20/kWh · CAPEX contingency 15% · costs +3%/year'},
      ],
      caution: {pt:'Stress test, não previsão de procura mínima.',en:'Stress test, not a minimum-demand forecast.'}
    },
    {
      id: 'realistic',
      title: {pt:'Realista · referência', en:'Realistic · reference'},
      positioning: {pt:'Operação estável, pressupostos centrais', en:'Steady operation, central assumptions'},
      explanation: {
        pt:'Usa uma rampa intermédia de sessões e uma equipa mais enxuta, e trata o bar como concessão. A renda serve apenas de hipótese até existir uma proposta e uma escala de turnos validada.',
        en:'Uses an intermediate session ramp and leaner team, with the bar treated as a concession. Rent is a working assumption until a proposal and validated shift roster are available.'
      },
      wave: {
        salesMode:'sessions', sessionMinutes:60, sessionGapMinutes:0, ridersPerSession:8,
        sessionsDay:9, opDays:340, staffCount:5,
      },
      bar: {
        operatingMode:'concession', opDays:340, concessionRentMonth:2500,
        concessionOwnerCostsMonth:300, concessionFitoutCapex:0,
        externalDaily:45, externalTicket:10.5, surfConversion:45,
        companionConversion:60, workDaily:6,
      },
      assumptions: [
        {pt:'Onda',en:'Wave',ptValue:'9 sessões de pico/dia · 8 pessoas/grupo · 60 min · 340 dias/ano',enValue:'9 peak sessions/day · 8 people/group · 60 min · 340 days/year'},
        {pt:'Equipa da onda',en:'Wave team',ptValue:'5 pessoas (pressuposto de folha salarial)',enValue:'5 people (payroll assumption)'},
        {pt:'Preço',en:'Price',ptValue:'Tabela atual por nível; descontos 20% × 15%',enValue:'Current skill-level prices; discounts 20% × 15%'},
        {pt:'Bar em concessão',en:'Bar concession',ptValue:'Renda 2.500€/mês · custos retidos pelo proprietário 300€/mês · CAPEX do proprietário 0€',enValue:'€2,500/month rent · €300/month retained owner costs · €0 owner-funded CAPEX'},
        {pt:'Custos',en:'Costs',ptValue:'Energia 0,16€/kWh · contingência CAPEX 10% · custos +2%/ano',enValue:'Energy €0.16/kWh · CAPEX contingency 10% · costs +2%/year'},
      ],
      caution: {pt:'Cenário de referência editável; não é uma previsão validada.',en:'Editable reference case; not a validated forecast.'}
    },
    {
      id: 'optimistic',
      title: {pt:'Otimista', en:'Upside'},
      positioning: {pt:'Boa adesão e maior utilização', en:'Strong take-up and higher utilization'},
      explanation: {
        pt:'Testa sessões mais curtas e bem preenchidas, com procura mais forte e renda de concessão superior. Mantém a tarifa de energia e a contingência de investimento da referência, sem presumir descontos de fornecedores.',
        en:'Tests shorter, well-filled sessions with stronger demand and higher concession rent. It keeps the reference electricity tariff and investment contingency, without assuming supplier discounts.'
      },
      wave: {
        salesMode:'sessions', sessionMinutes:45, sessionGapMinutes:0, ridersPerSession:10,
        sessionsDay:10, opDays:350, staffCount:6, revenueGrowth:4,
        beginnerPrice:scale(F.INIT.beginnerPrice,1.05), intermediatePrice:scale(F.INIT.intermediatePrice,1.05),
        advancedPrice:scale(F.INIT.advancedPrice,1.05), kidsPrice:scale(F.INIT.kidsPrice,1.05),
      },
      bar: {
        operatingMode:'concession', opDays:350, concessionRentMonth:3500,
        concessionOwnerCostsMonth:300, concessionFitoutCapex:0,
        externalDaily:70, externalTicket:12, surfConversion:55,
        companionConversion:70, workDaily:8, revenueGrowth:4,
      },
      assumptions: [
        {pt:'Onda',en:'Wave',ptValue:'10 sessões de pico/dia · 10 pessoas/grupo · 45 min · 350 dias/ano',enValue:'10 peak sessions/day · 10 people/group · 45 min · 350 days/year'},
        {pt:'Equipa da onda',en:'Wave team',ptValue:'6 pessoas (pressuposto de folha salarial)',enValue:'6 people (payroll assumption)'},
        {pt:'Preço',en:'Price',ptValue:'Preços por nível +5%; descontos iguais à referência',enValue:'Skill-level prices +5%; same discounts as reference'},
        {pt:'Bar em concessão',en:'Bar concession',ptValue:'Renda 3.500€/mês · custos retidos pelo proprietário 300€/mês · CAPEX do proprietário 0€',enValue:'€3,500/month rent · €300/month retained owner costs · €0 owner-funded CAPEX'},
        {pt:'Custos',en:'Costs',ptValue:'Energia 0,16€/kWh · contingência CAPEX 10% · custos +2%/ano',enValue:'Energy €0.16/kWh · CAPEX contingency 10% · costs +2%/year'},
      ],
      caution: {pt:'Potencial condicionado a procura, horários e conversão ainda por comprovar.',en:'Upside depends on demand, schedules and conversion still to be validated.'}
    }
  ];

  function build(id) {
    const definition = definitions.find(item => item.id === id);
    if (!definition) throw new Error(`Unknown scenario: ${id}`);
    return {
      wave: {...F.APP_INIT, ...definition.wave},
      bar: {...H.BAR_INIT, ...definition.bar},
      shared: {...H.SHARED_INIT},
    };
  }
  function all() { return definitions.map(definition => ({...definition, inputs:build(definition.id)})); }
  const api = {definitions, build, all};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CitywaveScenarios = api;
})(typeof window !== 'undefined' ? window : globalThis);
