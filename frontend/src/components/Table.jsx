import React, { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export function Table({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available.',
  serverSide = false,
  total = null,
  page = 1,
  size = 10,
  onPageChange,
  onSort,
  onSizeChange,
  activeSortBy = null,
  activeSortDirection = null,
}) {
  const [sortKey, setSortKey] = useState(activeSortBy || null)
  const [sortDir, setSortDir] = useState(activeSortDirection || 'asc')

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => c.accessor === sortKey)
    if (!col) return data

    const copy = [...data]
    copy.sort((a, b) => {
      const va = col.accessorFn ? col.accessorFn(a) : a[sortKey]
      const vb = col.accessorFn ? col.accessorFn(b) : b[sortKey]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortDir === 'asc' ? -1 : 1
      if (sa > sb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [data, sortKey, sortDir, columns])

  const handleSort = (accessor, sortable) => {
    if (!sortable) return
    // server-side sorting: delegate to parent
    if (onSort) {
      const nextDir = sortKey === accessor && sortDir === 'asc' ? 'desc' : 'asc'
      setSortKey(accessor)
      setSortDir(nextDir)
      onSort({ sortBy: accessor, sortDirection: nextDir })
      return
    }

    // client-side sorting
    if (sortKey === accessor) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(accessor)
      setSortDir('asc')
    }
  }

  // Sync active sort props when changed externally
  React.useEffect(() => {
    if (activeSortBy != null) setSortKey(activeSortBy)
    if (activeSortDirection != null) setSortDir(activeSortDirection.toLowerCase())
  }, [activeSortBy, activeSortDirection])

  const totalPages = total && size ? Math.max(1, Math.ceil(total / size)) : null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm" aria-describedby="table-caption">
        <caption id="table-caption" className="sr-only">Results table</caption>
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-xs">
            {columns.map((column, idx) => (
              <th key={idx} className={`px-6 py-4 ${column.className || ''}`} scope="col">
                <div className="flex items-center">
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.accessor, column.sortable)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSort(column.accessor, column.sortable)
                        }
                      }}
                      className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                      aria-sort={sortKey === column.accessor ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      aria-label={`${column.header} sortable`}
                    >
                      <span>{column.header}</span>
                      <span className="text-slate-500" aria-hidden>
                        {sortKey === column.accessor ? (
                          sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronUp size={14} className="opacity-30" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-400 font-medium">Loading records...</span>
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-800/30 transition-colors duration-150" tabIndex={0}>
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 text-slate-300 ${column.className || ''}`}>
                    {column.render(item, rowIdx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {total != null && (
        <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-slate-900/60 border-t border-slate-800 text-sm space-y-3 md:space-y-0">
          <div className="text-slate-400">Showing {Math.min((page - 1) * size + 1, total)} - {Math.min(page * size, total)} of {total}</div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-slate-400 text-xs">Page size</label>
              <select
                aria-label="Page size"
                value={size}
                onChange={(e) => onSizeChange && onSizeChange(parseInt(e.target.value, 10))}
                className="bg-slate-800 text-slate-200 p-1 rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

              <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50"
                onClick={() => onPageChange && onPageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                Prev
              </button>

              <div className="flex items-center space-x-1">
                {totalPages && Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 20).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange && onPageChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    aria-label={`Go to page ${p}`}
                    className={`px-3 py-1 rounded focus:outline-none focus:ring-2 ${p === page ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    {p}
                  </button>
                ))}
                {totalPages > 20 && <span className="px-2 text-slate-400">…</span>}
              </div>

              <button
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50"
                onClick={() => onPageChange && onPageChange(page + 1)}
                disabled={totalPages != null ? page >= totalPages : false}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
