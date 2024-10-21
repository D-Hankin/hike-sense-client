import { useState } from "react";
import "./accountDetails.css"

interface AccountDetailsProps {
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

function AccountDetails(props: AccountDetailsProps) {

    const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');


    const handleEditAccountClick = () => {
        setIsEditingUser(true);
    }

    return (
        <div>
            { !isEditingUser ? 
                <div className="accountDetailsDiv">
                    <h3>Account Details</h3>
                    <p className="detailsP">First Name: {props.user.firstName}</p>
                    <p className="detailsP">Last Name: {props.user.lastName}</p>
                    <p className="detailsP">Email: {props.user.username}</p>
                    <p className="detailsP">Subscription Status: {props.user.subscriptionStatus}</p>
                    <button className="detailsButton" onClick={handleEditAccountClick}>Edit Account</button>
                    <button className="detailsButton">Update Subscription</button>
                </div>
            :
                <div className="accountDetailsDiv">
                    <h3>Edit Account</h3>
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                    <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button className="detailsButton" onClick={handleEditAccountClick}>Save Changes</button>
                    <button className="detailsButton" onClick={() => setIsEditingUser(false)} >Cancel</button>
                </div>
            }
        </div>
    );
}

export default AccountDetails;
