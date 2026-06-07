import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.instance'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (payload) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', payload)
      const { accessToken, user: userProfile } = response.data

      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userProfile))
      localStorage.setItem('role', userProfile.role)

      setToken(accessToken)
      setUser(userProfile)
      return response.data
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedFields) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
