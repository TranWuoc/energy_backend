const express = require('express');
const cors = require('cors');

const buildingRoutes = require('./routes/building.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/buildings', buildingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;