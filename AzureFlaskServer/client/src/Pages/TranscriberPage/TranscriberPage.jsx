import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/Components/ui/resizable";
import React, { useEffect, useState, useRef } from "react";
import "./TranscriberPage.css";
import Transcriber from "./Components/transcriber";
import TangentualInfo from "./Components/tangentual-info";
import FollowUpQuestion from "./Components/follow-up-question";
import { io } from "socket.io-client";
import { useTranscriber } from "@/hooks/useTranscriber";
import AiMessage from "@/Pages/CallerPage/components/AiMessage";
import { Button } from "@/components/ui/button";
import LLMOutput from "./Components/llm-output";

export default function TranscriberPage() {
  const [displayText, setDisplayText] = useState("WAITING TO START CALL...");
  const socketInitialised = useRef(false); // useEffect check
  const [socketInstance, setSocketInstance] = useState(null);
  const messageInitialised = useRef(false); // useEffect check
  const [aiMessages, setAiMessages] = useState([]);
  const [callStatus, setCallStatus] = useState(0);
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
    setCallStatus(1);
    setDisplayText("SPEAK INTO THE MIC...");
  };

  const handleStop = async () => {
    await StopTranscription();
    setCallStatus(0);
    setDisplayText("WAITING TO START CALL...");
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center h-[15vh] p-10">
          <h1 className="text-4xl font-bold text-primary">Transcriber</h1>

          <div className="flex space-x-4">
            <Button onClick={handleStart} className="btn-primary" disabled={callStatus !== 0}>
              Start Call
            </Button>
            <Button onClick={handleStop} className="btn-primary" disabled={callStatus !== 1}>
              Stop Call
            </Button>
          </div>
        </div>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={35} minSize={25} maxSize={55}>
            <Transcriber
              displayText={displayText}
              transcribedList={transcribedList}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={45} maxSize={85}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <LLMOutput />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <FollowUpQuestion />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <TangentualInfo />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
