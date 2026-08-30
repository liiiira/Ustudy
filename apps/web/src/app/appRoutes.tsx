import { Routes, Route } from "react-router"
import Layout from '../components/layout/layout';
import TestPage from '../TestPage.tsx'
import LoginPage from '../features/auth/pages/loginPage.tsx';
import SignupPage from "../features/users/pages/signupPage.tsx";
import ProfilePage from '../features/users/components/profilePage.tsx';
import ProtectedRoute from "../components/protectedRoute.tsx";

export default function AppRoutes(){
  return(
      <Routes>

        <Route path="/" element={<Layout />}>
        
          {/* public routes*/}
          <Route index element={<p>home</p>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/test" element={<TestPage/>} />
          {/* protected Routes */}
          <Route element={<ProtectedRoute />} >

            <Route path="/profile" element={<ProfilePage />} />

          </Route>
        </Route>
      </Routes>

  )
}
