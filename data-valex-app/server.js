// server.js or index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/validate', (req, res) => {
  const data = req.body.data;
  // Perform validation logic here
  res.json({ message: 'Validation successful', data });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});