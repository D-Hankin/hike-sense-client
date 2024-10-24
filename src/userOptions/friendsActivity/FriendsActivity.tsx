import { User } from "../../User";

interface FriendsActivityProps {
    user: User;
}

function FriendsActivity(props: FriendsActivityProps) {
  return (
    <div>{props.user.firstName}</div>
  )
}

export default FriendsActivity