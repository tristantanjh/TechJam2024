import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { BotMessageSquare, Copy } from "lucide-react";
import { useState } from "react";
import CopyButton from "./copy-button";

export default function AiMessage({ text }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-2 flex items-start justify-start">
      <Avatar className="mt-2">
        <AvatarFallback>
          <BotMessageSquare />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col ml-4 w-[70%]">
        <div
          onMouseOver={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="flex justify-between rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <p className="p-2 m-1 font-medium  w-[85%]">{text}</p>
          <CopyButton point={text} visible={visible} />
        </div>
      </div>
    </div>
  );
}
