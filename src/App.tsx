import { useEffect, useState } from 'react';
import './App.css'
import TestPost from './testPost/TestPost'

function App() {

  const [modeUrl, setModeUrl] = useState<string>('');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setModeUrl('http://localhost:8080');
    } else {
      setModeUrl('https://goldfish-app-lmlas.ondigitalocean.app/');
    }
  }, []);

  return (
    <>
      <h1>HikeSense</h1>
      <TestPost modeUrl={modeUrl}/>
    </>
  )
}

export default App
