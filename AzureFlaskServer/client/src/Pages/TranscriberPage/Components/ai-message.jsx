export default function AiMessage({ points }) {
  return (
    <div>
      {points.map((point, idx) => (
        <p key={idx}>- {point}</p>
      ))}
    </div>
  );
}
