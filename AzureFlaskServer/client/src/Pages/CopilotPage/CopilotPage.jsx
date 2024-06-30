import { PlaceholdersAndVanishInput } from "@/Components/ui/placeholders-and-vanish-input";
import { useState } from "react";
import HumanMessage from "./components/human-message";
import AiMessage from "./components/ai-message";
const placeholders = [
  "Enter your question here!",
  "Help me create a new Jira issue!",
  "Show me the most recent sales. lorem",
];
const placeholderMessages = [
  { type: "ai", text: "Sure! I can help you with that." },
  { type: "ai", text: "I can help you with that." },
  {
    type: "ai",
    text: "I can help you with that. lorem ipsum njkasndijashdiuasgdhjdshjfbdsajfbadshjkfgadshlfgdsgfjdsbfjkdsbnfjkdshfkijdshgiuI can help you with that. lorem ipsum njkasndijashdiuasgdhjdshjfbdsajfbadshjkfgadshlfgdsgfjdsbfjkdsbnfjkdshfkijdshgiu",
  },
];

export default function CopilotPage() {
  const [input, setInput] = useState("");
  const [responding, setResponding] = useState(false);
  const [messageList, setMessageList] = useState(placeholderMessages); // [ { type: "human" | "ai", text: string }
  const handleInput = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (responding) return;
    setMessageList((prev) => [...prev, { type: "human", text: input }]);
    console.log(messageList);
    setResponding(true);
    setTimeout(() => {
      setResponding(false);
    }, 3000);
  };
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
