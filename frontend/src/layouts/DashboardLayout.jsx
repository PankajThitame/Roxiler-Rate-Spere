import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth.context'

export const DashboardLayout = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <Link to="/" className="text-xl font-bold">RateSphere</Link>
          <nav className="space-x-4">
            <Link to="/admin/dashboard" className="text-sm">Dashboard</Link>
            <Link to="/admin/users" className="text-sm">Users</Link>
            <Link to="/admin/stores" className="text-sm">Stores</Link>
          </nav>
        </header>

        {/* Debug panel: shows logged-in user and role for troubleshooting */}
        <div className="mb-4">
          <div className="text-xs text-slate-500">Debug:</div>
          <div className="text-sm text-slate-300">Authenticated: {isAuthenticated ? 'yes' : 'no'}</div>
          <div className="text-sm text-slate-300">Role: {user?.role || '—'}</div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
