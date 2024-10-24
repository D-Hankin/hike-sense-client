
interface FriendsChatProps {
  friendSelected: string;
}

function FriendsChat(props: FriendsChatProps) {


  return (
    <div>{props.friendSelected}</div>
  )
}

export default FriendsChat