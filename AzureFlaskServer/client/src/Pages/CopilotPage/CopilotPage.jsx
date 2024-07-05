import { PlaceholdersAndVanishInput } from "@/Components/ui/placeholders-and-vanish-input";
import { useState, useEffect, useRef } from "react";
import HumanMessage from "./components/human-message";
import AiMessage from "./components/ai-message";
import { io } from "socket.io-client";

const placeholders = [
  "Enter your question here!",
  "Help me create a new Jira issue!",
  "Show me the most recent sales. ",
];
const placeholderMessages = [
  // { type: "ai", text: "Sure! I can help you with that." },
  // { type: "ai", text: "I can help you with that." },
  // {
  //   type: "ai",
  //   text: "I can help you with that. lorem ipsum njkasndijashdiuasgdhjdshjfbdsajfbadshjkfgadshlfgdsgfjdsbfjkdsbnfjkdshfkijdshgiuI can help you with that. lorem ipsum njkasndijashdiuasgdhjdshjfbdsajfbadshjkfgadshlfgdsgfjdsbfjkdsbnfjkdshfkijdshgiu",
  // },
  { type: "ai", text: "Ask me anything! I can help you with that." },
];

export default function CopilotPage() {
  const [input, setInput] = useState("");
  const [responding, setResponding] = useState(false);
  const socketInitialised = useRef(false);
  const [socketInstance, setSocketInstance] = useState(null);
  const [messageList, setMessageList] = useState(placeholderMessages); // [ { type: "human" | "ai", text: string }
  const handleInput = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (responding) return;
    setMessageList((prev) => [...prev, { type: "human", text: input }]);
    console.log(messageList);
    socketInstance.emit("copilot-query", {
      query: input
    });
    setResponding(true);
    setTimeout(() => {
      setResponding(false);
      setInput("");
    }, 3000);
  };

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

      socket.on("copilot-output", (data) => {
        console.log(`Returned copilot output ${data["output"]}`);

        if (data["output"]) {
          setMessageList((prevList) => [...prevList, { type: "ai", text: data["output"] }]);
        }
      })

      socketInitialised.current = true;
    }
  }, []);

  return (
    <div className="h-screen w-full p-10">
      <div className="flex flex-col justify-between h-[100%]">
        <h1 className="text-4xl font-bold text-primary">Copilot</h1>
        <div className="flex flex-col items-center">
          <div className="h-[80vh] max-w-[60%]">
            {messageList.map((message, idx) => {
              return (
                <div key={idx}>
                  {message.type === "human" ? (
                    <HumanMessage text={message.text} />
                  ) : (
                    <AiMessage text={message.text} />
                  )}
                </div>
              );
            })}
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
