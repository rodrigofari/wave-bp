# Citywave Funchal — investor guide

Updated 30 Sep 2026. This guide explains how to read and test the simulator. The figures below are the engine’s starting scenario: editable assumptions, not forecasts, financing offers or supplier quotes.

## The idea in 60 seconds

The proposal combines a Citywave pool in Funchal with a simple bar where surfers, companions, visitors and people working nearby can buy food and drinks. The work area does not sell memberships or desk time: visitors are customers of the bar operator. In the starting concession, the Lda. receives fixed rent and does not book their spending. The cable car and cruise traffic help describe tourist flows; their passengers are not guaranteed customers. Tourists, hotels, cruise ships, the cable car and online sales overlap. Do not add those audiences together.

The simulator separates **Wave only**, **Bar / work** and **Combined**. The combined view is the most useful for assessing total funding needs. The wave requires substantial capital: the engine’s starting scenario shows combined investment of 2 292 400 €, annual revenue of 808 563 €, EBITDA of 144 505 €, NPV of -1 371 916 € and project IRR of -6.96%, against a discount rate of 8.14%. Positive EBITDA means the operation earns money before depreciation, interest and tax; **it does not mean the investment pays back**.

| Starting scenario | Wave (allocated share) | Bar within combined | Combined |
| --- | --- | --- | --- |
| Investment | 2 292 400 € | 0 € | 2 292 400 € |
| Year 1 revenue | 778 563 € | 30 000 € | 808 563 € |
| Year 1 EBITDA | 132 505 € | 12 000 € | 144 505 € |
| NPV | -1 451 695 € | 73 816 € | -1 371 916 € |
| Project IRR | -8.11% | Indisponível | -6.96% |

In the wave column, common costs are already shared with the bar; the standalone wave view retains all of those costs. Component NPVs/IRRs are analytical and should not be added as if they were the consolidated project returns.

## How to explore the model

1. Choose **Combined** to see the pool and bar together. Then compare with **Wave only** and **Bar / work**.
2. Start with the controls on the left: session length, group size, session demand, skill-level prices, opening hours, energy and investment. Underlined numbers are editable.
3. Expand sections by clicking their title. Hover over the **i** icon for a plain-English explanation.
4. Use **VAT & cash** to choose gross or net input prices, Citywave invoicing and refund timing. Edit bar inputs in **Bar / work**. The starting case is a concession with illustrative monthly rent and retained owner costs; switch to owner-operation to test direct bar trading.
5. Compare EBITDA, cash flow, NPV and IRR. Test group-session demand; in owner-operated bar mode, edit external bar visits too. Tourist passenger totals are not automatic conversions.

Edits remain only in the current browser session and are lost on refresh. Share the simulator link so each investor can test their own case; the link does not save or transmit edited values.

## What the three views include

| View | Includes | Use it to |
|---|---|---|
| Wave only | Pool, group sessions, staff and wave costs | Assess the pool business by itself |
| Bar / work | Owner rent and retained costs in concession mode; customer sales only in owner-operation | Test the rent or direct bar trading |
| Combined | Wave and bar revenue and costs, with consolidated funding and tax | Assess the project that would need financing |

Shared costs can be allocated between wave and bar for analysis, but this does not create savings. Component IRRs and NPVs are analytical and **must not be added together**. Use the combined view for total project returns.

## Group sessions and capacity: what does the model sell?

The Lda. sells places in 45- or 60-minute group sessions. Each customer pays the price for their skill level; the duration belongs to the whole group, not to individual wave time. The starting case uses demand for nine peak sessions/day, eight people/session, 60 minutes, ten opening hours and 340 days/year: about 54.8 public participants per open day on average. Monthly seasonality reduces demand, while operating hours cap sales at the whole number of sessions that fit. At 60 minutes without an extra gap, the ceiling is ten groups/day. The editable group limit is 14 people, but Citywave and the operating team must confirm safe capacity and rotation.

The starting prices are €49/€39/€39/€35 for beginner/intermediate/advanced/children, with editable discounts. The VAT panel chooses whether entered prices are before VAT or final customer prices; the commercial policy is still undecided. Equipment is included for beginners, intermediate surfers and children; advanced surfers may rent it. Private sessions replace public groups; private bookings, rental, events, passes and extra coaching start at zero in the investor case. Intermediary sales incur a separate commission.

## Group sessions: comparing 45 and 60 minutes

Each group session lasts 45 or 60 minutes in total and can include up to 14 people. The model does not assume each participant uses the wave for that entire period: actual use varies by skill level and group rotation. With ten opening hours and no gap between sessions, the ceiling is 13 sessions (104 places) at 45 minutes or ten sessions (80 places) at 60 minutes with eight people per group per day. Actual demand is capped at this limit and adjusted by monthly seasonality factors.

| Group session | Max sessions/day | Max people/day | Public participants/year | Energy tariff | Energy/year | Wave revenue | Combined EBITDA | Combined NPV | Project IRR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 min | 13 | 104 | 24 830 | 0.16 €/kWh | 326 400 € | 1 038 085 € | 391 050 € | 63 064 € | 8.70% |
| 60 min | 10 | 80 | 23 090 | 0.16 €/kWh | 326 400 € | 965 307 € | 321 912 € | -338 820 € | 4.98% |

Indicative engine comparison, holding the other starting assumptions constant: prices, peak demand (12 sessions/day), €0.16/kWh tariff, power/load, costs, bar and funding. Participants are annual public sales after seasonality; maximum capacity is a ceiling, not a demand forecast. Energy remains based on daily operating hours, so a shorter session does not automatically lower daily electricity cost. Editing the tariff, power, load or hours recalculates energy cost in both scenarios. The session gap is editable and reduces available capacity.

## How the bar makes money

The starting case is a concession: the Lda. receives €2,500/month in rent before VAT and retains €300/month in owner costs. Food and drink sales belong to the concessionaire and are excluded from the Lda.'s revenue. These figures are wholly illustrative; owner-operation can be selected in the simulator.

In owner-operated bar mode, the simulator separates four customer sources to limit double counting: surfers, companions, external visitors and people working. For each source, it estimates visits, conversion to a purchase, average spend and length of stay. People working use the same bar seats and generate **spend per visit**, not a second coworking revenue stream. Capacity is limited by monthly seat-hours and may miss peak-hour congestion.

The cable car’s annual traffic (about 1.1 million passenger journeys in 2025, [reported by Diário de Notícias](https://www.dnoticias.pt/2026/5/27/493459-teleferico-do-funchal-investe-45-milhoes/)) and cruise passengers provide context for testing channels, not daily footfall at the site. A passenger may never pass the bar, may be counted in another channel or may not buy anything. Replace traffic assumptions with pedestrian counts, conversion tests, hotel/cruise/cable-car partnerships, online booking data and trials. Deduct each intermediary commission once; online and partner channels may have different costs.

In the owner-operated alternative, external visits/day, seasonality, seats, average spend, staffing, wages, rent, fit-out and equipment are assumptions. Obtain quotes and run sensitivities. A zero input for equipment, auxiliary electricity or commission means “not entered”, not “no cost”.

## Financial terms in plain English

| Term | Plain-English meaning |
|---|---|
| Revenue | Sales for the year, shown net of VAT |
| OPEX | Recurring costs needed to operate |
| EBITDA | Revenue less operating costs, before depreciation, interest and tax |
| EBITDA margin | EBITDA ÷ revenue; the share left before those items |
| CAPEX | Investment in construction, installation, equipment and assets |
| Working capital | Cash tied up in opening stock; the model assumes it is recovered at exit |
| Depreciation | Accounting allocation of asset cost over its useful life; it is not an annual cash payment |
| FCFF | Operating cash after operating tax and maintenance investment, before debt |
| FCFE | Cash after financed tax, interest, debt repayment and maintenance, before dividends |
| NPV | Present value of future cash flows less initial investment. Positive NPV clears the assumed discount rate; negative NPV falls short |
| Project IRR | Implied return on project cash flows before financing; compare it with the discount rate |
| Equity IRR | Return on investor cash flows, including additional equity, dividends and exit proceeds |
| WACC | Rate used to discount project cash flows; here it comes from debt/equity and CAPM assumptions |
| Payback | Time until cumulative FCFF recovers the investment; it does not measure value created after payback |
| EBITDA break-even | Average daily participants needed to cover operating costs; it excludes investment, tax and debt repayment |
| FCFE break-even | Average daily participants needed for year-one FCFE to reach zero, including tax, debt and maintenance |
| NPV break-even | Average daily participants needed for NPV to reach zero over the selected term and discount rate |

Positive EBITDA can coexist with negative FCFE: debt principal and maintenance investment use cash. A low/negative IRR or negative NPV means the modelled cash flows do not compensate for capital at the chosen discount rate and term. Dividends are not automatic; the model’s payout rule is simplified and is not legal or lender approval.

## Energy: get a quote for this input

The starting case uses 600 kW peak power, 100% average load, ten hours/day, 340 days and an editable €0.16/kWh tariff. The formula gives 6,000 kWh/day and 326 400 €/year. Each €0.01/kWh change moves annual cost by 20 400 €, holding everything else constant. Energy is charged throughout opening hours even when few customers attend. The tariff and actual load profile are not confirmed; auxiliary pumps, the bar, contracted capacity, time-of-use rates and fees require quotes from EEM/the supplier and the final technical specification. Do not count the same charge twice.

## Assumptions and limits investors should test

- **Demand and pricing:** no market study validates conversion, price, volume or seasonality. Annual growth raises price/revenue; it does not automatically add customers.
- **Capacity and safety:** session mode models 45- or 60-minute groups capped at 14 people; safe capacity, rotation and actual wave-use time need operational confirmation. Sold demand is an annual expected average, not confirmed bookings.
- **Bar:** the starting case is an illustrative concession with landlord rent and costs; owner-operated trading remains an editable alternative. Validate the contract, investment and achievable rent.
- **Electricity:** tariff and load profile are assumptions; actual consumption and contracted cost can materially change break-even.
- **Tax and VAT:** income tax and VAT differ. The VAT panel models gross/net prices, input-tax recovery and a simplified monthly cash bridge; refund financing costs are not included in NPV/IRR. Seek tax advice.
- **Funding:** percentages and loan rate/term are inputs, not bank offers. Sweat equity is an illustrative weighting, not a shareholders’ agreement.
- **Term and exit:** matches the concession term, with no perpetuity; residual value is zero by default. Intra-year cash, pre-opening costs, ramp-up, delays and decommissioning are not modelled.
- **Consolidation:** one operating entity, analytical allocation of shared costs and recalculated combined tax. Do not add component NPVs or IRRs.

Use the simulator to ask “what would need to be true?” and identify the critical inputs. Before investing, replace illustrative values with studies, Citywave specifications/warranties, EEM and construction quotes, an operating plan, bank proposals, contracts and tax/legal review.
