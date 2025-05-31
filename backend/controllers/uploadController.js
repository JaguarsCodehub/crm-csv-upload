const Contact = require('../models/Contact');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'tmp/' }).single('file');

exports.parseCSV = (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).send(err.message);

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(req.file.path);
        res.json({
          preview: results.slice(0, 5),
          headers: Object.keys(results[0]),
        });
      });
  });
};

exports.importContacts = async (req, res) => {
  const { mappedData } = req.body; // Array of { field1: val1, field2: val2 }
  const { id: userId, companyName } = req.user;

  const docs = mappedData.map((d) => ({
    uploadedBy: userId,
    companyId: companyName,
    data: d,
  }));

  await Contact.insertMany(docs);
  res.json({ message: 'Contacts uploaded', count: docs.length });
};
