import React from 'react'

export default function AiMessage({points}) {
    return <div>
        {points.map(point => <p>-   {point}</p>)}
        <p>-------------------------------------------------</p>
    </div>
}