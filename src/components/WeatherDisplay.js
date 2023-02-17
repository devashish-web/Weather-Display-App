import React, { useState } from 'react';
import axios from 'axios';
import './WeatherDisplay.css';



const WeatherDisplay = () => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastWeather, setForecastWeather] = useState(null);
  const [unit, setUnit] = useState("C");


  const handleInputChange = (event) => {
    const newCity = event.target.value;
    setCity(newCity);

    if (newCity.length >= 3) {
      axios.get(`https://api.weatherapi.com/v1/search.json?key=362e9ca5ace44d1389a72647231602&q=${newCity}`)
        .then(response => {
          setSuggestions(response.data.map(item => item.name));
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
  };

  const handleGetWeatherClick = () => {
    setLoading(true);
    setError('');
    setCurrentWeather(null);
    setForecastWeather(null);

    axios.get(`https://api.weatherapi.com/v1/current.json?key=362e9ca5ace44d1389a72647231602&q=${city}&unit=${unit === "C" ? "c" : "f"}`)

      .then(response => {
        setCurrentWeather(response.data.current);
        return axios.get(`https://api.weatherapi.com/v1/forecast.json?key=362e9ca5ace44d1389a72647231602&q=${city}&days=5&unit=${unit === "C" ? "c" : "f"}`)

      })
      .then(response => {
        setForecastWeather(response.data.forecast);
      })
      .catch(error => {
        setError('Failed to get weather data');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        axios.get(`https://api.weatherapi.com/v1/current.json?key=362e9ca5ace44d1389a72647231602&q=${latitude},${longitude}&unit=${unit === "C" ? "c" : "f"}`)
          .then(response => {
            setCurrentWeather(response.data.current);
            return axios.get(`https://api.weatherapi.com/v1/forecast.json?key=362e9ca5ace44d1389a72647231602&q=${latitude},${longitude}&days=5&unit=${unit === "C" ? "c" : "f"}`)
          })
          .then(response => {
            setForecastWeather(response.data.forecast);
          })
          .catch(error => {
            setError('Failed to get weather data');
          })
          .finally(() => {
            setLoading(false);
          });
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    
    <div className="weather-display">
      <h1>Weather Display</h1>

      <div className="input-section">
        <label htmlFor="city-input">City:</label>
        <div className="autocomplete">
          <input
            id="city-input"
            type="text"
            value={city}
            onChange={handleInputChange}
            placeholder="Enter a city name"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((item, index) => (
                <li key={index} onClick={() => handleSuggestionClick(item)}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className='btn'>
        <button onClick={handleGetWeatherClick}>Get Weather</button>
        </div>
      </div>
    <div className="unit-section">
       <p>Celsius or Farenheit?</p> 
        
        <button className={unit === "C" ? "active" : ""} onClick={() => setUnit("C")}>C</button>
        <button className={unit === "F" ? "active" : ""} onClick={() => setUnit("F")}>F</button>
        
    </div>
    <button onClick={handleGetCurrentLocation}>Use Current Location</button>

    {loading && (
      <div className="loading">Loading...</div>
    )}

    {error && (
      <div className="error">{error}</div>
    )}

      {currentWeather && forecastWeather && (
        <div className="weather-info">
          <div className="current-weather">
          <div className="temperature">{unit === "C" ? currentWeather.temp_c : currentWeather.temp_f}°{unit}</div>

            <div className="condition">{currentWeather.condition.text}</div>
            <div className="other-info">
              <div className="wind">Wind: {currentWeather.wind_kph} km/h</div>
              <div className="humidity">Humidity: {currentWeather.humidity}%</div>
              <div className="cloudiness">Cloudiness: {currentWeather.cloud}%</div>
              <div className="visibility">Visibility: {currentWeather.vis_km} km
              </div>
        </div>
      </div>
      <div className="forecast-weather">
        {forecastWeather.forecastday.map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="date">{day.date}</div>
            Max:
            <div className="max_temperature">{unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f}°{unit}</div>

            Min:
            <div className="min_temperature">{unit === "C" ? day.day.mintemp_c : day.day.mintemp_f}°{unit}</div>

            <div className="condition">{day.day.condition.text}</div>

          </div>
        ))}
      </div>
    </div>
  )}

  {!currentWeather && !forecastWeather && (
    <div className="placeholder-text">Enter a city to see the weather</div>
  )}
</div>
);
};

export default WeatherDisplay;


