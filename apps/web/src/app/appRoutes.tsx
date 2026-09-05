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
import CreatePostPage from "../features/posts/pages/CreatePostPage.tsx";
import PostPage from "../features/posts/pages/PostPage.tsx";
import UpdatePostPage from "../features/posts/pages/UpdatePostPage.tsx";

export default function AppRoutes(){
  return(
      <Routes>

        <Route path="/" element={<Layout />}>
        
          {/* public routes*/}
          <Route
            index 
            element={<p>home</p>} 
          />
          <Route 
            path="/login" 
            element={<LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={<SignupPage />} 
          />
          <Route 
            path="/test" 
            element={<TestPage/>} 
          />

          {/* protected Routes */}
          <Route 
            element={<ProtectedRoute />} 
          >

            <Route 
              path="/profile"
              element={<ProfilePage />} 
            />
            <Route 
              path="/communities" 
              element={<CommunitiesPage />}
            />
            <Route 
              path="/communities/create" 
              element={<CreateCommunityPage />}
            />
            <Route 
              path="/communities/:communityId" 
              element={<CommunityPage />} 
            />
            <Route 
              path="/communities/:communityId/update" 
              element={<UpdateCommunityPage />} 
            />
            <Route 
              path="/communities/:communityId/posts/create" 
              element={<CreatePostPage />} 
            />
            <Route 
              path="/communities/:communityId/posts/:postId" 
              element={<PostPage />} 
            />
            <Route
              path="/communities/:communityId/posts/:postId/update" 
              element=<UpdatePostPage />
            />
          </Route>
        </Route>
      </Routes>

  )
}
