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
  { type: "human", text: "How to set up ad campaigns?" },
  {
    type: "ai",
    text: "To set up an ad campaign in Tik Tok Ads Manager, follow these steps: Log into your Tik Tok Ads Manager account, click on 'Create ad', choose your advertising ibjective, set a campaign name, and establish a campaign budget. You can also decide on special ad categories, enable split testing, and optimize the campaign budget if necessary.",
  },
  {
    type: "human",
    text: "Who made the biggest purchase in Singapore Outlet 1?",
  },
  {
    type: "ai",
    text: "The provided text does not contain information about individual purchases or details about who made the biggest purchase in Singapore Outlet 1.",
  },
  {
    type: "human",
    text: "Who made the biggest purchase in Singapore Outlet 1?",
  },
  {
    type: "ai",
    text: "The biggest purchase in Singapore Outlet 1 was made by Customer ID 7.",
  },
  { type: "human", text: "Summarize the sales for Singapore Outlet 1" },
  {
    type: "ai",
    text: "The total sales for Singapore Outlet 1, which has the Shop ID SG1, amounted to $599.23.",
  },
  { type: "human", text: "Summarize the sales for Singapore Outlet 1" },
  {
    type: "ai",
    text: "At Singapore Outlet 1, the product that achieved the highest sales is 'Eau de Toilette,' which has the product ID 'ES41.' Additionally, the customer who made the most purchases from this outlet is John Doe, who is identified by the customer ID 7. This information highlights both the most popular product and the top customer at this specific location.",
  },
  { type: "human", text: "Help me create a Jira Issue" },
  {
    type: "ai",
    text: "The provided texts do not contain information on how to create a Jira issue. Please refer to Jira's official documentation or support for guidance on creating an issue in Jira.",
  },
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
