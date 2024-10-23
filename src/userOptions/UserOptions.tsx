import { useState, useRef, useEffect } from 'react';
import AccountDetails from './accountDetails/AccountDetails';
import HikeHistory from './hikeHistory/HikeHistory';
import './userOptions.css';
import Weather from '../weather/Weather';

interface UserOptionsProps {
  user: User;
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

function UserOptions(props: UserOptionsProps) {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountDetailsRef = useRef<HTMLDivElement>(null);

  const handleComponentChange = (component: string) => {
    setActiveComponent(component);
    setIsDropdownOpen(false); // Close dropdown after selecting an option
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown state
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
      accountDetailsRef.current && !accountDetailsRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false); // Close dropdown if clicked outside
      setActiveComponent(null); // Close account details if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="userOptionsDropdown" ref={dropdownRef}>
      <h3 className="userOptionsTitle" onClick={toggleDropdown}>
        Menu {!isDropdownOpen ? '' : '▼'}
      </h3>
      {isDropdownOpen && (
        <div className="choicesDiv">
          <button className="choicesBtns" onClick={() => handleComponentChange('accountDetails')}>
            Account Details
          </button>
          <button className="choicesBtns" onClick={() => handleComponentChange('hikeHistory')}>
            Hike History
          </button>
          <button className="choicesBtns" onClick={() => handleComponentChange('friendsActivity')}>
            Friends Activity
          </button>
          <button className="choicesBtns" onClick={() => handleComponentChange('weather')}>
            Weather
          </button>
        </div>
      )}

      <div className="componentContainer">
        {activeComponent === 'hikeHistory' && <HikeHistory user={props.user} />}
        {activeComponent === 'accountDetails' && (
          <div ref={accountDetailsRef}>
            <AccountDetails user={props.user} />
          </div>
        )}
        {activeComponent === 'weather' && (
          <div ref={accountDetailsRef}>
            <Weather />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserOptions;
