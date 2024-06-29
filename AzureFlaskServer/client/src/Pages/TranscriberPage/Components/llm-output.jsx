import AiMessage from "./ai-message";

export default function LLMOutput({ aiMessages }) {
  return (
    <div>
      <h3 className="p-3 flex justify-start border-t text-lg font-bold text-slate-700 antialiased tracking-normal">
        Information
      </h3>
      <div className="mr-1 overflow-y-scroll h-[75vh]">
        {aiMessages?.length === 0 ? (
          <h4 className="max-h-full h-full flex justify-center items-center text-xl font-semibold tracking-tight">
            No information available...
          </h4>
        ) : null}
        {aiMessages?.map((item, idx) => (
          <AiMessage key={idx} points={item.split("-").slice(1)} />
        ))}
      </div>
    </div>
  );
}
