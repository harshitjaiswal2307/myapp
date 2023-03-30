const express = require('express');
const app = express();
const authRoutes = require('./routes/userRoute');

app.use(express.json());
app.use('/api', authRoutes);

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(3000, () => console.log('Server started on http://localhost:3000'));

module.exports = app;