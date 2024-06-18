import React, { useState } from "react";
import { Container } from "reactstrap";
import { getTokenOrRefresh } from "../utils/utils";

import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import "./CallerPage.css";
import { useEffect } from "react";
import { useRef } from "react";
import { io } from "socket.io-client";

export default function CallerPage() {
  const [displayText, setDisplayText] = useState(
    "MOUNT THE TRANSCRIBER FIRST..."
  );

  const [transcribedList, setTranscribedList] = useState([]);
  const [conversationTranscriber, setConversationTranscriber] = useState(null);
  const initialised = useRef(0); // useEffect check
  const socketInitialised = useRef(false); // useEffect check
  const [socketInstance, setSocketInstance] = useState(null);
  const messageInitialised = useRef(false); // useEffect check
  const sessionId = useRef(null);
  const [aiMessages, setAiMessages] = useState([]);

  const InitialiseTranscriber = async () => {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const transcriber = new speechsdk.ConversationTranscriber(
      speechConfig,
      audioConfig
    );
    setConversationTranscriber(transcriber);
  };

  // Mount the transcriber
  const MountTranscriber = () => {
    conversationTranscriber.sessionStarted = function (s, e) {
      console.log("SessionStarted event");
      console.log("SessionId:" + e.sessionId);
      sessionId.current = e.sessionId;
    };
    conversationTranscriber.sessionStopped = function (s, e) {
      console.log("SessionStopped event");
      console.log("SessionId:" + e.sessionId);
      conversationTranscriber.stopTranscribingAsync();
    };
    conversationTranscriber.canceled = function (s, e) {
      console.log("Canceled event");
      console.log(e.errorDetails);
      conversationTranscriber.stopTranscribingAsync();
    };
    // Action when a text is transcribed
    conversationTranscriber.transcribed = function (s, e) {
      console.log(
        "TRANSCRIBED: Text=" +
          e.result.text +
          " Speaker ID=" +
          e.result.speakerId
      );
      setTranscribedList((prevList) => [
        ...prevList,
        {
          text: e.result.text,
          speakerId: e.result.speakerId,
        },
      ]);
    };

    setDisplayText("TRANSCRIBER MOUNTED...");
  };

  // Send data to server everytime transcribedList is updated
  useEffect(() => {
    if (!messageInitialised.current) {
      messageInitialised.current = true;
      console.log("Initialising message event useEffect...");
    } else {
      if (socketInstance) {
        const data = {
          sessionId: sessionId.current,
          transcribedList: transcribedList,
        };

        socketInstance.emit("data", data);
      }
    }
  }, [transcribedList]);

  // start transcription on button click
  useEffect(() => {
    if (initialised.current < 2) {
      initialised.current = initialised.current + 1;
      console.log("Initialising transcriber...");
    } else {
      console.log("Transcriber updated...");
      MountTranscriber();
      console.log(conversationTranscriber);

      // Start conversation transcription
      conversationTranscriber.startTranscribingAsync(
        function () {},
        function (err) {
          console.trace("err - starting transcription: " + err);
        }
      );
    }
  }, [conversationTranscriber]);

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

      socket.on("connect", (data) => {
        console.log("Connected to server, Data: ", data);
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

  // Button click event to start transcription
  const StartTranscription = async () => {
    await InitialiseTranscriber();

    setDisplayText("speak into your microphone...");
    setTranscribedList([]);
  };

  // Button click event to stop transcription
  const StopTranscription = () => {
    console.log("Stopping transcription...");

    conversationTranscriber.stopTranscribingAsync();

    setTimeout(() => {
      setDisplayText("INITIALIZED: ready to test speech...");
      setTranscribedList((prevList) => [
        ...prevList,
        {
          text: "END OF TRANSCRIPTION",
          speakerId: "SYSTEM",
        },
      ]);
    }, 2000);
  };

  return (
    <Container className="app-container">
      <h1 className="display-4 mb-2">Speech sample app</h1>

      <div className="row main-container">
        <div className="col-6">
          <button
            className="fas fa-lg mr-2"
            onClick={() => StartTranscription()}
          >
            Start
          </button>
          Convert speech to text from your mic.
        </div>
        <div className="col-6">
          <button
            className="fas fa-lg mr-2"
            onClick={() => StopTranscription()}
          >
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
              <p key={idx}>{item}</p>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
