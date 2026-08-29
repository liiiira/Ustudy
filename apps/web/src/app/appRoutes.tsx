import { Routes, Route } from "react-router"
import Layout from '../components/layout/layout';
import TestPage from '../TestPage.tsx'
import LoginPage from '../features/auth/pages/loginPage.tsx';
import SignupForm from '../features/users/components/signupForm.tsx';
import ProfilePage from '../features/users/components/profilePage.tsx';
import ProtectedRoute from "../components/protectedRoute.tsx";

export default function AppRoutes(){
  return(
      <Routes>

        <Route path="/" element={<Layout />}>
        
          {/* public routes*/}
          <Route index element={<p>home</p>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupForm />} />

          {/* protected Routes */}
          <Route element={<ProtectedRoute />} >

            <Route path="/test" element={<TestPage/>} />
            <Route path="/profile" element={<ProfilePage />} />

          </Route>
        </Route>
      </Routes>

  )
}
