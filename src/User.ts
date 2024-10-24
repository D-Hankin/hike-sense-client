export interface User {
    id: string; 
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    hikes: Hike[];
    friends: Friend[]; 
    subscriptionStatus: string;
}

export interface Friend {
    usernameFriend: string;
    firstNameFriend: string;
    lastNameFriend: string;
    hikesFriend: Hike[];
}

export interface Hike {
    name: string;
    dateCreated: string;
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

export interface Alert {
    alertType: string;
    information: string;
    time: string; 
    location: {
        latitude: number;
        longitude: number;
    };
}