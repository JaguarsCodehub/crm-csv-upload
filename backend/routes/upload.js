const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { parseCSV, importContacts } = require('../controllers/uploadController');

router.post('/preview', auth, parseCSV); // CSV to JSON preview
router.post('/import', auth, importContacts); // Final import

module.exports = router;
