import {useState} from 'react';
import './App.css'

function App() {
  const [data, setData] = useState<string | null>(null);
  async function handleClick(){
    const response =  await fetch("http://localhost:3000/data");
    const data = await response.json();
    setData(data.value);
  }
  return (<>
  <p className="text-red-500">Hello world</p>
  <button className="py-2 px-4 bg-blue-500 rounded-l text-white hover:cursor hover:bg-blue-900" onClick={handleClick}>fetch</button>
  <p>{data}</p>
  </>
  )
}

export default App
