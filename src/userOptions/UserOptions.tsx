import { useState, useRef, useEffect } from 'react';
import AccountDetails from './accountDetails/AccountDetails';
import HikeHistory from './hikeHistory/HikeHistory';
import './userOptions.css';
import Weather from '../weather/Weather';
import { User } from '../User';
import FriendsActivity from './friendsActivity/FriendsActivity';

interface UserOptionsProps {
  user: User;
  handleUpdateState: () => void;
}

function UserOptions(props: UserOptionsProps) {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountDetailsRef = useRef<HTMLDivElement>(null);
  const isModalOpenRef = useRef(isModalOpen); 

  const handleComponentChange = (component: string) => {
    setActiveComponent(component);
    setIsDropdownOpen(false); 
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); 
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!isModalOpenRef.current) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        accountDetailsRef.current && !accountDetailsRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); 
        setActiveComponent(null); 
      }
    }
  };

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleIsModalOpen = (value: boolean) => {
    setIsModalOpen(value);
  }

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
            <AccountDetails user={props.user} handleUpdateState={props.handleUpdateState} handleIsModalOpen={handleIsModalOpen} />
          </div>
        )}
        {activeComponent === 'friendsActivity' && (
          <div ref={accountDetailsRef}>
            <FriendsActivity user={props.user} />
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
