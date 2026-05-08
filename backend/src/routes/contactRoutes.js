const router = require('express').Router();
const { getContacts, getContactById, createContact, updateContact, deleteContact } = require('../controllers/contactController');
const { getNotes, addNote, deleteNote } = require('../controllers/contactNoteController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/',              getContacts);
router.post('/',             createContact);
router.get('/:id',           getContactById);
router.put('/:id',           updateContact);
router.delete('/:id',        deleteContact);
router.get('/:id/notes',     getNotes);
router.post('/:id/notes',    addNote);
router.delete('/notes/:id',  deleteNote);

module.exports = router;
