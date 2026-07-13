import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Matching from './pages/Matching'
import MesAgriculteurs from './pages/MesAgriculteurs'
import Accueil from './pages/Accueil'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/mes-agriculteurs" element={<MesAgriculteurs />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App