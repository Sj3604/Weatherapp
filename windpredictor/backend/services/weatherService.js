const axios = require('axios');

class WeatherService {
    /**
     * Fetch live data from Open-Meteo API (No API key needed)
     * @param {number} lat 
     * @param {number} lon 
     */
    async getLiveData(lat, lon) {
        try {
            // Open-Meteo provides free, reliable real-time forecasting
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`;
            const response = await axios.get(url);
            
            const current = response.data.current;
            
            let localHour = new Date().getHours();
            if (current.time) {
                // current.time format is typically "YYYY-MM-DDTHH:mm"
                try {
                    localHour = parseInt(current.time.split('T')[1].split(':')[0]);
                } catch (e) {
                    console.error("Error parsing localHour, using server fallback.");
                }
            }

            return {
                temperatureC: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                windSpeedKmH: current.wind_speed_10m,
                windDirectionDegrees: current.wind_direction_10m,
                windDirectionText: this.getWindDirectionText(current.wind_direction_10m),
                timestamp: current.time,
                localHour: localHour
            };
        } catch (error) {
            console.error("Error fetching live weather data:", error.message);
            // Fallback mock data if API fails to ensure platform stability
            return {
                temperatureC: 25,
                humidity: 75,
                windSpeedKmH: 22.5,
                windDirectionDegrees: 180,
                windDirectionText: 'South',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Converts wind degrees to cardinal directions
     */
    getWindDirectionText(degrees) {
        const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest', 'North'];
        const index = Math.round((degrees % 360) / 45);
        return directions[index];
    }

    /**
     * Predicts weather disturbance (e.g. rain, storms) purely based on wind direction and humidity heuristics.
     * Note: This is an algorithmic heuristic model, simulating an ML prediction.
     */
    predictDisturbance(windDirectionDegrees, humidity, windSpeed) {
        let disturbanceProbability = 0;
        let reasons = [];

        // 1. Humidity factor
        if (humidity > 85) {
            disturbanceProbability += 50;
            reasons.push("High humidity suggests moisture buildup.");
        } else if (humidity > 70) {
            disturbanceProbability += 30;
            reasons.push("Moderate humidity present.");
        } else if (humidity < 40) {
            disturbanceProbability -= 20;
            reasons.push("Low humidity decreases precipitation chances.");
        }

        // 2. Wind Direction factor
        // Typically, maritime winds (e.g. Southerly/Southwesterly in Northern Hemisphere) bring moisture.
        // We'll use a general heuristic: South/Southwest/West winds are often rain-bearing in many temperate zones.
        const dir = this.getWindDirectionText(windDirectionDegrees);
        if (['South', 'Southwest', 'West'].includes(dir)) {
            disturbanceProbability += 25;
            reasons.push(`Winds from the ${dir} often carry moisture-laden systems.`);
        } else if (['North', 'East'].includes(dir)) {
            disturbanceProbability -= 10;
            reasons.push(`Dry continental winds from the ${dir} reduce storm chances.`);
        }

        // 3. Wind Speed factor (High wind + high humidity = storm)
        if (windSpeed > 35 && humidity > 70) {
            disturbanceProbability += 25;
            reasons.push("High wind speeds combined with moisture strongly indicate an incoming storm or squall.");
        } else if (windSpeed < 5) {
            // Very calm winds might mean stagnation or fog if humidity is high, but lower severe storm risk
            disturbanceProbability -= 5;
        }

        // Clip probability between 0 and 100
        disturbanceProbability = Math.max(0, Math.min(100, disturbanceProbability));

        // Determine outcome classification
        let status = "Clear / No Significant Disturbance";
        let severity = "low";
        
        if (disturbanceProbability >= 80) {
            status = "High risk of Rain / Severe Weather Disturbance";
            severity = "high";
        } else if (disturbanceProbability >= 50) {
            status = "Moderate likelihood of Rain Showers";
            severity = "medium";
        }

        return {
            probabilityPercent: disturbanceProbability,
            status: status,
            severity: severity,
            contributingFactors: reasons
        };
    }
}

module.exports = new WeatherService();
