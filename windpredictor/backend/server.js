const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const weatherService = require('./services/weatherService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load Swagger document if exists
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yml'));
  // Set up Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger documentation configured at /api-docs');
} catch (err) {
  console.log('Swagger docs not found yet or error loading:', err.message);
}

// Database Connection
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT,
      windSpeed REAL,
      windDirection TEXT,
      humidity REAL,
      prediction TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      // Run safe migrations for new columns
      db.run(`ALTER TABLE predictions ADD COLUMN latitude REAL`, () => { });
      db.run(`ALTER TABLE predictions ADD COLUMN longitude REAL`, () => { });
    });
  }
});

// API Routes

/**
 * Request real-time weather and our custom wind disturbance prediction
 */
app.post('/api/predict', async (req, res) => {
  try {
    const { latitude, longitude, locationName } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    // Fetch live weather data
    const weatherData = await weatherService.getLiveData(latitude, longitude);

    // Predict disturbance using our proprietary heuristic model
    const prediction = weatherService.predictDisturbance(
      weatherData.windDirectionDegrees,
      weatherData.humidity,
      weatherData.windSpeedKmH
    );

    const result = {
      location: locationName || 'Unknown Location',
      latitude: latitude,
      longitude: longitude,
      currentWeather: weatherData,
      prediction: prediction
    };

    // Log result to DB
    db.run(
      `INSERT INTO predictions (location, windSpeed, windDirection, humidity, prediction, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.location, weatherData.windSpeedKmH, weatherData.windDirectionText, weatherData.humidity, prediction.status, latitude, longitude],
      function (err) {
        if (err) console.error('Error saving prediction to DB:', err);
      }
    );

    res.json(result);

  } catch (error) {
    console.error('Prediction Error:', error);
    res.status(500).json({ error: 'Failed to generate prediction. ' + error.message });
  }
});

app.get('/api/history', (req, res) => {
  db.all(`SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 5`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running vertically on port ${PORT}`);
});
