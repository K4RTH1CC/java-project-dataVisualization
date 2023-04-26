const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Webpage.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const filePath = path.join(__dirname, 'uploads', file.filename);
  const destPath = path.join(__dirname, 'uploads', file.originalname);

  fs.rename(filePath, destPath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else {
      // Save the file to the database or file system
      console.log(`File ${file.originalname} uploaded successfully`);

      // Redirect the user to the dashboard page
      res.redirect('dashboard.html');
    }
  });
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
