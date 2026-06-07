import React from 'react'

export const Pagination = ({ page, totalPages, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3 py-1 bg-slate-800 rounded">Prev</button>
      <span className="text-sm">{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="px-3 py-1 bg-slate-800 rounded">Next</button>
    </div>
  )
}

export default Pagination
