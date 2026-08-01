import {Route, Routes} from "react-router-dom"
import MainLayout from "../components/layout/mainLayout.tsx" 
import Home from "../components/home.tsx"
function App()  {
  return (
    <Routes>
        <Route element={<MainLayout  />}>
            <Route index element={<Home />} />
        </Route>
      </Routes>
    );
}
export default App
