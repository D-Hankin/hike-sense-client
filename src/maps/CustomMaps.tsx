import { useState } from "react";
import { Map, MapMouseEvent, Marker } from "@vis.gl/react-google-maps";
import "./map.css";
import { InfoWindow } from "@vis.gl/react-google-maps";

const CustomMap = () => {
  // Default marker location (London)
  const [markerLocation] = useState({
    lat: 55.3850,
    lng: 13.3590,
  });
  
  // Store clicked location
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [finishLocation, setFinishLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (event: MapMouseEvent) => {
    const latLng = event.detail.latLng; // Access latLng from event.detail
  
    if (latLng) {
      const lat = latLng.lat; // Access latitude
      const lng = latLng.lng; // Access longitude
      setClickedLocation({ lat, lng }); // Set the clicked location
    } else {
      alert("Please select a specific location");
    }
  };
  

//   const onAddLocation = () => {
//     if (!clickedLocation) return;

//     // Create a Google Maps Geocoder instance
//     const geocoder = new window.google.maps.Geocoder();

//     // Reverse geocode the coordinates to get the place name
//     geocoder.geocode({ location: clickedLocation }, (results, status) => {
//       if (status === "OK") {
//         if (results && results[0]) {
//           setListOfLocations(prevLocations => [
//             ...prevLocations,
//             { name: results[0].formatted_address, location: clickedLocation },
//           ]);
//           setClickedLocation(null); // Clear clicked location after adding
//         }
//       } else {
//         console.error("Geocoder failed due to: " + status);
//       }
//     });
//   };

  return (
    <div className="map-container">
      <Map
        style={{ borderRadius: "20px" }}
        defaultZoom={13}
        defaultCenter={markerLocation}
        gestureHandling={"greedy"}
        disableDefaultUI
        onClick={(mapProps) => handleMapClick(mapProps)}
      >
     {startLocation && <Marker position={startLocation} />}
     {finishLocation && <Marker position={finishLocation} />}
      </Map>
      {startLocation && 
      <>
        <div>{"Start here: " + startLocation?.lat + ", " + startLocation?.lng} </div>
        <button onClick={() => setStartLocation(null)}>Remove</button>
      </>
      }
      {finishLocation &&
      <>
        <div>{"Finish here: " + finishLocation?.lat + ", " + finishLocation?.lng}</div>
        <button onClick={() => setFinishLocation(null)}>Remove</button>
      </>
}

      {clickedLocation && (
        <InfoWindow position={clickedLocation}>
          <button className="app-button" onClick={() => setStartLocation(clickedLocation)}>
            Start Hiking Here
          </button>
          <button className="app-button" onClick={() => setFinishLocation(clickedLocation)}>
            Stop Hiking Here
          </button>
          <button className="app-button" onClick={() => setClickedLocation(null)}>
            Cancel
          </button>
        </InfoWindow>
      )}
    </div>
  );
};

export default CustomMap;
