const { query } = require('../config/db');

async function getNotes(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT * FROM contact_notes WHERE contact_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function addNote(req, res, next) {
  try {
    const { content, created_by } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    const { rows } = await query(
      `INSERT INTO contact_notes (contact_id, content, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, content.trim(), (created_by || 'Unknown').trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function deleteNote(req, res, next) {
  try {
    const { rowCount } = await query(`DELETE FROM contact_notes WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) { next(err); }
}

module.exports = { getNotes, addNote, deleteNote };
