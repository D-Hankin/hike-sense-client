import React, { useEffect, useState } from "react";
import { DirectionsRenderer, GoogleMap, Marker } from "@react-google-maps/api";
import "./latestHike.css"
import { Hike, User } from "../User";

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
        <div className="latestHikeTitle">
          <h2>Latest Hike</h2>
        </div>
        {latestHike && <h3 className="latestHikeTitle">{latestHike.name}</h3>}
      </div>
      <div className="mapDiv">
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
      </div>
    </>
  );
}

export default LatestHike;
