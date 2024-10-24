import "../globals.ts";
import { useEffect, useState, useRef } from 'react';
import FriendsChat from './friendsChat/FriendsChat';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import modeUrl from '../ModeUrl';
import { User } from "../User.ts";

interface FriendsOnlineProps {
  user: User;
}

function FriendsOnline(props: FriendsOnlineProps) {
  const [friendSelected, setFriendSelected] = useState<string>('');
  const [friendsOnline, setFriendsOnline] = useState<string[]>([]);
  const [addFriend, setAddAFriend] = useState<string>('');
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const stompClientRef = useRef<Client | null>(null); // Create a ref for stompClient

  useEffect(() => {
    const token = "Bearer " + localStorage.getItem('token');
    console.log('token: ', token);
    const websocketUrl = modeUrl + `/ws?token=${token}`; 
    const socket = new SockJS(websocketUrl);
    const stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to websocket');

        // Subscribe to online status of friends
        props.user.friends.forEach((friend) => {  
          console.log('Subscribing to friend:', friend.usernameFriend);
          stompClient.subscribe('/topic/online-status/' + friend.usernameFriend, () => {
            setFriendsOnline((prevFriendsOnline) => [...prevFriendsOnline, friend.usernameFriend]);
          });
        });

        // Subscribe to incoming friend requests
        stompClient.subscribe('/topic/friend-requests/' + props.user.username, (message) => {
          const request = JSON.parse(message.body);
          setFriendRequests((prevRequests) => [...prevRequests, request.sender]);
        });
      },
      onStompError: (error: any) => {
        console.error('Error with STOMP connection:', error);
      }
    });

    stompClientRef.current = stompClient; // Store stompClient in the ref
    stompClient.activate();

    return () => {
      stompClient.deactivate();
    }
  }, [props.user]);

  const handleAddFriendBtnClick = async () => {
    if (addFriend.trim() === '') return; // Prevent empty requests
    const token = "Bearer " + localStorage.getItem('token');

    // Use the stompClient stored in the ref
    if (stompClientRef.current) {
      const request = { sender: props.user.username, receiver: addFriend };
      stompClientRef.current.publish({
        destination: '/app/friend-requests', // Adjust this based on your server's endpoint
        body: JSON.stringify(request),
        headers: { Authorization: token }
      });
      setAddAFriend(''); // Clear input after sending
    } else {
      console.error('STOMP client is not connected');
    }
  };

  const handleFriendClick = (friend: string) => {
    setFriendSelected(friend); // Set the selected friend for chat
  };

  const handleDeclineBtnClick = (request: string) => {
    if (stompClientRef.current) {
      const response = { 
        sender: props.user.username, 
        receiver: request, 
        status: 'declined' };
      stompClientRef.current.publish({
        destination: '/app/friend-requests/response', // Adjust this based on your server's endpoint
        body: JSON.stringify(response),
      });
      setFriendRequests((prevRequests) => prevRequests.filter(r => r !== request)); // Remove from friend requests
    }
  };

  const handleAcceptBtnClick = (request: string) => {
    if (stompClientRef.current) {
      const response = { sender: props.user.username, receiver: request, status: 'accepted' };
      stompClientRef.current.publish({
        destination: '/app/friend-requests/response', // Adjust this based on your server's endpoint
        body: JSON.stringify(response),
      });
      setFriendRequests((prevRequests) => prevRequests.filter(r => r !== request)); // Remove from friend requests
    }
  };

  return (
    <div>
      <h2>Friends</h2>
      <div className="addFriendDiv">
        <input 
          type="text" 
          placeholder="Add a friend" 
          value={addFriend} 
          onChange={(e) => setAddAFriend(e.target.value)} 
        />
        <button onClick={handleAddFriendBtnClick}>Add</button>
      </div>
      <div className="friendRequestsDiv">
        <h3>Friend Requests</h3>
        <ul>
          {friendRequests.length === 0 ? (
            <li>No new friend requests</li>
          ) : (
            friendRequests.map((request) => (
              <li key={request}>
                {request} wants to be your friend
                <button onClick={() => handleAcceptBtnClick(request)}>Accept</button>
                <button onClick={() => handleDeclineBtnClick(request)}>Decline</button>
              </li>
            ))
          )}
        </ul>
      </div>
      <h2>Chat with friends:</h2>
      {friendsOnline.length === 0 ? (
        <h3>No friends currently online</h3>
      ) : (
        <ul>
          {friendsOnline.map((friendUsername) => (
            <li key={friendUsername} onClick={() => handleFriendClick(friendUsername)}>
              {friendUsername} is online
            </li>
          ))}
        </ul>
      )}
      {friendSelected !== '' && (
        <FriendsChat friendSelected={friendSelected} />
      )}
    </div>
  );
}

export default FriendsOnline;
