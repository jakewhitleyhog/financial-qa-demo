/**
 * Deal Controller - Returns structured deal data for the investor dashboard
 */

import { query } from '../config/database.js';

/**
 * GET /api/deals/summary
 * Returns deal overview, financials, capital allocation, projected returns,
 * and price sensitivities for the dashboard.
 */
export async function getDealSummary(req, res) {
  try {
    const deals = query(`SELECT * FROM deals LIMIT 1`);
    if (deals.length === 0) {
      return res.status(404).json({ success: false, error: 'No deal data found' });
    }
    const deal = deals[0];

    const financials = query(
      `SELECT period_year, total_revenue, operating_income, avg_daily_oil_bopd,
              investor_distributions, total_capex
       FROM annual_financials WHERE deal_id = ? ORDER BY period_year ASC`,
      [deal.id]
    );

    const capitalAllocation = query(
      `SELECT category, percentage, amount FROM capital_allocation WHERE deal_id = ? ORDER BY amount DESC`,
      [deal.id]
    );

    const projectedReturns = query(
      `SELECT scenario, capital_invested, capital_returned, moic, irr, return_of_capital_years
       FROM projected_returns WHERE deal_id = ? ORDER BY irr DESC`,
      [deal.id]
    );

    const priceSensitivities = query(
      `SELECT oil_price_per_bbl, moic, irr, return_of_capital_years
       FROM price_sensitivities WHERE deal_id = ? ORDER BY oil_price_per_bbl ASC`,
      [deal.id]
    );

    res.json({
      success: true,
      deal: {
        name: deal.name,
        basin: deal.basin,
        state: deal.state,
        totalWellsPlanned: deal.total_wells_planned,
        capitalRaiseTarget: deal.capital_raise_target,
        targetIrr: deal.target_irr,
        targetMoic: deal.target_moic,
        returnOfCapitalYears: deal.return_of_capital_years,
        fundBreakevenOilPrice: deal.fund_breakeven_oil_price,
        leaseholdAcres: deal.leasehold_acres,
      },
      financials: financials.map(f => ({
        year: f.period_year,
        revenue: f.total_revenue,
        operatingIncome: f.operating_income,
        dailyOilBopd: f.avg_daily_oil_bopd,
        distributions: f.investor_distributions,
        capex: f.total_capex,
      })),
      capitalAllocation: capitalAllocation.map(c => ({
        category: c.category,
        percentage: c.percentage,
        amount: c.amount,
      })),
      projectedReturns: projectedReturns.map(p => ({
        scenario: p.scenario,
        capitalInvested: p.capital_invested,
        capitalReturned: p.capital_returned,
        moic: p.moic,
        irr: p.irr,
        returnOfCapitalYears: p.return_of_capital_years,
      })),
      priceSensitivities: priceSensitivities.map(p => ({
        oilPrice: p.oil_price_per_bbl,
        moic: p.moic,
        irr: p.irr,
        returnOfCapitalYears: p.return_of_capital_years,
      })),
    });
  } catch (error) {
    console.error('Deal summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deal summary' });
  }
}
