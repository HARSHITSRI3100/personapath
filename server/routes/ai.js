const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getPersonalityAnalysis, getJournalAnalysis, chat } = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

// POST /api/ai/personality  – AI personality deep-dive
router.post('/personality', getPersonalityAnalysis);

// POST /api/ai/journal      – AI journal sentiment + insights
router.post('/journal', getJournalAnalysis);

// POST /api/ai/chat         – Career coach chat
router.post('/chat', chat);

module.exports = router;
