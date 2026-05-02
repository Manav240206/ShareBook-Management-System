import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'
import Auctions from './pages/Auctions'
import './index.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <CartProvider>
      <div className="app-container">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auctions" element={isLoggedIn ? <Auctions /> : <Navigate to="/login" replace />} />
            <Route path="/cart" element={isLoggedIn ? <Cart /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  )
}

export default App
