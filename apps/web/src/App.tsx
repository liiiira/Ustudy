import {Route, Routes} from 'react-router';
import { useState } from 'react';
import './App.css'
import Layout from './components/layout/layout';
import { AuthContext } from './context/authContext';
import ProfilePage from './pages/profilePage';

function App() {
  const [user, setUser] = useState<Record<string, string>>({userId: '1'})
  return (
    <AuthContext value={user}>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<p>home</p>} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    
    </Routes>
    </AuthContext>
  )
}

export default App
