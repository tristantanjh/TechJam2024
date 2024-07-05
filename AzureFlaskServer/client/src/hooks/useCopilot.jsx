import {
  createContext,
  useMemo,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useLoadingMessage } from "./useLoadingMessage";

const CopilotContext = createContext();

const placeholderMessages = [
  { type: "ai", text: "Ask me anything! I can help you with that." },
];
export const CopilotProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState(placeholderMessages);
  const [responding, setResponding] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);
  const socketInitialised = useRef(false);
  const { setNewQueryReceivedCopilot } = useLoadingMessage();

  useEffect(() => {
    if (!socketInitialised.current) {
      console.log("Initialising socket");
      const socket = io("http://localhost:9000/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:5173",
        },
      });

      socket.on("connected", (data) => {
        console.log(`Connected to websocket as ${data.data}`);
      });

      socket.on("copilot-output", (data) => {
        console.log(data?.output?.action_type);
        if (data?.output?.action_type === "api_call") {
          setChatHistory((prevList) => [
            ...prevList,
            { type: "ai-api", text: data["output"] },
          ]);
        } else {
          setChatHistory((prevList) => [
            ...prevList,
            { type: "ai", text: data["output"] },
          ]);
        }
        setResponding(false);
        setNewQueryReceivedCopilot(false);
        setInput("");
      });

      setSocketInstance(socket);
    }
  }, []);

  const value = useMemo(
    () => ({
      chatHistory,
      setChatHistory,
      socketInstance,
      input,
      setInput,
      responding,
      setResponding,
    }),
    [chatHistory, socketInstance, input, responding]
  );

  return (
    <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const context = useContext(CopilotContext);

  if (!context) {
    throw new Error("useCopilot must be used within a CopilotProvider");
  }

  return context;
};
