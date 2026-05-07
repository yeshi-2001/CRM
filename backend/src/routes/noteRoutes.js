const router = require('express').Router();
const { getNotes, addNote, deleteNote } = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/:id/notes', getNotes);
router.post('/:id/notes', addNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;
