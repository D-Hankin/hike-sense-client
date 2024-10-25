import SockJS from "sockjs-client";
import modeUrl from "../ModeUrl";
import "./logout.css"
import { Client } from "@stomp/stompjs";

interface LogoutProps {
    logoutCallback: () => void;
}

function Logout(props: LogoutProps) {

  
    function sendLogoutStatus() {
        const token = "Bearer " + localStorage.getItem('token');
        const websocketUrl = modeUrl + `/ws?token=${token}`; 
        const socket = new SockJS(websocketUrl);
    
        const stompClient = new Client({
            webSocketFactory: () => socket as WebSocket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to websocket for logout status');
                stompClient.publish({
                    destination: `/app/friend-logout`, 
                });
            },
            onStompError: (error: any) => {
                console.error('Error with STOMP connection:', error);
            }
        });
    
        stompClient.activate();
        localStorage.removeItem('token');
        props.logoutCallback();
    }

    function handleLogout(): void {
        sendLogoutStatus();
      }

  return (
    <button onClick={handleLogout} className='logoutBtn'>Logout</button>
  )
}

export default Logout

