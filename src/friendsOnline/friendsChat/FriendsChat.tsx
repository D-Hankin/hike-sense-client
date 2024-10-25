import React, { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import modeUrl from '../../ModeUrl';
import './friendChat.css';

interface FriendsChatProps {
  friendSelected: string;
  username: string;
}

const FriendsChat: React.FC<FriendsChatProps> = (props) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = 'Bearer ' + localStorage.getItem('token');
    if (!props.friendSelected) return;
    const socketUrl = modeUrl + `/ws?token=${token}`;
    const socket = new SockJS(socketUrl);
    const stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to chat websocket');
        
        stompClient.subscribe(`/topic/chat/${props.friendSelected}`, (message: IMessage) => {
          const chatMessage = JSON.parse(message.body);
          if (chatMessage && chatMessage.content) {
            setMessages((prevMessages) => [...prevMessages, props.friendSelected + ": " + chatMessage.content]);
          } else {
            console.error("Received malformed message:", message.body);
          }
        });
      },
      onStompError: (error) => console.error('Error with STOMP connection:', error),
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [props.friendSelected]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (stompClientRef.current && inputMessage.trim()) {
      const chatMessage = {
        sender: props.username,
        receiver: props.friendSelected,
        content: inputMessage,
      };
      stompClientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage),
      });
      setMessages((prevMessages) => [...prevMessages, `You: ${inputMessage}`]);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-box">
      <h3>Chat with {props.friendSelected}</h3>
      <div className="messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.startsWith("You:") ? "user-message" : "friend-message"}`}
          >
            {message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input 
          type="text" 
          placeholder="Type a message" 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default FriendsChat;
