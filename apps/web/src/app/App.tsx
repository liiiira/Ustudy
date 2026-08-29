import {AuthProvider} from '../features/auth/context/auth.context.tsx'
import AppRoutes from './appRoutes.tsx';

function App() {


  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
