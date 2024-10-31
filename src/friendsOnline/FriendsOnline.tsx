import "../globals.ts";
import { useEffect, useState, useRef } from 'react';
import FriendsChat from './friendsChat/FriendsChat';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import modeUrl from '../ModeUrl';
import { User } from "../User.ts";
import "./friendsOnline.css";

interface FriendsOnlineProps {
  user: User;
}

function FriendsOnline(props: FriendsOnlineProps) {
  const [friendSelected, setFriendSelected] = useState<string>('');
  const [friendsOnline, setFriendsOnline] = useState<string[]>([]);
  const [addFriend, setAddAFriend] = useState<string>('');
  const [friendRequests, setFriendRequests] = useState<{ id: string; requester: string }[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const [friendNotification, setFriendNotification] = useState<string>('');

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
    const token = "Bearer " + localStorage.getItem("token");
    const websocketUrl = modeUrl + `/ws?token=${token}`;
    const socket = new SockJS(websocketUrl);
    const stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to websocket");
  
        // Subscribe to online status of friends
        props.user.friends.forEach((friend) => {
          console.log("Subscribing to friend:", friend.usernameFriend);
  
          stompClient.subscribe(
            `/topic/online-status/${friend.usernameFriend}`,
            (message) => {
              console.log("Received online status update:", message.body);
              if (message.body.includes("is online")) {
                setFriendsOnline((prevFriendsOnline) => {
                  if (!prevFriendsOnline.includes(friend.usernameFriend)) {
                    return [...prevFriendsOnline, friend.usernameFriend];
                  }
                  return prevFriendsOnline;
                });
              } else if (message.body.includes("is offline")) {
                setFriendsOnline((prevFriendsOnline) =>
                  prevFriendsOnline.filter(
                    (onlineFriend) => onlineFriend !== friend.usernameFriend
                  )
                );
                if (friendSelected === friend.usernameFriend) {
                  setFriendSelected("");
                }
              }
            }
          );
  
          stompClient.subscribe(
            `/topic/chat/notify/${friend.usernameFriend}`,
            (message) => {
              console.log("Received chat notification:", message.body);
              setFriendNotification(message.body);
            }
          );

          stompClient.subscribe(
            `/topic/chat/notification-response/${friend.usernameFriend}`,
            (message) => {
              console.log("Received chat notification response:", message.body);
              if (message.body === 'ACCEPT') {
                setFriendSelected(friend.usernameFriend);
              } else if (message.body === 'DECLINE') {
                alert(`${friend.usernameFriend} cant chat right now.`);
              } else if (message.body === 'ENDED') {
                setFriendSelected('');
                alert(`${friend.usernameFriend} has ended the chat.`);
              }    
            }
          );
        });
  
        // Subscribe to incoming friend requests
        stompClient.subscribe(
          `/topic/friend-requests/${props.user.username}`,
          (message) => {
            console.log("Incoming message:", message.body);
            try {
              const request = message.body; // Assuming the message is a JSON string
              setFriendRequests((prevRequests) => {
                if (!prevRequests.some((r) => r.requester === request)) {
                  return [
                    ...prevRequests,
                    { id: new Date().getTime().toString(), requester: request },
                  ];
                }
                return prevRequests;
              });
            } catch (error) {
              console.error("Failed to parse message:", error);
            }
          }
        );
      },
      onStompError: (error: any) => {
        console.error("Error with STOMP connection:", error);
      },
    });
  
    stompClientRef.current = stompClient; // Store stompClient in the ref
    stompClient.activate();
  
    return () => {
      stompClient.deactivate();
    };
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
    console.log('Selected friend:', friend);
    stompClientRef.current?.publish({
      destination: `/app/chat/notify`,
      body: JSON.stringify(friend),
    });
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

  const respondToNotification = (response: string) => {

    console.log('Responding to notification:', response);
    console.log('Friend notification:', friendNotification); 
    if (stompClientRef.current) {
      stompClientRef.current.publish({
        destination: `/app/chat/notification-response`,
        body: JSON.stringify({
          "response": response, 
          "recipient": friendNotification,
        }),
      });
      if (response === 'ACCEPT') {
        setFriendSelected(friendNotification);
      } else if (response === 'ENDED') {
        setFriendSelected('');
      }
      setFriendNotification('');
    }
  }

  return (
    <div>
      <h2 className="friendsHeader">Friends</h2>
      <div className="addFriendDiv">
        <input 
          className="addFriendInput" 
          type="text" 
          placeholder="Add a friend" 
          value={addFriend} 
          onChange={(e) => setAddAFriend(e.target.value)}
          style={{ width: '80%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button className="addFriendButton" onClick={handleAddFriendBtnClick}>Add</button>
      </div>
      <div className="friendRequestsDiv">
        <h3 className="friendsHeader">Friend Requests</h3>
        <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
          {friendRequests.length === 0 ? (
            <li>No new friend requests</li>
          ) : (
            friendRequests.map((request) => (
              <li key={request.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {request.requester}
                {!request.requester.includes('wants') ? null : (
                  <>
                    <button
                      onClick={() => handleResponseBtnClick(request.id, 'ACCEPTED')}
                      style={{ width: '20%' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponseBtnClick(request.id, 'DECLINED')}
                      style={{ width: '20%' }}
                    >
                      Decline
                    </button>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

      </div>
      <h2 className="friendsHeader">Chat with friends:</h2>
      {friendsOnline.length === 0 ? (
        <h3>No friends currently online</h3>
      ) : (
        friendSelected === '' && (
        <ul className="onlineFriendsList">
          {friendsOnline.map((friendUsername) => (
            <li className="onlineFriendLi" key={friendUsername} onClick={() => handleFriendClick(friendUsername)} style={{backgroundColor: "#1E1E1E", borderRadius: "5px", width:"fit-content", padding:"5px"}}>
              {friendUsername} is online, click here to start a chat!
            </li>
          ))}
        </ul>
      )
      )}
      {friendSelected !== '' && friendsOnline.length !== 0 && (
        <>
          <FriendsChat username={props.user.firstName} friendSelected={friendSelected} />
          <button className="endChat" onClick={() => respondToNotification("ENDED")}>End Chat</button>
        </>
      )}
    { friendNotification && 
      <div className="friendNotificationDiv">
        <h3 style={{width:"100%"}}>{friendNotification} wants to start chatting!</h3>
        <button style={{width:"30%", backgroundColor:"green", border:"1px solid black", marginRight: "10px"}} onClick={() => respondToNotification("ACCEPT")}>Start Chat</button>
        <button style={{width:"30%", backgroundColor:"red", border:"1px solid black"}} onClick={() => respondToNotification('DECLINE')}>Dismiss</button>
      </div> }
    </div>
  );
}

export default FriendsOnline;
