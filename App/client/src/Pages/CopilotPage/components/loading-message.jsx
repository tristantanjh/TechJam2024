import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { BotMessageSquare, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoadingMessage() {
  const [visible, setVisible] = useState("");
  const handleHover = (idx) => {
    setVisible(idx);
  };
  const handleLeave = () => {
    setVisible("");
  };

  return (
    <div className="p-2 flex items-start justify-start">
      <Avatar className="mt-2">
        <AvatarFallback>
          <BotMessageSquare />
        </AvatarFallback>
      </Avatar>
      <div className="flex ml-4 h-10 items-end">
        <div
          className="flex rounded-md items-center"
          onMouseOver={() => handleHover(0)}
          onMouseLeave={handleLeave}
        >
          <div className="loader-custom">
            <li className="ball-custom"></li>
            <li className="ball-custom"></li>
            <li className="ball-custom"></li>
          </div>
        </div>
      </div>
    </div>
  );
}
