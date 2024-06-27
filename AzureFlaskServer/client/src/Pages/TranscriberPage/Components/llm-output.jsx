import AiMessage from "./ai-message";

export default function LLMOutput({ aiMessages }) {
  return (
    <div>
      <h3 className="p-3 flex justify-center scroll-m-20 border-t border-b text-2xl font-semibold tracking-tight">
        LLM Output
      </h3>
      {aiMessages?.map((item, idx) => (
        <AiMessage key={idx} points={item.split("-").slice(1)} />
      ))}
    </div>
  );
}
