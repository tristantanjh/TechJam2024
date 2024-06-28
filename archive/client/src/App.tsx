import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import instance from './axios.instance'


function App() {
  const [text, setText] = useState<string>("")

  useEffect(() => {
    instance.get('/').then((res: any) => {
      setText(res.data)
    })
  }, [])

  return (
    <div className="App">
      <p>{text}</p>
    </div>
  );
}

export default App;
