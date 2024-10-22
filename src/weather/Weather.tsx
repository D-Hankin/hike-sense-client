import { useEffect, useState } from "react";

interface WeatherParams {
  latitude: number;
  longitude: number;
  hourly: string;
}

function Weather() {
  const [weatherParams, setWeatherParams] = useState<WeatherParams | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setWeatherParams({
              latitude: latitude,
              longitude: longitude,
              hourly: "temperature_2m", // Added necessary fields
            });
            console.log(latitude, ",", longitude);
          },
          (error) => {
            console.error("Error getting location: ", error);
            setError("Could not retrieve location.");
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        setError("Geolocation not supported.");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!weatherParams) return;
  
      setLoading(true);
      const { latitude, longitude } = weatherParams;
  
      // Construct the URL for the Visual Crossing Weather API
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY; // Replace with your actual API key
      const currentDateTime = new Date().toISOString(); // Get the current date and time in ISO format
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/${currentDateTime}?key=${apiKey}&include=current`;
  
      try {
          const response = await fetch(url);
          if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(`Network response was not ok: ${JSON.stringify(errorDetails)}`);
          }
          const data = await response.json();
  
          // Extract relevant current weather information
          const currentWeather = {
              temperature: data.currentConditions.temp, // Temperature
              conditions: data.currentConditions.conditions, // Weather conditions (e.g., sunny, cloudy)
              windSpeed: data.currentConditions.windspeed, // Wind speed
          };
  
          console.log("data: ", data); // Log the current weather data
          setWeatherData(currentWeather); // Update state with current weather data
      } catch (error) {
          console.error('Error fetching weather data: ', error);
          setError("Failed to fetch weather data."); // Updated error message
      } finally {
          setLoading(false);
      }
  };  
  
  // Call the fetchData function
  fetchData();
  
  }, [weatherParams]);

  return (
    <>
      <div>
        <h3>Your Weather</h3>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {weatherData && weatherData.hourly && (
          <div>
            <h4>Current Weather</h4> 
            <p>Temperature: {weatherData.temperature}°C</p>
            <p>Conditions: {weatherData.current_weather.weathercode}</p>
            <p>windSpeed: {weatherData.current_weather.windspeed}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Weather;
