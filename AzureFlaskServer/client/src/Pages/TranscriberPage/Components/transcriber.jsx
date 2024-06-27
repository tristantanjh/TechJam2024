import React, { useRef, useEffect } from "react";

export default function Transcriber({ displayText, transcribedList }) {
  const containerRef = useRef(null);

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
  }, [transcribedList]);

  return (
    <div>
      <h3 className="p-3 flex justify-center scroll-m-20 border-t border-b text-2xl font-semibold tracking-tight">
        Transcribed Text
      </h3>
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
                Speaker {item.speakerId}: {item.text}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
