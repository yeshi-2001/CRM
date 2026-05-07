const router = require('express').Router();
const { getStats, getRecentLeads, getTopSalespeople, getMonthlyLeads } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/stats',        getStats);
router.get('/recent-leads', getRecentLeads);
router.get('/top-sales',    getTopSalespeople);
router.get('/monthly',      getMonthlyLeads);

module.exports = router;
