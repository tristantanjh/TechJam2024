import { createContext, useContext, useMemo, useRef, useState } from "react";
import { getTokenOrRefresh } from "../utils/utils";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { set } from "date-fns";

const AzureContext = createContext();

export const AzureProvider = ({ children }) => {
  const transcriberInstance = useRef(null);
  const [transcribedList, setTranscribedList] = useState([]);
  const [speakerSet, setSpeakerSet] = useState(new Set());
  const sessionId = useRef(null);
  const [transcriberLoaded, setTranscriberLoaded] = useState(false);

  const InitialiseTranscriber = async () => {
    // get the token and region
    const tokenObj = await getTokenOrRefresh();

    // create the speech config
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

    // create the transcriber instance
    const transcriber = new speechsdk.ConversationTranscriber(
      speechConfig,
      audioConfig
    );

    // set the transcriber instance
    transcriberInstance.current = transcriber;

    // sessionStarted event
    transcriberInstance.current.sessionStarted = function (s, e) {
      console.log("SessionStarted event");
      console.log("SessionId:" + e.sessionId);
      sessionId.current = e.sessionId;
    };

    // sessionStopped event
    transcriberInstance.current.sessionStopped = function (s, e) {
      console.log("SessionStopped event");
      console.log("SessionId:" + e.sessionId);
      transcriberInstance.current.stopTranscribingAsync();
    };

    // canceled event
    transcriberInstance.current.canceled = function (s, e) {
      console.log("Canceled event");
      console.log(e.errorDetails);
    };

    // transcribed event
    transcriberInstance.current.transcribed = function (s, e) {
      console.log(
        "TRANSCRIBED: Text=" +
          e.result.text +
          " Speaker ID=" +
          e.result.speakerId
      );
      if (e.result.text) {
        setTranscribedList((prevList) => [
          ...prevList,
          {
            text: e.result.text,
            speakerId: e.result.speakerId,
          },
        ]);
        if (!speakerSet.has(e.result.speakerId)) {
          setSpeakerSet((prev) => new Set([...prev, e.result.speakerId]));
        }
      }
    };
  };

  // start
  const StartTranscription = async () => {
    await InitialiseTranscriber();
    if (transcriberInstance.current) {
      console.log(
        "Transcriber instance initialised successfully... Starting transcription..."
      );
      setTranscriberLoaded(true);
      await transcriberInstance.current.startTranscribingAsync();
      setTranscribedList([]);
    } else {
      console.log("Transcriber instance not found");
    }
  };

  // stop
  const StopTranscription = async () => {
    if (transcriberInstance.current) {
      await transcriberInstance.current.stopTranscribingAsync();
      setTranscriberLoaded(false);
      setTranscribedList((prevList) => [
        ...prevList,
        {
          text: "END OF TRANSCRIPTION SESSION " + sessionId.current,
          speakerId: "SYSTEM",
        },
      ]);

      return transcribedList;
    }
  };

  // get transcribed list
  const GetTranscribedList = () => {
    return transcribedList;
  };

  // set transcribed event
  const SetTranscribedEvent = (event) => {
    transcriberInstance.current.transcribed = event;
  };

  // get sessionId
  const GetSessionId = () => {
    return sessionId.current;
  };

  const value = useMemo(
    () => ({
      transcriberInstance,
      InitialiseTranscriber,
      StartTranscription,
      StopTranscription,
      GetTranscribedList,
      SetTranscribedEvent,
      transcribedList,
      speakerSet,
      GetSessionId,
      transcriberLoaded,
    }),
    [transcriberInstance, transcribedList, speakerSet, transcriberLoaded]
  );

  return (
    <AzureContext.Provider value={value}>{children}</AzureContext.Provider>
  );
};

export const useTranscriber = () => {
  const context = useContext(AzureContext);

  if (!context) {
    throw new Error("useTranscriber must be used within an AzureProvider");
  }

  return context;
};
