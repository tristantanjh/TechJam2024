import React from "react";

export default function Transcriber({ displayText, transcribedList }) {
  return (
    <div>
      <h3 className="p-3 flex justify-center scroll-m-20 border-t border-b text-2xl font-semibold tracking-tight">
        Transcribed Text
      </h3>
      <div>
        <div style={{ height: "75vh" }}>
          {transcribedList.length === 0 && (
            <h4 className="max-h-full h-full flex justify-center items-center text-xl font-semibold tracking-tight">
              {displayText}
            </h4>
          )}
          {transcribedList.map((item, idx) => (
            <p key={idx} className="p-2">
              Speaker {item.speakerId}: {item.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
