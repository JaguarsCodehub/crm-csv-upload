const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/authMiddleware');

router.post('/import', auth, async (req, res) => {
  const { contacts } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'No contacts provided' });
  }

  try {
    const enrichedContacts = contacts.map((contact) => ({
      ...contact,
      userId,
    }));

    await Contact.insertMany(enrichedContacts);

    return res.status(200).json({ message: 'Contacts imported successfully' });
  } catch (err) {
    console.error('Error importing contacts:', err);
    return res.status(500).json({ error: 'Failed to import contacts' });
  }
});

module.exports = router;
