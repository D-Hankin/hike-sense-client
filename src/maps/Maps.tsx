import { APIProvider } from '@vis.gl/react-google-maps';
import CustomMap from './CustomMaps';
import './map.css';

function Maps() {

  return (
    <div className='map-container'>
        <APIProvider apiKey={'AIzaSyBLEMUq4fvXOzSHhDC_qS81gbM7SLsnWbk'}>
            <CustomMap />
        </APIProvider>
    </div>
  )
}

export default Maps