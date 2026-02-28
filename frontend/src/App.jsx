import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'

function Protected({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <Protected><Chat /></Protected>
        } />
      </Routes>
    </BrowserRouter>
  )
}
