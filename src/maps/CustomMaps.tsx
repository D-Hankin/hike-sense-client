import { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import modeUrl  from "../ModeUrl";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "20px",
};

const CustomMap = () => {
  const [markerLocation, setMarkerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [finishLocation, setFinishLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [hikeName, setHikeName] = useState<string>("");
  const [route, setRoute] = useState<string>("");

  const apiKey = import.meta.env.VITE_MAPS_API_KEY || "";
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
          setMarkerLocation({ lat: 55.385, lng: 13.359 });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setMarkerLocation({ lat: 55.385, lng: 13.359 });
    }
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const latLng = event.latLng;
    console.log("Map clicked at: ", latLng);
    if (latLng) {
      const newLocation = { lat: latLng.lat(), lng: latLng.lng() };
      console.log("Setting clicked location to: ", newLocation);
      setClickedLocation(newLocation);
    } else {
      alert("Please select a specific location");
    }
  };

  useEffect(() => {
    if (startLocation && finishLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startLocation,
          destination: finishLocation,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            // Extract distance and duration
            if (result && result.routes && result.routes[0] && result.routes[0].legs && result.routes[0].legs[0]) {
              const leg = result.routes[0].legs[0];
              if (leg.distance && leg.duration) {
                setDistance(leg.distance.text);
                setDuration(leg.duration.text);
                setRoute(result.routes[0].overview_polyline)
              } else {
                console.error("Distance or duration is undefined");
              }
            }
            setShowPopup(true); // Show the popup when directions are set
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
        }
      );
    } else {
      setDirections(null);
      setDistance("");
      setDuration("");
      setShowPopup(false); // Hide the popup if no finish location is set
    }
  }, [startLocation, finishLocation]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: query }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSearchResults(predictions || []);
        } else {
          console.error("Error fetching place predictions:", status);
          setSearchResults([]);
        }
      });
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceSelect = (placeId: string) => {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.getDetails({ placeId: placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        if (place.geometry) {
          const location = place.geometry.location;
          if (location) {
            const newLocation = { lat: location.lat(), lng: location.lng() };
            setMarkerLocation(newLocation);
            setClickedLocation(null);
            setStartLocation(null);
            setFinishLocation(null);
            setSearchResults([]);
            setSearchQuery("");
          } else {
            console.error("Location is undefined");
          }
        } else {
          console.error("Place geometry is undefined");
        }
      } else {
        console.error("Error fetching place details:", status);
      }
    });
  };

  if (!isLoaded) return <div>Loading...</div>;

  const handleSaveBtnClick = () => {
      console.log(startLocation, ", ", finishLocation)
    if (startLocation && finishLocation) {
      const fetchHttp = modeUrl + "/hike/new-hike";
      console.log(fetchHttp);
      const token = "Bearer " + localStorage.getItem("token");
      fetch(fetchHttp, {
        method: "POST",
        headers: {
          "Authorization": token, 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: hikeName,
          startLocation: { latitude: startLocation.lat, longitude: startLocation.lng },
      finishLocation: { latitude: finishLocation.lat, longitude: finishLocation.lng },
          startTime: new Date(),
          finishTime: new Date(),
          distance: parseFloat(distance),
          duration: parseFloat(duration),
          route: route,
          isFavorite: false,
          avgHeartRate: 0,
          avgTemp: 0,
          alerts: [],
          completed: false
        })
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      }).then(data => {
        alert(data)
        console.log('Hike saved successfully:', data);
      }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      })
      .finally(() => {
        setHikeName("");
        setShowPopup(false);
      });
    } else {
      console.error("Start and finish locations must be set before saving the hike.");
    }
  }

  return (
    <div className="map-container" style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search for a location..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ margin: "10px", padding: "8px", borderRadius: "5px", width: "300px" }}
      />
      {searchResults.length > 0 && (
        <ul className="searchResults">
          {searchResults.map((result) => (
            <li key={result.place_id} onClick={() => handlePlaceSelect(result.place_id)}>
              {result.description}
            </li>
          ))}
        </ul>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerLocation || { lat: 55.385, lng: 13.359 }}
        zoom={13}
        onClick={handleMapClick}
      >
        {startLocation && <Marker position={startLocation} />}
        {finishLocation && <Marker position={finishLocation} />}
        {directions && startLocation && finishLocation && (
          <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />
        )}
        {clickedLocation && (
          <InfoWindow position={clickedLocation}>
            <div>
              {!startLocation ? (
                <button
                  onClick={() => {
                    setStartLocation(clickedLocation);
                    setClickedLocation(null);
                  }}
                >
                  Start Hiking Here
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFinishLocation(clickedLocation);
                    setClickedLocation(null);
                  }}
                >
                  Stop Hiking Here
                </button>
              )}
              <button
                onClick={() => {
                  setClickedLocation(null);
                  if (!startLocation) {
                    setStartLocation(null);
                  } else {
                    setFinishLocation(null);
                  }
                }}
              >
                Remove
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <div className="startStopDiv">
        {startLocation ? (
          <div className="startDiv">
            <p>{"Start here - latitude: " + startLocation?.lat.toFixed(2) + ", longitude: " + startLocation?.lng.toFixed(2)}</p>
            <button
              onClick={() => {
                setStartLocation(null);
                setClickedLocation(null); // Allow re-selection after removal
                setDirections(null); // Clear directions if start is removed
                setDistance("");
                setDuration("");
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p>Start here:</p>
          </div>
        )}
        {finishLocation ? (
          <div className="stopDiv">
            <p>{"Finish here - latitude: " + finishLocation?.lat.toFixed(2) + ", longitude: " + finishLocation?.lng.toFixed(2)}</p>
            <button
              onClick={() => {
                setFinishLocation(null);
                setClickedLocation(null); // Allow re-selection after removal
                setDirections(null); // Clear directions if finish is removed
                setDistance("");
                setDuration("");
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p>Finish here:</p>
          </div>
        )}
      </div>
      {showPopup && (
        <div className="popUpHikeDetails">
          <h3>Hike Details</h3>
          <p><strong>Start Location:</strong> {startLocation ? `${startLocation.lat.toFixed(2)}, ${startLocation.lng.toFixed(2)}` : "Not set"}</p>
          <p><strong>Finish Location:</strong> {finishLocation ? `${finishLocation.lat.toFixed(2)}, ${finishLocation.lng.toFixed(2)}` : "Not set"}</p>
          <p><strong>Distance:</strong> {distance}</p>
          <p><strong>Duration:</strong> {duration}</p>
          <input placeholder="Name hike..." value={hikeName} onChange={(e) => setHikeName(e.target.value)}/>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
          <button className="saveBtn" onClick={handleSaveBtnClick}>Save</button>
        </div>
      )}
    </div>
  );
};

export default CustomMap;
