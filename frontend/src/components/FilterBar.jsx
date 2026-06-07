import React, { useState } from 'react'

export const FilterBar = ({ initial = {}, onSearch, showRole = false }) => {
  const [name, setName] = useState(initial.name || '')
  const [email, setEmail] = useState(initial.email || '')
  const [address, setAddress] = useState(initial.address || '')
  const [role, setRole] = useState(initial.role || '')

  const handleSearch = (evt) => {
    if (evt && evt.preventDefault) evt.preventDefault()
    onSearch({ name: name.trim() || undefined, email: email.trim() || undefined, address: address.trim() || undefined, role: role || undefined })
  }

  const handleReset = () => {
    setName('')
    setEmail('')
    setAddress('')
    setRole('')
    onSearch({})
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-end md:space-x-3 space-y-3 md:space-y-0 mb-4" aria-label="Filter and search">
      <div className="flex-1">
        <label htmlFor="filter-name" className="text-xs text-slate-400">Name</label>
        <input id="filter-name" aria-label="Filter by name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-sm text-slate-200" placeholder="Search by name" />
      </div>

      <div className="flex-1">
        <label htmlFor="filter-email" className="text-xs text-slate-400">Email</label>
        <input id="filter-email" aria-label="Filter by email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-sm text-slate-200" placeholder="Search by email" />
      </div>

      <div className="flex-1">
        <label htmlFor="filter-address" className="text-xs text-slate-400">Address</label>
        <input id="filter-address" aria-label="Filter by address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-sm text-slate-200" placeholder="Search by address" />
      </div>

      {showRole && (
        <div className="w-44">
          <label htmlFor="filter-role" className="text-xs text-slate-400">Role</label>
          <select id="filter-role" aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-sm text-slate-200">
            <option value="">All</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button type="submit" aria-label="Search" className="px-4 py-2 bg-brand-600 text-white rounded">Search</button>
        <button type="button" aria-label="Reset filters" onClick={handleReset} className="px-3 py-2 bg-slate-800 text-slate-300 rounded">Reset</button>
      </div>
    </form>
  )
}

export default FilterBar
