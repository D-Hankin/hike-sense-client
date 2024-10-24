import React, { FormEvent } from 'react'
import "./CreateAccount.css"
import { User } from '../User';

interface TestPostProps {
    handleUserObject(user: User): unknown;
    modeUrl: string;
    handleLoginSuccess: () => void;
}

function CreateAccount(props: TestPostProps) {

    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [firstName, setFirstName] = React.useState<string>('');
    const [lastName, setLastName] = React.useState<string>('');
    const [confirmPassword, setConfirmPassword] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');

    const sendCreateAccount = async () => {
        const fetchUrl: string = props.modeUrl + '/user/create-account';
        fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errMsg => { throw new Error(errMsg) });
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            props.handleLoginSuccess();
            props.handleUserObject(data.user);
            console.log('Message:', data);
        })
        .catch((error) => {
            console.error('Error:', error.message);
            setError(error.message);
        });
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        sendCreateAccount();
    }

    function closeMessage(_event: React.MouseEvent<HTMLButtonElement>): void {
        setError('');
    }

  return (
    <>
        <div>Create Account</div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Email</label>
            <input 
                type="text" 
                id="username" 
                name="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            
            <label htmlFor="password">Password</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
            />
            
            <label htmlFor="firstName">First Name</label>
            <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
            />
            
            <label htmlFor="lastName">Last Name</label>
            <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
            />
            
            <button type="submit">Create Account</button>
        </form>
        {   
            error !== "" ? <div className='errorDiv'>
                <p>{error}</p>
                <button onClick={closeMessage}>Close</button>
            </div>
            : null 
        }

    </>
  )
}

export default CreateAccount