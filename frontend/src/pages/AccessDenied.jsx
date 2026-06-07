import React from 'react'
import { Link } from 'react-router-dom'

export const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-6">
      <div className="max-w-xl text-center bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-3">Access Denied</h2>
        <p className="text-slate-400 mb-4">You do not have permission to view this page.</p>
        <Link to="/" className="px-4 py-2 bg-brand-600 text-white rounded">Return home</Link>
      </div>
    </div>
  )
}

export default AccessDenied
