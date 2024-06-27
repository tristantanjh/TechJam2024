import React, { useRef, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"



export default function Transcriber({ displayText, transcribedList, speakers }) {
  const containerRef = useRef(null);
  const [servicePersonnel, setServicePersonnel] = useState("");
  const [isConfirmedPersonnel, setIsConfirmedPersonnel] = useState(false)

  const getBackgroundColor = (speakerId) => {
    switch (speakerId) {
      case "Guest-1":
        return "bg-gray-100";
      case "Guest-2":
        return "bg-gray-200";
      default:
        return;
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    console.log(transcribedList)
  }, [transcribedList]);

  return (
    <div>
      <div className="p-3 flex flex-col items-center scroll-m-20 border-t border-b">
        <h3 className="text-2xl font-semibold tracking-tight mb-3">Transcribed Text</h3>
        <div className={`flex w-96 justify-around ${isConfirmedPersonnel ? 'hidden' : ''}`}>
          <Select disabled={!transcribedList.length} className='mr-3' onValueChange={e => setServicePersonnel(e)}>
            <SelectTrigger className="w-[260px] text-base">
              <SelectValue placeholder="Select which speaker are you" />
            </SelectTrigger>
            <SelectContent>
              {speakers.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Button onClick={e => setIsConfirmedPersonnel(true)} disabled={!servicePersonnel}>Confirm</Button>

        </div>
  
      </div>
      <div>
        <div ref={containerRef} style={{ height: "75vh", overflowY: "auto" }}>
          {transcribedList.length === 0 && (
            <h4 className="max-h-full h-full flex justify-center items-center text-xl font-semibold tracking-tight">
              {displayText}
            </h4>
          )}
          {transcribedList.map((item, idx) =>
            item.speakerId === "SYSTEM" ? (
              <p key={idx} className="p-2 font-bold text-red-600">
                END OF CALL
              </p>
            ) : (
              <p key={idx} className={`p-2 ${getBackgroundColor(item.speakerId)}`}>
                {item.speakerId == servicePersonnel ? "You" : 
                  item.speakerId != "Unknown" ?  "Customer" : "Speaker " + item.speakerId}: {item.text}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
