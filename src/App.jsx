import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Matching from './pages/Matching'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matching" element={<Matching />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App