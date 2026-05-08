const { query } = require('../config/db');

async function getHistory(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT * FROM pipeline_history WHERE lead_id = $1 ORDER BY changed_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function addHistory(req, res, next) {
  try {
    const { from_status, to_status, changed_by } = req.body;
    if (!to_status) return res.status(400).json({ error: 'to_status is required' });
    const { rows } = await query(
      `INSERT INTO pipeline_history (lead_id, from_status, to_status, changed_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, from_status || null, to_status, (changed_by || 'Unknown').trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getHistory, addHistory };
