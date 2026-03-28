const express = require('express');
const router = express.Router();
const { getQuestions, submitQuiz, getHistory, getQuizResult } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.get('/questions', protect, getQuestions);
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getQuizResult);

module.exports = router;
