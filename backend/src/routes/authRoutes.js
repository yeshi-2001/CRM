const router = require('express').Router();
const { login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', authMiddleware, me);

module.exports = router;
