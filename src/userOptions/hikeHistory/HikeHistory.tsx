import { useState, useRef, useEffect } from "react";
import { User, Hike } from "../../User";
import Modal from "react-modal"; 

interface HikeHistoryProps {
  user: User;
}

function HikeHistory({ user }: HikeHistoryProps) {
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [hikes, setHikes] = useState<Hike[]>(user.hikes);
  const [isListOpen, setIsListOpen] = useState(true); 
  const componentRef = useRef<HTMLDivElement>(null);

  const openHikeModal = (hike: Hike) => {
    setSelectedHike(hike);
  };

  const closeHikeModal = () => {
    setSelectedHike(null);
  };

  const toggleFavorite = () => {
    if (selectedHike) {
      const updatedHikes = hikes.map(hike =>
        hike.name === selectedHike.name ? { ...hike, isFavorite: !hike.isFavorite } : hike
      );
      setHikes(updatedHikes);
      setSelectedHike({ ...selectedHike, isFavorite: !selectedHike.isFavorite });
    }
  };

  const deleteHike = () => {
    if (selectedHike) {
      const updatedHikes = hikes.filter(hike => hike.name !== selectedHike.name);
      setHikes(updatedHikes);
      closeHikeModal();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node) &&
        !document.getElementById("hike-modal")?.contains(event.target as Node) 
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
      <h2>Hike History</h2>
      <ul style={{ listStyleType: "none", textAlign: "left" }}>
        {hikes.map(hike => (
          <li key={hike.name} style={{ margin: "2px" }}>
            <button onClick={() => openHikeModal(hike)}>{hike.name}</button>
          </li>
        ))}
      </ul>

      {selectedHike && (
        <Modal
          id="hike-modal" 
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
          <p>Duration: {selectedHike.completed ? `${selectedHike.duration} minutes` : "n/a"}</p>
          <p>Average Heart Rate: {selectedHike.avgHeartRate} bpm</p>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", gap: "5px" }}>
            <button onClick={toggleFavorite} style={{ width: "25%" }}>
              {selectedHike.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>
            <button onClick={deleteHike} style={{ width: "25%" }}>Delete Hike</button>
            <button onClick={closeHikeModal} style={{ width: "25%" }}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  ) : null;
}

export default HikeHistory;
