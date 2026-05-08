const { query } = require('../config/db');

async function getContacts(req, res, next) {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR company ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(`SELECT * FROM contacts ${where} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch (err) { next(err); }
}

async function getContactById(req, res, next) {
  try {
    const { rows } = await query(`SELECT * FROM contacts WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Contact not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function createContact(req, res, next) {
  try {
    const { name, company, email, phone, location, category, assigned_to } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await query(
      `INSERT INTO contacts (name, company, email, phone, location, category, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name.trim(), company, email, phone, location, category || 'Customer', assigned_to]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function updateContact(req, res, next) {
  try {
    const { name, company, email, phone, location, category, assigned_to } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await query(
      `UPDATE contacts SET name=$1, company=$2, email=$3, phone=$4,
       location=$5, category=$6, assigned_to=$7
       WHERE id=$8 RETURNING *`,
      [name.trim(), company, email, phone, location, category, assigned_to, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Contact not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function deleteContact(req, res, next) {
  try {
    const { rowCount } = await query(`DELETE FROM contacts WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) { next(err); }
}

module.exports = { getContacts, getContactById, createContact, updateContact, deleteContact };
