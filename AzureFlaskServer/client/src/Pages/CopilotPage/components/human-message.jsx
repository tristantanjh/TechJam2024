import { useState } from "react";

export default function HumanMessage({ text }) {
  return (
    <>
      <div className="p-2 flex items-start justify-end w-full">
        <div className="flex rounded-2xl bg-slate-200 hover:bg-slate-300 transition-colors">
          <p className="p-2 m-1 font-medium text-right">{text}</p>
        </div>
      </div>
    </>
  );
}
