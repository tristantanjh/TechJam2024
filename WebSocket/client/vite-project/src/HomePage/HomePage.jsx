import { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");

  return (
    <form method="post" action="">
      <label htmlFor="username">Username</label>

      <input
        value={username}
        title="username"
        onInput={(e) => setUsername(e.target.value)}
      />

      <label htmlFor="room">Room</label>

      <input
        value={room}
        title="room"
        onInput={(e) => setRoom(e.target.value)}
      />
      <Link to={`/call/${username}/${room}`}>
        <input type="submit" name="submit" value="Join Room" />
      </Link>
    </form>
  );
}
