import React, { useState } from "react";
import { Container } from "reactstrap";
import { getTokenOrRefresh } from "../utils/utils";

import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import "./CallerPage.css";
import { useEffect } from "react";

export default function CallerPage() {
  const [displayText, setDisplayText] = useState(
    "MOUNT THE TRANSCRIBER FIRST..."
  );

  const [transcribedList, setTranscribedList] = useState([]);
  const [conversationTranscriber, setConversationTranscriber] = useState(null);

  const MountTranscriber = async () => {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const conversationTranscriber = new speechsdk.ConversationTranscriber(
      speechConfig,
      audioConfig
    );
    setConversationTranscriber(conversationTranscriber);

    conversationTranscriber.sessionStarted = function (s, e) {
      console.log("SessionStarted event");
      console.log("SessionId:" + e.sessionId);
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

  const StartTranscription = () => {
    setDisplayText("speak into your microphone...");
    setTranscribedList([]);

    // Start conversation transcription
    conversationTranscriber.startTranscribingAsync(
      function () {},
      function (err) {
        console.trace("err - starting transcription: " + err);
      }
    );
  };

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
      <h1 className="display-4 mb-3">Speech sample app</h1>

      <div className="row main-container">
        <div className="col-6">
          <button
            className="fas fa-microphone fa-lg mr-2"
            onClick={() => MountTranscriber()}
          >
            Mount
          </button>
          Mount transcriber
        </div>
        <div className="col-6">
          <button
            className="fas fa-microphone fa-lg mr-2"
            onClick={() => StartTranscription()}
          >
            Start
          </button>
          Convert speech to text from your mic.
        </div>
        <div className="col-6">
          <button
            className="fas fa-microphone fa-lg mr-2"
            onClick={() => StopTranscription()}
          >
            Stop
          </button>
          Stop the transcription.
        </div>
        <div className="col-6 output-display rounded">
          <code>{displayText}</code>
          {transcribedList.map((item, idx) => (
            <p key={idx}>
              Speaker {item.speakerId}: {item.text}
            </p>
          ))}
        </div>
      </div>
    </Container>
  );
}
