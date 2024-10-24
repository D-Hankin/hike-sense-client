import ChatBox from "./chatBox/ChatBox"

interface AiAssistantProps {
  userFirstName: string;
}

function AiAssistant(props: AiAssistantProps) {
  return (
    <div>
      <h3>Hike Buddy</h3>
      <ChatBox userFirstName={props.userFirstName} />
    </div>
  )
}

export default AiAssistant