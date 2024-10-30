import HikeBuddyChatBox from "./hikeBuddyChatBox/HikeBuddyChatBox";
import "./aiAssistant.css";

interface AiAssistantProps {
  userFirstName: string;
}

function AiAssistant(props: AiAssistantProps) {
  return (
    <div>
      <div>
        <h2 className="aiAssistantHeader">Hike Buddy</h2>
      </div>
      <HikeBuddyChatBox userFirstName={props.userFirstName} />
    </div>
  )
}

export default AiAssistant