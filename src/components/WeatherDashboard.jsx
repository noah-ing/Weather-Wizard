import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const WeatherDashboard = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");

  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_OPENWEATHERMAP_API_KEY}`,
      );
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      setWeatherData(data);
      fetchForecast();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_OPENWEATHERMAP_API_KEY}`,
      );
      if (!response.ok) {
        throw new Error("Forecast not found");
      }
      const data = await response.json();
      const fiveDayForecast = data.list
        .filter((forecast, index) => index % 8 === 0)
        .slice(0, 5);
      setForecastData(fiveDayForecast);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      fetchWeatherData();
    }
  };

  const resetForm = () => {
    setCity("");
    setWeatherData(null);
    setForecastData(null);
    setError(null);
  };

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  };

  const getBackgroundGradient = (tempCelsius) => {
    if (tempCelsius <= 0) return "bg-gradient-to-br from-blue-900 to-blue-700";
    if (tempCelsius <= 10) return "bg-gradient-to-br from-blue-700 to-blue-500";
    if (tempCelsius <= 20)
      return "bg-gradient-to-br from-blue-500 to-green-400";
    if (tempCelsius <= 30)
      return "bg-gradient-to-br from-green-400 to-yellow-300";
    return "bg-gradient-to-br from-yellow-400 to-red-500";
  };

  const convertTemperature = (temp, toUnit) => {
    if (toUnit === "imperial") {
      return (temp * 9) / 5 + 32;
    }
    return temp;
  };

  const formatTemperature = (temp) => {
    const convertedTemp = convertTemperature(temp, unit);
    return `${Math.round(convertedTemp)}°${unit === "metric" ? "C" : "F"}`;
  };

  return (
    <div
      className={`min-h-screen ${
        weatherData
          ? getBackgroundGradient(weatherData.main.temp)
          : "bg-gradient-to-br from-blue-200 to-blue-100"
      } transition-all duration-500 py-8`}
    >
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Weather Wizard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow"
              />
              <Button onClick={fetchWeatherData} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
            <div className="flex justify-between mb-6">
              <Button onClick={resetForm} variant="outline">
                Reset
              </Button>
              <Button onClick={toggleUnit} variant="outline">
                {unit === "metric" ? "Switch to °F" : "Switch to °C"}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            {weatherData && (
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {weatherData.name}, {weatherData.sys.country}
                </h2>
                <p className="text-5xl font-bold my-4 text-gray-900">
                  {formatTemperature(weatherData.main.temp)}
                </p>
                <p className="text-xl text-gray-700 capitalize">
                  {weatherData.weather[0].description}
                </p>
                <div className="mt-4 flex justify-center space-x-8">
                  <p className="text-gray-700">
                    Humidity: {weatherData.main.humidity}%
                  </p>
                  <p className="text-gray-700">
                    Wind Speed:{" "}
                    {unit === "metric"
                      ? weatherData.wind.speed
                      : (weatherData.wind.speed * 2.237).toFixed(2)}{" "}
                    {unit === "metric" ? "m/s" : "mph"}
                  </p>
                </div>
              </div>
            )}
            {forecastData && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                  5-Day Forecast
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {forecastData.map((day, index) => (
                    <div
                      key={index}
                      className="text-center bg-white/50 rounded-lg p-2"
                    >
                      <p className="font-medium text-gray-800">
                        {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>
                      <img
                        src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                        alt={day.weather[0].description}
                        className="mx-auto w-10 h-10"
                      />
                      <p className="text-sm text-gray-700">
                        {formatTemperature(day.main.temp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherDashboard;
