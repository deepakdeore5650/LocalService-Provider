import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatBot from './components/ChatBot'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserProfile from './pages/UserProfile'
import ProviderProfile from './pages/ProviderProfile'
import ProviderPublic from './pages/ProviderPublic'
import ProviderReviews from './pages/ProviderReviews'
import Services from './pages/Services'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/provider/profile" element={<ProviderProfile />} />
              <Route path="/provider/reviews" element={<ProviderReviews />} />
              <Route path="/providers/:id" element={<ProviderPublic />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
          <ChatBot />
          <ToastContainer />
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
