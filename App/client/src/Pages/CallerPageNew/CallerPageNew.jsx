import React, { useState } from "react";
import { Container } from "reactstrap";
import "./CallerPageNew.css";
import { useEffect } from "react";
import { useRef } from "react";
import { io } from "socket.io-client";
import { useTranscriber } from "@/hooks/useTranscriber";
import AiMessage from "@/Pages/CallerPage/components/AiMessage";

export default function CallerPageNew() {
  const [displayText, setDisplayText] = useState(
    "MOUNT THE TRANSCRIBER FIRST..."
  );
  const socketInitialised = useRef(false); // useEffect check
  const [socketInstance, setSocketInstance] = useState(null);
  const messageInitialised = useRef(false); // useEffect check
  const [aiMessages, setAiMessages] = useState([]);
  const {
    StartTranscription,
    StopTranscription,
    transcribedList,
    GetSessionId,
  } = useTranscriber();

  // Send data to server everytime transcribedList is updated
  useEffect(() => {
    if (!messageInitialised.current) {
      messageInitialised.current = true;
      console.log("Initialising message event useEffect...");
    } else {
      if (socketInstance) {
        const data = {
          sessionId: GetSessionId(),
          transcribedList: transcribedList,
        };

        socketInstance.emit("data", data);
      }
    }
  }, [transcribedList]);

  // Initialise the socket on page load
  useEffect(() => {
    if (!socketInitialised.current) {
      const socket = io("http://localhost:9000/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000",
        },
      });

      setSocketInstance(socket);

      socket.on("connected", (data) => {
        console.log(`Connected to websocket as ${data.data}`);
      });

      socket.on("ai-response", (data) => {
        console.log("AI Response: ", data);
        if (data["aiMessage"]) {
          setAiMessages((prevList) => [...prevList, data["aiMessage"]]);
        }
      });

      socketInitialised.current = true;
    }
  }, []);

  const handleStart = async () => {
    await StartTranscription();
    setDisplayText("speak into the mic...");
  };

  const handleStop = async () => {
    await StopTranscription();
    setDisplayText("MOUNT THE TRANSCRIBER FIRST...");
  };

  return (
    <Container className="app-container">
      <h1 className="display-4 mb-2">Speech sample app</h1>

      <div className="row main-container">
        <div className="col-6">
          <button className="fas fa-lg mr-2" onClick={() => handleStart()}>
            Start
          </button>
          Convert speech to text from your mic.
        </div>
        <div className="col-6">
          <button className="fas fa-lg mr-2" onClick={() => handleStop()}>
            Stop
          </button>
          Stop the transcription.
        </div>
        <div className="output-wrapper">
          <div className="output-display rounded">
            <code>{displayText}</code>
            {transcribedList.map((item, idx) => (
              <p key={idx}>
                Speaker {item.speakerId}: {item.text}
              </p>
            ))}
          </div>

          <div className="llm-output-wrapper">
            <code>======LLM Output======</code>
            {aiMessages.map((item, idx) => (
              <AiMessage key={idx} points={item.split("-").slice(1)} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
