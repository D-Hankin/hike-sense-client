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
  const [friendRequests, setFriendRequests] = useState<{ id: string; requester: string }[]>([]);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Fetch initial online friends from the database
    const fetchOnlineFriends = async () => {
      try {
        const token = "Bearer " + localStorage.getItem('token');
        const response = await fetch(`${modeUrl}/user/users-online`, {
          method: 'GET',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch online friends');
        }

        const onlineFriends = await response.json();

        // Extract usernames from the list of objects
        const usernames = onlineFriends.map((friend: { username: string }) => friend.username);
        setFriendsOnline(usernames);
      } catch (error) {
        console.error('Error fetching online friends:', error);
      }
    };

    fetchOnlineFriends();
  }, []);

  useEffect(() => {
    const token = "Bearer " + localStorage.getItem('token');
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
          stompClient.subscribe('/topic/online-status/' + friend.usernameFriend, (message) => {
            console.log('Received online status update:', message.body);
            if (message.body.includes('is online')) {
              setFriendsOnline((prevFriendsOnline) => {
                if (!prevFriendsOnline.includes(friend.usernameFriend)) {
                  return [...prevFriendsOnline, friend.usernameFriend];
                }
                return prevFriendsOnline;
              });
            } else if (message.body.includes('is offline')) {
              setFriendsOnline((prevFriendsOnline) => 
                prevFriendsOnline.filter(onlineFriend => onlineFriend !== friend.usernameFriend)
              );
            }
          });
        });

        // Subscribe to incoming friend requests
        stompClient.subscribe('/topic/friend-requests/' + props.user.username, (message) => {
          console.log('Incoming message:', message.body);
          try {
            const request = message.body; // Assuming the message is a JSON string
            setFriendRequests((prevRequests) => {
              if (!prevRequests.some(r => r.requester === request)) {
                return [...prevRequests, { id: new Date().getTime().toString(), requester: request }];
              }
              return prevRequests;
            });
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
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

  useEffect(() => {
    const mappedFriendRequests = props.user.pendingFriendRequests.map((requester, index) => ({
      id: index.toString(),
      requester: requester + " wants to be friends",
    }));
    setFriendRequests(mappedFriendRequests);
  }, [props.user.pendingFriendRequests]);

  const handleAddFriendBtnClick = async () => {
    if (addFriend.trim() === '') return;
    console.log('Sending friend request to:', addFriend);
    if (stompClientRef.current) {
      console.log('STOMP client is connected');
      const request = { sender: props.user.username, receiver: addFriend, status: 'PENDING' };
      console.log('Sending friend request:', request);
      stompClientRef.current.publish({
        destination: '/app/friend-requests',
        body: JSON.stringify(request),
      });
      setAddAFriend('');
    } else {
      console.error('STOMP client is not connected');
    }
  };

  const handleFriendClick = (friend: string) => {
    setFriendSelected(friend);
  };

  const handleResponseBtnClick = (requestId: string, decision: string) => {
    if (stompClientRef.current) {
      const request = friendRequests.find(req => req.id === requestId);
      if (request) {
        const receiverUsername = request.requester.split(" ")[0];
        if (decision === 'ACCEPTED') {
          setFriendsOnline((prevFriendsOnline) => [...prevFriendsOnline, receiverUsername]);
        }
        const response = { 
          sender: props.user.username, 
          receiver: receiverUsername, 
          status: decision 
        };
        stompClientRef.current.publish({
          destination: '/app/friend-requests/response',
          body: JSON.stringify(response),
        });

        setFriendRequests((prevRequests) => prevRequests.filter(req => req.id !== requestId));
      }
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
              <li key={request.id}>
                {request.requester}
                {!request.requester.includes('wants') ? null 
                :
                <>
                  <button onClick={() => handleResponseBtnClick(request.id, 'ACCEPTED')}>Accept</button>
                  <button onClick={() => handleResponseBtnClick(request.id, 'DECLINED')}>Decline</button>
                </>
                }
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
              {friendUsername} is online <div style={{backgroundColor: "green", width: "10px", height: "10px"}}></div>
            </li>
          ))}
        </ul>
      )}
      {friendSelected !== '' && (
        <FriendsChat username={props.user.firstName} friendSelected={friendSelected} />
      )}
    </div>
  );
}

export default FriendsOnline;
