import { APIProvider } from '@vis.gl/react-google-maps';
import CustomMap from './CustomMaps';
import './map.css';

function Maps() {

  const apiKey = import.meta.env.VITE_MAPS_API_KEY || '';

  return (
    <div className='map-container'>
        <APIProvider apiKey={apiKey}>
            <CustomMap />
        </APIProvider>
    </div>
  )
}

export default Maps