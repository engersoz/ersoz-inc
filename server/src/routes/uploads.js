const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/', (req, res) => {
  res.json({ success: true, message: 'File Upload API - Coming Soon' });
});

module.exports = router;
