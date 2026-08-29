import {Route, Routes} from 'react-router';
import './App.css'
import Layout from './components/layout/layout';
import TestPage from './TestPage.tsx'
import {AuthProvider} from './features/auth/context/auth.context.tsx'
import { LoginForm } from './features/auth/components/LoginForm.tsx';
import SignupForm from './features/users/components/signupForm.tsx';
function App() {


  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<p>home</p>} />
          <Route path="/profile" element={<p>Profile</p>} />
          <Route path="/test" element={<TestPage/>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
