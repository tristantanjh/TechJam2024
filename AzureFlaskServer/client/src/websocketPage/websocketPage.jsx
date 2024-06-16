import { useState } from "react";
import { io } from "socket.io-client";
import "./websocketPage.css";

export default function WebsocketPage() {
  const [socketInstance, setSocketInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([{ id: 1, message: "Hello" }]);
  const [message, setMessage] = useState("");

  const InitialiseSocket = () => {
    setLoading(true);
    const socket = io("http://localhost:9000/", {
      transports: ["websocket"],
      cors: {
        origin: "http://localhost:3000",
      },
    });

    setSocketInstance(socket);

    socket.on("connect", (data) => {
      console.log("Connected to server, Data: ", data);
    });

    socket.on("data", (data) => {
      console.log("Data received: ", data);
      const msg = {
        id: data.id,
        message: data.data,
      };
      setData((prevData) => [...prevData, msg]);
    });

    setLoading(false);
  };

  const handleSendData = (e) => {
    if (socketInstance) {
      socketInstance.emit("data", message);
      setMessage("");
    }
  };

  const handleMessageInput = (e) => {
    console.log(e.target.value);

    setMessage(e.target.value);
  };

  return (
    <div>
      <h1>Websocket Page</h1>
      <button onClick={InitialiseSocket}>Initialise Socket</button>
      {loading ? <h2>Loading...</h2> : null}
      <div className="message-container">
        <input
          type="text"
          placeholder="Enter message..."
          onChange={handleMessageInput}
          value={message}
        />
        <button onClick={handleSendData}>Send</button>
      </div>
      <div className="message-list">
        {data.map((msg, idx) => (
          <div key={idx} className="message">
            [ID-{msg.id}] {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
}
