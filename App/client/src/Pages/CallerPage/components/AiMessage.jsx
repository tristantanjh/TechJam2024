import React from 'react'

export default function AiMessage({points}) {
    return <div>
        {points.map((point, idx) => <p key={idx}>-   {point}</p>)}
        <p>-------------------------------------------------</p>
    </div>
}