import React, { FormEvent } from 'react'
import "./login.css"
import modeUrl from '../ModeUrl';
import { User } from '../User';

interface LoginProps {
    modeUrl: string;
    handleLoginSuccess: () => void;
    handleUserObject: (user: User) => void;
    }

function Login(props: LoginProps) {

    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        console.log("username", username);
        console.log("password,", password);
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
            console.log('Message:', data);
            if (!data.token.includes("Bad")) {
                localStorage.setItem('token', data.token);
                props.handleLoginSuccess();
                props.handleUserObject(data.user);
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
  )
}

export default Login