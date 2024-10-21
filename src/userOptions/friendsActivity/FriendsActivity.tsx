
interface FriendsActivityProps {
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

function FriendsActivity(props: FriendsActivityProps) {
  return (
    <div>{props.user.firstName}</div>
  )
}

export default FriendsActivity