import React, { useEffect, useState } from "react";
import { DirectionsRenderer, GoogleMap, Marker } from "@react-google-maps/api";
import "./latestHike.css"

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
  route: string;
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

const containerStyle = {
  width: "500px",
  height: "500px",
  borderRadius: "20px",
};

const LatestHike: React.FC<Props> = (props) => {
  const [latestHike, setLatestHike] = useState<Hike | null>(null);
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [finishLocation, setFinishLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<any>(null);

  useEffect(() => {
    const completedHike = props.user.hikes.find(hike => hike.completed);
    if (completedHike) {
      console.log('Completed Hike:', completedHike);
      setLatestHike(completedHike);
      setStartLocation({
        lat: completedHike.startLocation.latitude,
        lng: completedHike.startLocation.longitude
      })
      setFinishLocation({
        lat: completedHike.finishLocation.latitude,
        lng: completedHike.finishLocation.longitude
      })
    }
  }, [props.user.hikes]);

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
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [startLocation, finishLocation]);

  return (
    <>
      <div>
        <h3>Latest Hike</h3>
        {latestHike && <h3>{latestHike.name}</h3>}
      </div>
      {startLocation && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={startLocation}
          zoom={13}
        >
          {startLocation && <Marker position={startLocation} icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png" />}
          {finishLocation && <Marker position={finishLocation} />}
          <Marker position={startLocation} />
          {finishLocation && <Marker position={finishLocation} />}
          {directions && (
            <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />
          )}
        </GoogleMap>
      )}
      {latestHike && (
        <ul className="hikeInfo">  
            <li>Distance: {latestHike.distance} meters</li>
            <li>Time taken: {latestHike.duration} minutes</li>
            <li>Avg. heartrate: {latestHike.avgHeartRate} bpm</li>
        </ul>
      )}
    </>
  );
}

export default LatestHike;
