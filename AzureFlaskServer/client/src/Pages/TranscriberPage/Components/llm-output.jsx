import AiMessage from "./ai-message";

export default function LLMOutput({ aiMessages }) {
  return (
    <div>
      {aiMessages?.map((item, idx) => (
        <AiMessage key={idx} points={item.split("-").slice(1)} />
      ))}
    </div>
  );
}
