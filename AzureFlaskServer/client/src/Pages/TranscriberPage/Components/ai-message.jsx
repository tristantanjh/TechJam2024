import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { BotMessageSquare } from "lucide-react";
import { useState } from "react";
import CopyButton from "./copy-button";
import { useLoadingMessage } from "@/hooks/useLoadingMessage";

export default function AiMessage({ points }) {
  const [visible, setVisible] = useState("");
  const handleHover = (idx) => {
    setVisible(idx);
  };
  const handleLeave = () => {
    setVisible("");
  };

  return (
    <div className="p-2 flex items-start justify-center border-solid border-b-2 border-gray-300">
      <Avatar className="mt-2">
        <AvatarFallback>
          <BotMessageSquare />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col ml-4 w-[80%]">
        {points.map((point, idx) => (
          <div
            key={idx}
            onMouseOver={() => handleHover(idx)}
            onMouseLeave={handleLeave}
            className="flex rounded-md hover:bg-slate-100 transition-colors"
          >
            <p className="p-2 m-1 font-medium  w-[85%]">• {point}</p>
            <CopyButton point={point} idx={idx} visible={visible} />
          </div>
        ))}
      </div>
    </div>
  );
}
