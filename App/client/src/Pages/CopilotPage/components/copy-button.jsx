import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ point, visible }) {
  const [clicked, setClicked] = useState(false);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 2000);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => copyToClipboard(point)}
            className="p-2 rounded-lg self-center scale-75 hover:cursor-pointer opacity-15 hover:bg-slate-300 hover:opacity-60 transition-all "
          >
            {visible ? clicked ? <Check /> : <Copy /> : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
