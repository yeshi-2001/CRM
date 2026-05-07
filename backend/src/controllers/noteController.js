const { query } = require('../config/db');

async function getNotes(req, res) {
  try {
    const { rows } = await query(
      `SELECT * FROM notes WHERE lead_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addNote(req, res) {
  try {
    const { content, created_by } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    const safeCreatedBy = (created_by || 'Unknown').trim();
    const { rows } = await query(
      `INSERT INTO notes (lead_id, content, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, content.trim(), safeCreatedBy]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteNote(req, res) {
  try {
    const { rowCount } = await query(`DELETE FROM notes WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getNotes, addNote, deleteNote };
