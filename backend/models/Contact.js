const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Accept any fields
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model('Contact', ContactSchema);
