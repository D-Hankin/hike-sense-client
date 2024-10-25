import { useEffect, useState } from "react";
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaWind, FaCloudSun} from "react-icons/fa"; // Example for icons
import "./weather.css";
import "../App.css";

interface WeatherParams {
  latitude: number;
  longitude: number;
  hourly: string;
}

interface WeatherConditions {
  temp: number;
  feelsLike: number;
  conditions: string;
  windSpeed: number;
  windDirection: number;
  precipProb: number;
  sunrise: string;
  sunset: string;
}

function Weather() {
  const [weatherParams, setWeatherParams] = useState<WeatherParams | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherConditions>({} as WeatherConditions);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  // Function to map conditions to icons
  const getWeatherIcon = (conditions: string) => {
    switch (conditions?.toLowerCase()) {
      case "clear":

      case "sunny":
        return <FaSun />;
      case "cloudy":
        return <FaCloud />;
      case "rain":
        return <FaCloudRain />;
      case "drizzle":
        return <FaCloudRain />;
      case "snow":
        return <FaSnowflake />;
      case "partially cloudy":
        return <FaCloudSun />;
      default:
        return <FaWind />;
    }
  };

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
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/${currentDateTime}?key=${apiKey}&include=current&unitGroup=metric`;
  
      try {
          const response = await fetch(url);
          if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(`Network response was not ok: ${JSON.stringify(errorDetails)}`);
          }
          const data = await response.json();
          setLocation(data.resolvedAddress);
  
          // Extract relevant current weather information
          const currentWeather = {
              temp: data.currentConditions.temp, // Temperature
              conditions: data.currentConditions.conditions, // Weather conditions (e.g., sunny, cloudy)
              windSpeed: data.currentConditions.windspeed,
              precipProb: data.currentConditions.precipprob,
              sunrise: data.currentConditions.sunrise,
              sunset: data.currentConditions.sunset,
              feelsLike: data.currentConditions.feelslike,
              windDirection: data.currentConditions.winddir,
          };
  
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

  const getWindDirection = (degrees: number) => {
    const directions = [
      "North",     // 0 degrees
      "North-East", // 45 degrees
      "East",      // 90 degrees
      "South-East", // 135 degrees
      "South",     // 180 degrees
      "South-West", // 225 degrees
      "West",      // 270 degrees
      "North-West", // 315 degrees
      "North"      // 360 degrees (or 0 degrees)
    ];
    
    const index = Math.round(degrees / 45) % 8; // Calculate index for the direction
    return directions[index];
  };

  return (
    <>
      <div className="weather-container">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {weatherData && (
          <div>
            <h4>Current Weather</h4>
            <p>Location: {location} </p>
            <div style={{ fontSize: "50px", margin: "20px 0" }}>
              {getWeatherIcon(weatherData.conditions)}
            </div>
            <p><strong>Temperature:</strong> {weatherData.temp}°C</p>
            <p><strong>Conditions:</strong> {weatherData.conditions}</p>
            <p><strong>Feels Like:</strong> {weatherData.feelsLike}°C</p>
            <p><strong>Wind Speed:</strong> {weatherData.windSpeed} km/h</p>
            <p><strong>Wind Direction:</strong> {getWindDirection(weatherData.windDirection)}</p>
            <p><strong>Precipitation Probability:</strong> {weatherData.precipProb}%</p>
            <p><strong>Sunrise:</strong> {weatherData.sunrise}</p>
            <p><strong>Sunset:</strong> {weatherData.sunset}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Weather;
