import { PlaceholdersAndVanishInput } from "@/Components/ui/placeholders-and-vanish-input";
import { useState, useEffect, useRef } from "react";
import HumanMessage from "./components/human-message";
import AiMessage from "./components/ai-message";
import LoadingMessage from "./components/loading-message";
import { useCopilot } from "@/hooks/useCopilot";
import { useLoadingMessage } from "@/hooks/useLoadingMessage";

const placeholders = [
  "Enter your question here!",
  "Help me create a new Jira issue!",
  "Show me the most recent sales. ",
];

export default function CopilotPage() {
  const containerRef = useRef(null);
  const {
    chatHistory,
    setChatHistory,
    socketInstance,
    input,
    responding,
    setInput,
    setResponding,
  } = useCopilot();
  const { newQueryReceivedCopilot, setNewQueryReceivedCopilot } =
    useLoadingMessage();

  const handleInput = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (responding) return;
    setChatHistory((prev) => [...prev, { type: "human", text: input }]);
    console.log(chatHistory);
    setNewQueryReceivedCopilot(true);
    socketInstance.emit("copilot-query", {
      query: input,
    });
    setResponding(true);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="h-screen w-full p-10">
      <div className="flex flex-col justify-between h-[100%]">
        <h1 className="text-4xl font-bold text-primary">Copilot</h1>
        <div className="flex flex-col items-center">
          <div
            className="h-[80vh] max-w-[60%] min-w-[60%] overflow-y-scroll"
            ref={containerRef}
          >
            {chatHistory.map((message, idx) => {
              return (
                <div key={idx}>
                  {message.type === "human" ? (
                    <HumanMessage text={message.text} />
                  ) : (
                    <AiMessage
                      index={idx}
                      text={message.text}
                      type={message.type}
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
