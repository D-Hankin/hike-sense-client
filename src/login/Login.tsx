import React, { FormEvent, useRef } from 'react';
import "./login.css";
import modeUrl from '../ModeUrl';
import { User } from '../User';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface LoginProps {
    modeUrl: string;
    handleLoginSuccess: () => void;
    handleUserObject: (user: User) => void;
}

function Login(props: LoginProps) {
    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const stompClientRef = useRef<Client | null>(null);

    // WebSocket setup and publish function
    const publishLoginStatus = () => {
        const token = "Bearer " + localStorage.getItem('token');
        const websocketUrl = modeUrl + `/ws?token=${token}`; 
        const socket = new SockJS(websocketUrl);

        const stompClient = new Client({
            webSocketFactory: () => socket as WebSocket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to websocket for login status');
                stompClient.publish({
                    destination: `/app/friend-login`, 
                });
            },
            onStompError: (error: any) => {
                console.error('Error with STOMP connection:', error);
            }
        });

        stompClient.activate();
        stompClientRef.current = stompClient;
    };

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        fetch(modeUrl + '/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (!data.token.includes("Bad")) {
                localStorage.setItem('token', data.token);
                props.handleLoginSuccess();
                props.handleUserObject(data.user);
                
                // Publish login status to notify friends
                publishLoginStatus();
            } else {
                alert(data.token);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Email</label>
            <input 
                type="text" 
                id="username" 
                name="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <label htmlFor="password">Password</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Log in</button>
        </form>
    );
}

export default Login;
