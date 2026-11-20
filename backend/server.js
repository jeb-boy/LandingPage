require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const pool = require('./db/pool');
const landingRoutes = require('./routes/landingRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}

const app = express();
const PORT = process.env.PORT || 5000;
const openApiDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((v) => v.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (req, res) =>
  res.json({
    message: 'College Management System API',
    documentation: '/docs',
    health: '/api/v1/health',
  })
);

app.get('/api/v1/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', landingRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`College CMS API listening on port ${PORT}`);
});
