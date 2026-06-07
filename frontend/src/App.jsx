import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from './context/auth.context'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminUsers } from './pages/AdminUsers'
import { AdminStores } from './pages/AdminStores'
import { AccessDenied } from './pages/AccessDenied'
import { UserDashboard } from './pages/UserDashboard'
import { OwnerDashboard } from './pages/OwnerDashboard'
import { ChangePassword } from './pages/ChangePassword'

// Route guards
const normalizeRole = (r) => {
  if (!r) return r
  const role = String(r).toUpperCase()
  // Map common backend role aliases to the app's canonical roles
  if (role === 'ADMIN' || role === 'SYSTEM_ADMIN') return 'SYSTEM_ADMIN'
  if (role === 'OWNER' || role === 'STORE_OWNER') return 'STORE_OWNER'
  if (role === 'USER' || role === 'NORMAL_USER' || role === 'CUSTOMER') return 'NORMAL_USER'
  return role
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && Array.isArray(allowedRoles)) {
    const canonical = normalizeRole(user.role)
    const allowedCanonical = allowedRoles.map(normalizeRole)
    if (!allowedCanonical.includes(canonical)) {
      // Show access denied when authenticated but not authorized
      return <Navigate to="/access-denied" replace />
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    if (user.role === 'SYSTEM_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user.role === 'STORE_OWNER') {
      return <Navigate to="/owner/dashboard" replace />
    } else {
      return <Navigate to="/user/dashboard" replace />
    }
  }

  return <>{children}</>
}

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'SYSTEM_ADMIN' ]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={[ 'SYSTEM_ADMIN' ]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute allowedRoles={[ 'SYSTEM_ADMIN' ]}>
                <AdminStores />
              </ProtectedRoute>
            }
          />

          <Route path="/access-denied" element={<AccessDenied />} />

          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'NORMAL_USER' ]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'STORE_OWNER' ]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={[ 'SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER' ]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
