// routes/analysis.js
const express = require('express');
const router = express.Router();
const { getLatestAnalysis, getTrend, getMoodTrend } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

router.get('/latest', protect, getLatestAnalysis);
router.get('/trend', protect, getTrend);
router.get('/mood-trend', protect, getMoodTrend);

module.exports = router;
