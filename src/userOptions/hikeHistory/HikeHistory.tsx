import { User } from "../../User";

interface HikeHistoryProps {
  user: User;
}

function HikeHistory(props: HikeHistoryProps) {
  return (
    <>
      <div>History</div>
      <div>{props.user.firstName}</div>
    </>
  )
}

export default HikeHistory