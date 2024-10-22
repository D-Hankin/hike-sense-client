import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polyline } from "@react-google-maps/api";

interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  hikes: Hike[];
  friends: string[];
  subscriptionStatus: string;
}

interface Hike {
  name: string;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  finishLocation: {
    latitude: number;
    longitude: number;
  };
  startTime: string;
  finishTime: string;
  distance: number;
  duration: number;
  route: string; // This is the encoded polyline
  isFavorite: boolean;
  avgHeartRate: number;
  avgTemp: number;
  alerts: Alert[];
  completed: boolean;
}

interface Alert {
  alertType: string;
  information: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface Props {
  user: User;
}

const LatestHike: React.FC<Props> = (props) => {
  const [latestHike, setLatestHike] = useState<Hike | null>(null);
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null); // Create a ref for the map

  const decodePolyline = (encoded: string): { lat: number; lng: number }[] => {
    const coordinates: { lat: number; lng: number }[] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result >> 1) ^ -(result & 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result >> 1) ^ -(result & 1));
      lng += dlng;

      coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return coordinates;
  };

  const fitMapBounds = () => {
    if (mapRef.current && path.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(new window.google.maps.LatLng(point.lat, point.lng)));
      mapRef.current.fitBounds(bounds); // Fit the bounds to the path
    }
  };

  useEffect(() => {
    const completedHike = props.user.hikes.find(hike => hike.completed);
    if (completedHike) {
      setLatestHike(completedHike);
      const decodedPath = decodePolyline(completedHike.route);
      console.log(decodedPath); // Log to check the path
      setPath(decodedPath);
    }
  }, [props.user.hikes]);

  useEffect(() => {
    fitMapBounds(); // Adjust map bounds whenever the path changes
  }, [path]);

  return (
    <>
      <div>
        <h3>Latest Hike</h3>
        {latestHike && <h3>{latestHike.name}</h3>}
      </div>
      <div>
        {path.length > 0 && (
          <GoogleMap
            onLoad={map => {
              mapRef.current = map;
            }}
            mapContainerStyle={{ width: "500px", height: "500px", borderRadius: "20px" }}
            center={{
              lat: path.length > 0 ? path[0].lat : 0, // Prevent centering when path is empty
              lng: path.length > 0 ? path[0].lng : 0,
            }}
            zoom={12} // This can be adjusted
          >
            <Polyline
              path={path}
              options={{
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          </GoogleMap>
        )}
      </div>
      <ul className="hikeInfo">
        {latestHike && (
          <>
            <li>Distance: {latestHike.distance} meters</li>
            <li>Time taken: {latestHike.duration} minutes</li>
            <li>Avg. heartrate: {latestHike.avgHeartRate} bpm</li>
          </>
        )}
      </ul>
    </>
  );
}

export default LatestHike;
