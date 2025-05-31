const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/authMiddleware');

// POST /contacts/import
router.post('/import', auth, async (req, res) => {
  const { contacts, deduplication = 'create' } = req.body; // 'create', 'update', 'overwrite'
  const userId = req.user.id;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'No contacts provided' });
  }

  try {
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      overwritten: 0,
    };

    for (const contact of contacts) {
      let existing = null;

      if (contact.email || contact.phone) {
        const orConditions = [];
        if (contact.email) orConditions.push({ email: contact.email });
        if (contact.phone) orConditions.push({ phone: contact.phone });

        existing = await Contact.findOne({
          userId,
          $or: orConditions,
        });
      }

      if (!existing) {
        await Contact.create({ ...contact, userId });
        results.inserted++;
      } else {
        if (deduplication === 'create') {
          results.skipped++;
        } else if (deduplication === 'update') {
          await Contact.updateOne(
            { _id: existing._id },
            { $set: { ...contact } }
          );
          results.updated++;
        } else if (deduplication === 'overwrite') {
          await Contact.deleteOne({ _id: existing._id });
          await Contact.create({ ...contact, userId });
          results.overwritten++;
        }
      }
    }


    return res.status(200).json({
      message: 'Contacts processed successfully',
      results,
    });
  } catch (err) {
    console.error('Error importing contacts:', err);
    return res.status(500).json({ error: 'Failed to import contacts' });
  }
});

module.exports = router;
