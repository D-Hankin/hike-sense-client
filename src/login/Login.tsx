import React, { FormEvent } from 'react'
import "./login.css"

interface LoginProps {
    modeUrl: string;
    handleLoginSuccess: () => void;
    handleUserObject: (user: User) => void;
    }

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
        completed: boolean
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

function Login(props: LoginProps) {

    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        fetch(props.modeUrl + '/user/login', {
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
            console.log('Message:', data);
            localStorage.setItem('token', data.token);
            props.handleLoginSuccess();
            props.handleUserObject(data.user);
            
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
  )
}

export default Login