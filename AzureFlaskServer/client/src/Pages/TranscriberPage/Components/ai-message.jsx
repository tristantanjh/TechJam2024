export default function AiMessage({ points }) {
  return (
    <div className='p-2 border-solid border-black border-b-2 border-slate-300'>
      {points.map((point, idx) => (
        <p key={idx} className='m-2'>- {point}</p>
      ))}
      {/* <hr/> */}
    </div>
  );
}
