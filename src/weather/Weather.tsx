import ReactWeather, { useOpenWeather }  from 'react-open-weather';

function Weather() {

    const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY || '';

    const { data, isLoading, errorMessage } = useOpenWeather({
      key: weatherApiKey,
      lat: '48.137154',
      lon: '11.576124',
      lang: 'en',
      unit: 'metric',
    });

  return (
    //@ts-ignore
        <ReactWeather
            isLoading={isLoading}
            errorMessage={errorMessage}
            data={data}
            lang="en"
            locationLabel="Munich"
            unitsLabels={{ temperature: 'C', windSpeed: 'Km/h' }}
            showForecast
        />
    
  )
}

export default Weather