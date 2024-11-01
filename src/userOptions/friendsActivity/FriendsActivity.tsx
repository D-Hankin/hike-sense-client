import { useState, useRef, useEffect } from "react";
import { User, Hike, Friend } from "../../User"; 
import Modal from "react-modal";

interface FriendsActivityProps {
  user: User;
}

function FriendsActivity({ user }: FriendsActivityProps) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [isListOpen, setIsListOpen] = useState(true); 
  const componentRef = useRef<HTMLDivElement>(null); 

  const openHikeModal = (hike: Hike) => {
    setSelectedHike(hike);
  };

  const closeHikeModal = () => {
    setSelectedHike(null);
  };

  const closeFriendSelection = () => {
    setSelectedFriend(null);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setIsListOpen(false); 
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '10px',
      backgroundColor: 'darkgreen',
      width: '80%',
      maxWidth: '500px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }
  };

  return isListOpen ? (
    <div
      ref={componentRef}
      style={{
        backgroundColor: "darkgreen",
        border: "3px solid black",
        borderRadius: "10px",
        padding: "10px 30px 10px 10px",
        width: "300px",
        position: "absolute",
        top: "50px",
        left: "5%",
        zIndex: 1000
      }}
    >
      <h2>Friends</h2>
      <ul style={{ listStyleType: "none", textAlign: "left" }}>
        {user.friends.map(friend => (
          <li key={friend.usernameFriend} style={{ margin: "2px" }}>
            <button onClick={() => setSelectedFriend(friend)}>{friend.firstNameFriend}, {friend.usernameFriend}</button>
          </li>
        ))}
      </ul>

      {selectedFriend && (
        <div>
          <h3>{selectedFriend.firstNameFriend}'s Hikes</h3>
          <ul style={{ listStyleType: "none", textAlign: "left" }}>
            {selectedFriend.hikesFriend.map(hike => (
              <li key={hike.name} style={{ margin: "2px" }}>
                <button onClick={() => openHikeModal(hike)}>{hike.name}</button>
              </li>
            ))}
          </ul>
          <button onClick={closeFriendSelection} style={{marginLeft: "30px", width:"85%"}} >Back to Friends</button>
        </div>
      )}

      {selectedHike && (
        <Modal
          isOpen={true}
          onRequestClose={closeHikeModal}
          contentLabel="Hike Details"
          style={modalStyles}
        >
          <h4>{selectedHike.name}</h4>
          <p>Date Created: {selectedHike.dateCreated}</p>
          <p>Completed: {selectedHike.completed ? "Yes" : "No"}</p>
          <p>Start Location: {selectedHike.startLocation.latitude}, {selectedHike.startLocation.longitude}</p>
          <p>Finish Location: {selectedHike.finishLocation.latitude}, {selectedHike.finishLocation.longitude}</p>
          <p>Distance: {selectedHike.distance} km</p>
          <p>Duration: {selectedHike.duration} minutes</p>
          <p>Average Heart Rate: {selectedHike.avgHeartRate} bpm</p>
          <p>Average Temperature: {selectedHike.avgTemp} °C</p>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", gap: "5px" }}>
            <button onClick={closeHikeModal}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  ) : null;
}

export default FriendsActivity;
