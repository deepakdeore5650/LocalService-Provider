import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('user')) }catch(e){ return null }
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore auth state from localStorage on mount
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      // Ignore parse errors
      localStorage.removeItem('user')
    }
    setIsLoading(false)
  }, [])

  useEffect(()=>{
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = (userObj) => setUser(userObj)
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }
  // normalize backend DTO fields (phoneNo -> phone) for frontend convenience
  const normalizeAndLogin = (userObj) => {
    if (!userObj) {
      logout()
      return
    }
    const normalized = {
      ...userObj,
      phone: userObj.phone ?? userObj.phoneNo ?? userObj.phoneNo ?? null,
      pincode: userObj.pincode ?? userObj.pincode,
    }
    setUser(normalized)
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isProvider = () => user?.role === 'PROVIDER'
  const isUser = () => user?.role === 'USER'
  
  const isActiveUser = () => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'PROVIDER') return user.status === 'active';
    return user.status !== 'inactive';
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, normalizeAndLogin, isAdmin, isProvider, isUser, isActiveUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
