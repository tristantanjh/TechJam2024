import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/Components/ui/resizable";
import React, { useEffect, useState, useRef } from "react";
import "./TranscriberPage.css";
import Transcriber from "./Components/transcriber";
import TangentialInfo from "./Components/tangential-info";
import FollowUpQuestion from "./Components/follow-up-question";
import { io } from "socket.io-client";
import { useTranscriber } from "@/hooks/useTranscriber";
import { useLoadingMessage } from "@/hooks/useLoadingMessage";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import LLMOutput from "./Components/llm-output";
import "ldrs/ring2";

const loadingStates = [
  {
    text: "Authenticating Azure Speech Service...",
  },
  {
    text: "Fetching Data...",
  },
  {
    text: "Initialising Transcriber...",
  },
];

export default function TranscriberPage() {
  const [displayText, setDisplayText] = useState("Waiting to start call...");
  const socketInitialised = useRef(false); // useEffect check
  const [socketInstance, setSocketInstance] = useState(null);
  const messageInitialised = useRef(false); // useEffect check
  const [aiMessages, setAiMessages] = useState([]);
  const [followUpData, setFollowUpData] = useState({
    headerText: [],
    followUpQuestions: [],
  });
  const [callStatus, setCallStatus] = useState(0);
  const {
    StartTranscription,
    StopTranscription,
    transcribedList,
    GetSessionId,
    speakerSet,
    transcriberLoaded,
  } = useTranscriber();
  const [rightBoxHeight, setRightBoxHeight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minLoaded, setMinLoaded] = useState(false);
  const [isTranscripting, setIsTranscripting] = useState(true);
  const [actionItems, setActionItems] = useState([]);
  const [selectedActionItems, setSelectedActionItems] = useState([]);
  const [actionItemsSubmitted, setActionItemsSubmitted] = useState(true);
  const [refreshTangential, setRefreshTangential] = useState(false);
  const { setNewQueryReceived } = useLoadingMessage();

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
        !isTranscripting && socketInstance.emit("extract", data);
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

      socket.on("should-generate-message", (data) => {
        if (data === 1) {
          setNewQueryReceived(true);
        }
      });

      socket.on("ai-response", (data) => {
        console.log(data["aiMessage"])
        if (data["aiMessage"]) {
          setAiMessages((prevList) => [...prevList, data["aiMessage"]]);
        }
      });

      socket.on("follow-up-questions", (data) => {
        if (data) {
          const parsedFollowUpQuestions = JSON.parse(data["followUpQuestions"]);

          setFollowUpData((prevData) => ({
            headerText: [...prevData.headerText, data["headerText"]],
            followUpQuestions: [
              ...prevData.followUpQuestions,
              parsedFollowUpQuestions,
            ],
          }));

          setNewQueryReceived(false);
        }
      });

      socket.on("action-item-check", (data) => {
        setActionItems(data);
      });

      socketInitialised.current = true;
    }
  }, []);

  useEffect(() => {
    if (transcriberLoaded && !minLoaded) {
      setLoading(false);
    }
  }, [transcriberLoaded, minLoaded]);

  const handleStart = async () => {
    setLoading(true);
    setMinLoaded(true);
    setTimeout(() => {
      setMinLoaded(false);
    }, 3000);
    setIsTranscripting(true);
    await StartTranscription();
    setCallStatus(1);
    setAiMessages([]);
    setFollowUpData({
      headerText: [],
      followUpQuestions: [],
    });
    setRefreshTangential(true);
    setDisplayText("Speak into the mic...");
    setActionItemsSubmitted(false);

    setNewQueryReceived(false);
  };

  const handleStop = async () => {
    setIsTranscripting(false);
    await StopTranscription();
    setCallStatus(0);
    setDisplayText("Waiting to start call...");
  };

  const ConfirmActionItems = () => {
    console.log("Creating Jira Action Items...");
    console.log(selectedActionItems);
    socketInstance.emit("create-action-item", selectedActionItems);
    setActionItems([]);
    setSelectedActionItems([]);
    setActionItemsSubmitted(true);
  };

  const toggleSelection = (index) => {
    const selectedItem = actionItems[index];
    const isSelected = selectedActionItems.some(
      (item) => item.id === selectedItem.id
    );

    if (!isSelected) {
      setSelectedActionItems([...selectedActionItems, selectedItem]);
    } else {
      setSelectedActionItems(
        selectedActionItems.filter((item) => item.id !== selectedItem.id)
      );
    }
  };

  const handleSummaryChange = (e, index) => {
    const updatedItems = [...actionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      summary: e.target.value,
    };
    setActionItems(updatedItems);
  };

  const handleDescriptionChange = (e, index) => {
    const updatedItems = [...actionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      description: e.target.value,
    };
    setActionItems(updatedItems);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center h-[15vh] p-10">
          <h1 className="text-4xl font-bold text-primary">Transcriber</h1>

          <div className="flex space-x-4">
            {actionItems.length != 0 && (
              <Dialog defaultOpen={true}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Confirm Action Items</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="mb-7 border-b-2 pb-2">
                      Edit & Confirm Jira Action Items
                    </DialogTitle>
                    <DialogDescription className="mb-1 h-[50vh] overflow-scroll">
                      {actionItems.map((item, index) => (
                        <div key={index}>
                          <div key={index} className="items-top flex space-x-2">
                            <Checkbox
                              id={`item_${index}`}
                              checked={selectedActionItems.includes(item)}
                              onCheckedChange={() => toggleSelection(index)}
                            />
                            <div className="flex flex-col w-full">
                              <input
                                type="text"
                                value={item.summary}
                                onChange={(e) => handleSummaryChange(e, index)}
                                className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                              />
                              <textarea
                                value={item.description}
                                onChange={(e) =>
                                  handleDescriptionChange(e, index)
                                }
                                className="text-sm text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                rows="5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => ConfirmActionItems()}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button
              onClick={handleStart}
              className="btn-primary w-[90px]"
              disabled={callStatus !== 0 || !actionItemsSubmitted}
            >
              {loading ? (
                <l-ring-2
                  size="25"
                  stroke="5"
                  stroke-length="0.25"
                  bg-opacity="0.1"
                  speed="0.8"
                  color="white"
                ></l-ring-2>
              ) : (
                "Start Call"
              )}
            </Button>
            <Button
              onClick={handleStop}
              className="btn-primary"
              disabled={callStatus !== 1}
            >
              Stop Call
            </Button>
          </div>
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full relative"
        >
          <Loader
            loadingStates={loadingStates}
            loading={loading}
            duration={1000}
            loop={false}
          />
          <ResizablePanel defaultSize={35} minSize={25} maxSize={55}>
            <Transcriber
              displayText={displayText}
              transcribedList={transcribedList}
              speakers={Array.from(speakerSet)}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={45} maxSize={85}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <LLMOutput aiMessages={aiMessages} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel
                    defaultSize={50}
                    minSize={30}
                    maxSize={70}
                    onResize={(e) => setRightBoxHeight(Math.floor(e))}
                  >
                    <FollowUpQuestion
                      followUpData={followUpData}
                      height={rightBoxHeight}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <TangentialInfo
                      socketInstance={socketInstance}
                      height={100 - rightBoxHeight}
                      refreshTangential={refreshTangential}
                      setRefreshTangential={setRefreshTangential}
                    />
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
