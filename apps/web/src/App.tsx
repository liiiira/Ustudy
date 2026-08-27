import {Route, Routes} from 'react-router';

import './App.css'
import Layout from './components/layout/layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<p>home</p>} />
        <Route path="/profile" element={<p>user</p>} />
      </Route>
    
    </Routes>
  )
}

export default App
