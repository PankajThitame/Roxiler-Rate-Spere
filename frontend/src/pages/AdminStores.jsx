import React, { useEffect, useState } from 'react'
import api from '../api/axios.instance'
import { toast } from 'react-toastify'
import { Table } from '../components/Table'
import FilterBar from '../components/FilterBar'

export const AdminStores = () => {
  const [stores, setStores] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true)
      try {
        const params = { page, size, ...filters }
        if (sortBy) params.sortBy = sortBy
        if (sortDirection) params.sortDirection = sortDirection
        const res = await api.get('/admin/stores', { params })
        setStores(res.data.items || res.data)
        if (res.data.total != null) setTotal(res.data.total)
      } catch (err) {
        toast.error('Failed to fetch stores')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStores()
  }, [page, size, filters, sortBy, sortDirection])

  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [filters, setFilters] = useState({})
  const [total, setTotal] = useState(null)
  const [sortBy, setSortBy] = useState(null)
  const [sortDirection, setSortDirection] = useState(null)

  const handleSearch = async (f) => {
    setFilters(f)
    setIsLoading(true)
    try {
      const params = { page, size, ...f }
      if (sortBy) params.sortBy = sortBy
      if (sortDirection) params.sortDirection = sortDirection
      const res = await api.get('/admin/stores', { params })
      setStores(res.data.items || res.data)
      if (res.data.total != null) setTotal(res.data.total)
    } catch (err) {
      toast.error('Failed to fetch stores')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1) return
    setPage(nextPage)
  }

  const handleSort = ({ sortBy: sb, sortDirection: sd }) => {
    setSortBy(sb)
    setSortDirection(sd)
  }

  const handleSizeChange = (newSize) => {
    setSize(newSize)
    setPage(1)
  }

  const columns = [
    { header: 'Name', accessor: 'name', sortable: true, render: (s) => s.name },
    { header: 'Email', accessor: 'email', sortable: true, render: (s) => s.email },
    { header: 'Owner', accessor: 'ownerName', sortable: true, accessorFn: (s) => s.ownerName || s.ownerId, render: (s) => s.ownerName || s.ownerId },
  ]

  return (
    <div>
      <FilterBar initial={{}} onSearch={handleSearch} />
      <Table
        columns={columns}
        data={stores}
        isLoading={isLoading}
        total={total}
        page={page}
        size={size}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        onSort={handleSort}
        activeSortBy={sortBy}
        activeSortDirection={sortDirection}
      />
    </div>
  )
}

export default AdminStores
