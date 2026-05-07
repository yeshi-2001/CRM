const router = require('express').Router();
const { getLeads, getLeadById, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { getNotes, addNote, deleteNote } = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id/notes', getNotes);
router.post('/:id/notes', addNote);
router.delete('/:leadId/notes/:id', deleteNote);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
