import {Route, Routes} from 'react-router';
import './App.css'
import Layout from './components/layout/layout';
import TestPage from './TestPage.tsx'
function App() {


  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<p>home</p>} />
        <Route path="/profile" element={<p>Profile</p>} />
        <Route path="/test" element={<TestPage/>} />
      </Route>
    
    </Routes>
  )
}

export default App
