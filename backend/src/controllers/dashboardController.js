const { query } = require('../config/db');

async function getStats(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*)                                        AS total,
        COUNT(*) FILTER (WHERE status = 'New')          AS new,
        COUNT(*) FILTER (WHERE status = 'Contacted')    AS contacted,
        COUNT(*) FILTER (WHERE status = 'Qualified')    AS qualified,
        COUNT(*) FILTER (WHERE status = 'Proposal Sent') AS proposal_sent,
        COUNT(*) FILTER (WHERE status = 'Won')          AS won,
        COUNT(*) FILTER (WHERE status = 'Lost')         AS lost,
        COALESCE(SUM(deal_value), 0)                    AS total_deal_value,
        COALESCE(SUM(deal_value) FILTER (WHERE status = 'Won'), 0) AS won_deal_value
      FROM leads
    `);
    const r = rows[0];
    res.json({
      total:            parseInt(r.total),
      new:              parseInt(r.new),
      contacted:        parseInt(r.contacted),
      qualified:        parseInt(r.qualified),
      proposal_sent:    parseInt(r.proposal_sent),
      won:              parseInt(r.won),
      lost:             parseInt(r.lost),
      total_deal_value: parseFloat(r.total_deal_value).toFixed(2),
      won_deal_value:   parseFloat(r.won_deal_value).toFixed(2),
    });
  } catch (err) {
    next(err);
  }
}

async function getRecentLeads(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT id, lead_name, company_name, status, deal_value, assigned_to, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getTopSalespeople(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT
        assigned_to                          AS name,
        COUNT(*)                             AS total_leads,
        COUNT(*) FILTER (WHERE status='Won') AS won_leads,
        COALESCE(SUM(deal_value) FILTER (WHERE status='Won'), 0) AS won_value
      FROM leads
      WHERE assigned_to IS NOT NULL AND assigned_to <> ''
      GROUP BY assigned_to
      ORDER BY won_value DESC
      LIMIT 5
    `);
    res.json(rows.map(r => ({
      name:        r.name,
      total_leads: parseInt(r.total_leads),
      won_leads:   parseInt(r.won_leads),
      won_value:   parseFloat(r.won_value).toFixed(2),
    })));
  } catch (err) {
    next(err);
  }
}

async function getMonthlyLeads(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
        DATE_TRUNC('month', created_at)                       AS month_date,
        COUNT(*)                                              AS total,
        COUNT(*) FILTER (WHERE status = 'Won')                AS won
      FROM leads
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month_date ASC
    `);
    res.json(rows.map(r => ({
      month: r.month,
      total: parseInt(r.total),
      won:   parseInt(r.won),
    })));
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getRecentLeads, getTopSalespeople, getMonthlyLeads };
