import { useEffect, useState } from 'react';
import './App.css';
import CreateAccount from './createAccount/CreateAccount';
import Login from './login/Login';
import PlanHike from './planHike/PlanHike';
import Logout from './logout/Logout';
import UserOptions from './userOptions/UserOptions';
import FriendsOnline from './friendsOnline/FriendsOnline';
import Alerts from './alerts/Alerts';
import LatestHike from './latestHike/LatestHike';
import Weather from './weather/Weather';
import AiAssistant from './aiAssistant/AiAssistant';
import { LoadScript } from '@react-google-maps/api';

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

function App() {
  const [modeUrl, setModeUrl] = useState<string>('');
  const [buttonChoice, setButtonChoice] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User>({} as User);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') setModeUrl('http://localhost:8080');
    else setModeUrl('https://stingray-app-ewlud.ondigitalocean.app');
    
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  const logoutCallback = () => {
    setIsLoggedIn(false);
    setUser({} as User);
    localStorage.removeItem('token');
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
      {buttonChoice === '' && isLoggedIn === false ? (
        <>
          <h1>HikeSense</h1>
          <button onClick={() => setButtonChoice("logIn")}>Log in</button>
          <p>or</p>
          <button onClick={() => setButtonChoice("createAccount")}>Create Account</button>
        </>
      ) : isLoggedIn === false ? (
        <button onClick={() => setButtonChoice("")}>Back</button>
      ) : null}

      {buttonChoice === 'createAccount' ? (
        <CreateAccount modeUrl={modeUrl} handleLoginSuccess={handleLoginSuccess} handleUserObject={handleUserObject} />
      ) : buttonChoice === 'logIn' ? (
        <Login modeUrl={modeUrl} handleLoginSuccess={handleLoginSuccess} handleUserObject={handleUserObject} />
      ) : null}

      {isLoggedIn && (
        <div className='mainBody'>
            <Logout logoutCallback={logoutCallback} />
            <div className='userOptionsDiv'>
              <UserOptions user={user} />
            </div>
          <div className='header'>
              <h1>HikeSense</h1>
              <p className='welcomeMessage'>Welcome {user.firstName}!</p>
          </div>

          <div className='gridContainer'>
            <div className='weatherDiv'>
              <Weather />
            </div>
            <div className='alertsDiv'>
              <Alerts />
            </div>
            <div className='friendsOnlineDiv'>
              <FriendsOnline />
            </div>
            <LoadScript googleMapsApiKey={import.meta.env.VITE_MAPS_API_KEY}>
              <div className='latestHikeDiv'>
                <LatestHike user={user}/>
              </div>
              <div className='planHikeDiv'>
                <PlanHike />
              </div>
            </LoadScript>
            <div className='aiAssistant'>
              <AiAssistant />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App;
