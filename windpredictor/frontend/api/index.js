import express from 'express';
import cors from 'cors';
import weatherService from './_services/weatherService.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ephemeral in-memory history for Vercel (since it's a read-only filesystem)
let memoryHistory = [];

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
      prediction: prediction,
      windSpeed: weatherData.windSpeedKmH,
      timestamp: new Date().toISOString()
    };

    // Save to ephemeral memory history
    memoryHistory.unshift(result);
    // Keep only the last 5
    if (memoryHistory.length > 5) {
      memoryHistory.pop();
    }

    res.json(result);

  } catch (error) {
    console.error('Prediction Error:', error);
    res.status(500).json({ error: 'Failed to generate prediction. ' + error.message });
  }
});

app.get('/api/history', (req, res) => {
  res.json(memoryHistory);
});

// Export the app for Vercel Serverless (must be export default for ESM)
export default app;
