const { query } = require('../config/db');

async function getLeads(req, res, next) {
  try {
    const { status, source, assigned_to, search } = req.query;
    const conditions = [];
    const params = [];

    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (source) { params.push(source); conditions.push(`lead_source = $${params.length}`); }
    if (assigned_to) { params.push(assigned_to); conditions.push(`assigned_to = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(lead_name ILIKE $${params.length} OR company_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(`SELECT * FROM leads ${where} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getLeadById(req, res, next) {
  try {
    const { rows } = await query(`SELECT * FROM leads WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function createLead(req, res, next) {
  try {
    const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;
    if (!lead_name || !lead_name.trim()) {
      return res.status(400).json({ error: 'Lead name is required' });
    }
    const { rows } = await query(
      `INSERT INTO leads (lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [lead_name.trim(), company_name, email, phone, lead_source, assigned_to, status || 'New', deal_value || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateLead(req, res, next) {
  try {
    const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;
    if (!lead_name || !lead_name.trim()) {
      return res.status(400).json({ error: 'Lead name is required' });
    }
    const { rows } = await query(
      `UPDATE leads SET lead_name=$1, company_name=$2, email=$3, phone=$4,
       lead_source=$5, assigned_to=$6, status=$7, deal_value=$8
       WHERE id=$9 RETURNING *`,
      [lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteLead(req, res, next) {
  try {
    const { rowCount } = await query(`DELETE FROM leads WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead };
