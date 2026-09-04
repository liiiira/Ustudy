import { Routes, Route } from "react-router"
import Layout from '../components/layout/layout';
import TestPage from '../TestPage.tsx'
import LoginPage from '../features/auth/pages/loginPage.tsx';
import SignupPage from "../features/users/pages/signupPage.tsx";
import ProfilePage from '../features/users/components/profilePage.tsx';
import ProtectedRoute from "../components/protectedRoute.tsx";
import CreateCommunityPage from "../features/communities/pages/createCommunityPage.tsx";
import CommunitiesPage from "../features/communities/pages/communitiesPage.tsx";
import CommunityPage from "../features/communities/pages/communityPage.tsx";
import UpdateCommunityPage from "../features/communities/pages/updateCommunityPage.tsx";

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
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/communities/create" element={<CreateCommunityPage />} />
            <Route path="/communities/:id" element={<CommunityPage />} />
            <Route path="/communities/:id/update" element={<UpdateCommunityPage />} />
          </Route>
        </Route>
      </Routes>

  )
}
