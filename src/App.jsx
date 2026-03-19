import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Login from './pages/Login'
import SetPassword from './pages/SetPassword'
import Admin from './pages/Admin'
import Teacher from './pages/Teacher'
import Parent from './pages/Parent'
import Management from './pages/Management'

function App() {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/set-password'
      }
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/admin" element={<Management />} />  {/* ← Management here */}
        <Route path="/admin-portal" element={<Admin />} /> {/* ← old Admin here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App