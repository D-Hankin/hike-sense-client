import HikeBuddyChatBox from "./hikeBuddyChatBox/HikeBuddyChatBox";

interface AiAssistantProps {
  userFirstName: string;
}

function AiAssistant(props: AiAssistantProps) {
  return (
    <div>
      <h3>Hike Buddy</h3>
      <HikeBuddyChatBox userFirstName={props.userFirstName} />
    </div>
  )
}

export default AiAssistant