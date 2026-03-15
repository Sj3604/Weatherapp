import React, { useState, useEffect } from 'react';
import { Cloud, Wind, Droplets, MapPin, AlertTriangle, CheckCircle, Search, Compass, History, Clock } from 'lucide-react';

const WeatherDashboard = ({ onTimeChange }) => {
  const [locationQuery, setLocationQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Example default coordinates (New York) to show on initial load
  useEffect(() => {
    fetchPrediction(40.7128, -74.0060, "New York City (Default)");
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/history');
      if (res.ok) {
        const data = await res.json();
        setSearchHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (locationQuery.trim().length > 2 && showSuggestions) {
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=5&language=en&format=json`);
          const data = await res.json();
          if (data.results) {
            setSuggestions(data.results);
          } else {
            setSuggestions([]);
          }
        } catch (err) {
          console.error("Autocomplete err", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locationQuery, showSuggestions]);

  const handleSuggestionClick = (suggestion) => {
    const name = suggestion.admin1 ? `${suggestion.name}, ${suggestion.admin1}` : `${suggestion.name}, ${suggestion.country}`;
    setLocationQuery(name);
    setShowSuggestions(false);
    fetchPrediction(suggestion.latitude, suggestion.longitude, name);
  };

  const fetchPrediction = async (lat, lon, name) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon, locationName: name })
      });

      if (!response.ok) throw new Error('Failed to fetch prediction');

      const data = await response.json();
      setWeatherData(data);
      if (data.localHour !== undefined && onTimeChange) {
        onTimeChange(data.localHour);
      }
      fetchHistory();
    } catch (err) {
      setError(err.message || 'An error occurred fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    setLoading(true);
    // Rough geocoding using free Nominatim API for demo purposes
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        const { lat, lon, display_name } = geoData[0];
        await fetchPrediction(parseFloat(lat), parseFloat(lon), display_name.split(',')[0]);
      } else {
        setError('Location not found. Try a different city.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to search location.');
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header section */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-3">
          <Wind className="w-10 h-10 text-[var(--primary)]" />
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-purple-400 m-0">
            WindPredictor
          </h1>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
          <input
            type="text"
            placeholder="Search city to calculate live wind & prediction..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-full py-3 pl-5 pr-12 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all glass-panel"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--primary)] rounded-full hover:bg-purple-500 transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-xl shadow-2xl overflow-hidden z-50 glass-panel">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 hover:bg-[var(--border-glass)] cursor-pointer text-left flex items-center gap-3 transition-colors border-b last:border-b-0 border-[var(--border-glass)]"
                  onClick={() => handleSuggestionClick(s)}
                >
                  <MapPin className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium text-[var(--text-main)] truncate">{s.name}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl flex flex-col gap-6">
        {error && (
          <div className="glass-panel border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-pulse-soft">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Wind className="w-12 h-12 text-[var(--primary)] animate-spin" />
            <p className="text-slate-400 text-lg">Analyzing atmospheric conditions...</p>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Live Weather Stats */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[80px] opacity-30 -mr-10 -mt-10"></div>

                <div className="flex items-center gap-2 text-slate-400 mb-6">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-medium m-0 truncate">{weatherData.location}</h2>
                </div>

                <div className="flex items-end gap-2 mb-8">
                  <span className="text-7xl font-light text-white leading-none">
                    {Math.round(weatherData.currentWeather?.temperatureC)}°
                  </span>
                  <span className="text-2xl text-slate-400 mb-2">C</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-glass)] flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Wind className="w-4 h-4" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <span className="text-2xl font-semibold text-[var(--text-main)]">
                      {weatherData.currentWeather?.windSpeedKmH} <span className="text-sm font-normal text-[var(--text-muted)]">km/h</span>
                    </span>
                  </div>

                  <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-glass)] flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <span className="text-2xl font-semibold text-[var(--text-main)]">
                      {weatherData.currentWeather?.humidity}<span className="text-sm font-normal text-[var(--text-muted)]">%</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Prediction Logic */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Massive prediction banner */}
              <div className={`glass-panel p-8 rounded-3xl border-l-4 relative overflow-hidden ${weatherData.prediction?.severity === 'high' ? 'border-l-red-500' :
                  weatherData.prediction?.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}>

                <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">AI Output</h3>
                <h2 className={`text-3xl md:text-xl font-bold mb-6 ${getSeverityColor(weatherData.prediction?.severity)}`}>
                  {weatherData.prediction?.status}
                </h2>

                <div className="flex items-center gap-6">
                  {/* Probability Circle */}
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="stroke-slate-700 fill-none stroke-[8]" />
                      <circle
                        cx="64" cy="64" r="56"
                        className={`fill-none stroke-[8] stroke-current ${getSeverityColor(weatherData.prediction?.severity)}`}
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - weatherData.prediction?.probabilityPercent / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{weatherData.prediction?.probabilityPercent}%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">Risk</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {weatherData.prediction?.contributingFactors?.map((factor, i) => (
                      <div key={i} className="flex gap-3 text-slate-300">
                        <CheckCircle className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wind compass feature */}
              <div className="glass-panel p-6 rounded-3xl flex items-center gap-6 mt-auto">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border-glass)] relative text-[var(--primary)]">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-[var(--text-muted)] text-sm mb-1">Dominant Wind Direction</h4>
                  <p className="text-xl font-semibold text-[var(--text-main)]">
                    {weatherData.currentWeather?.windDirectionDegrees}° {weatherData.currentWeather?.windDirectionText}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : null}

        {/* History Section */}
        {searchHistory.length > 0 && (
          <div className="mt-8 glass-panel p-6 rounded-3xl w-full text-left">
            <div className="flex items-center gap-2 mb-6 text-slate-300">
              <History className="w-5 h-5" />
              <h3 className="text-xl font-semibold m-0">Recent Searches</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {searchHistory.map((item, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-2xl p-4 flex flex-col gap-2 hover:bg-[var(--bg-dark)] transition-colors cursor-pointer" onClick={() => fetchPrediction(item.latitude, item.longitude, item.location)}>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-[var(--text-main)] truncate pr-2 max-w-[85%]">{item.location}</span>
                    <Clock className="w-3 h-3 text-[var(--text-muted)] mt-1 shrink-0" />
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="text-sm text-[var(--text-muted)]">
                      {Math.round(item.windSpeed)} km/h
                    </div>
                    <div className={`text-[10px] px-2 py-1 rounded-full border truncate ml-2 ${String(item.prediction).includes('High risk') ? 'bg-red-500/10 border-red-500/30 text-red-400' : String(item.prediction).includes('Moderate') ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                      {String(item.prediction).split(' ')[0]} Risk
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherDashboard;
