import "./logout.css"

interface LogoutProps {
    logoutCallback: () => void;
}

function Logout(props: LogoutProps) {



    function handleLogout(): void {
        localStorage.removeItem('token');
        props.logoutCallback();
      }

  return (
    <button onClick={handleLogout} className='logoutBtn'>Logout</button>
  )
}

export default Logout