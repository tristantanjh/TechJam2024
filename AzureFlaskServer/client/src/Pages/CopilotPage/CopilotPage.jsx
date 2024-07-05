import { PlaceholdersAndVanishInput } from "@/Components/ui/placeholders-and-vanish-input";
import { useState, useEffect, useRef } from "react";
import HumanMessage from "./components/human-message";
import AiMessage from "./components/ai-message";
import LoadingMessage from "./components/loading-message";
import { io } from "socket.io-client";
import { useLoadingMessage } from "@/hooks/useLoadingMessage";

const placeholders = [
  "Enter your question here!",
  "Help me create a new Jira issue!",
  "Show me the most recent sales. ",
];
const placeholderMessages = [
  { type: "ai", text: "How can I help you today?" },
];

export default function CopilotPage() {
  const containerRef = useRef(null);
  const [input, setInput] = useState("");
  const [responding, setResponding] = useState(false);
  const socketInitialised = useRef(false);
  const [socketInstance, setSocketInstance] = useState(null);
  const [messageList, setMessageList] = useState(placeholderMessages); // [ { type: "human" | "ai", text: string }
  const { newQueryReceivedCopilot, setNewQueryReceivedCopilot } =
    useLoadingMessage();

  const handleInput = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (responding) return;
    setMessageList((prev) => [...prev, { type: "human", text: input }]);
    console.log(messageList);
    setNewQueryReceivedCopilot(true);
    socketInstance.emit("copilot-query", {
      query: input,
    });
    setResponding(true);
  };

  // Initialise the socket on page load
  useEffect(() => {
    if (!socketInitialised.current) {
      const socket = io("http://localhost:9000/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:5173",
        },
      });

      setSocketInstance(socket);

      socket.on("connected", (data) => {
        console.log(`Connected to websocket as ${data.data}`);
      });

      socket.on("copilot-output", (data) => {
        console.log(data?.output?.action_type);
        setNewQueryReceivedCopilot(false);
        if (data?.output?.action_type === "api_call") {
          setMessageList((prevList) => [
            ...prevList,
            { type: "ai-api", text: data["output"] },
          ]);
        } else {
          setMessageList((prevList) => [
            ...prevList,
            { type: "ai", text: data["output"] },
          ]);
        }
        setResponding(false);
        setInput("");
      });

      socketInitialised.current = true;
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messageList]);

  return (
    <div className="h-screen w-full p-10">
      <div className="flex flex-col justify-between h-[100%]">
        <h1 className="text-4xl font-bold text-primary">Copilot</h1>
        <div className="flex flex-col items-center">
          <div
            className="h-[80vh] max-w-[60%] min-w-[60%] overflow-y-scroll"
            ref={containerRef}
          >
            {messageList.map((message, idx) => {
              return (
                <div key={idx}>
                  {message.type === "human" ? (
                    <HumanMessage text={message.text} />
                  ) : (
                    <AiMessage
                      key={idx}
                      text={message.text}
                      type={message.type}
                      socket={socketInstance}
                    />
                  )}
                </div>
              );
            })}
            {newQueryReceivedCopilot && <LoadingMessage />}
          </div>
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInput}
            onSubmit={handleSubmit}
            duration={3000}
            responding={responding}
          />
        </div>
      </div>
    </div>
  );
}
