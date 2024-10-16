import { useEffect, useState } from 'react';
import './App.css';
import CreateAccount from './createAccount/CreateAccount';
import Login from './login/Login';

interface User {
  id: string; 
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  hikes: Hike[];
  friends: string[]; 
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

function App() {

  const [modeUrl, setModeUrl] = useState<string>('');
  const [buttonChoice, setButtonChoice] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User>({} as User);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setModeUrl('http://localhost:8080');
    } else {
      setModeUrl('https://goldfish-app-lmlas.ondigitalocean.app');
    }
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);


  function handleLogout(): void {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  }

  function handleLoginSuccess(): void {
    setIsLoggedIn(true);
    setButtonChoice(''); 
  }

  function handleUserObject(user: User): void {
    setUser(user);
  }

  return (
    <>
      <h1>HikeSense</h1>
      { buttonChoice === '' && isLoggedIn === false ?
      <>
      <button onClick={() => setButtonChoice("logIn")}>Log in</button>
      <p>or</p>
      <button onClick={() => setButtonChoice("createAccount")}>Create Account</button>
      </>
      : isLoggedIn === false ? <button onClick={() => setButtonChoice("")}>Back</button>
      : null
      }
      { buttonChoice === 'createAccount' ?
      <CreateAccount modeUrl={modeUrl} handleLoginSuccess={handleLoginSuccess} handleUserObject={handleUserObject}/>
      :
      buttonChoice === 'logIn' ? 
      <Login modeUrl={modeUrl} handleLoginSuccess={handleLoginSuccess} handleUserObject={handleUserObject}/>
      :
      null
      }
       {isLoggedIn && (
    <>
      <p>Welcome {user.firstName}!</p>
      <button onClick={handleLogout}>Logout</button>
    </>
  )}
    </>
  )
}

export default App
