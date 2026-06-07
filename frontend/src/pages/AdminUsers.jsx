import React, { useEffect, useState } from 'react'
import api from '../api/axios.instance'
import { toast } from 'react-toastify'
import { Table } from '../components/Table'
import FilterBar from '../components/FilterBar'

export const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const params = { page, size, ...filters }
        if (sortBy) params.sortBy = sortBy
        if (sortDirection) params.sortDirection = sortDirection
        const res = await api.get('/admin/users', { params })
        setUsers(res.data.items || res.data)
        if (res.data.total != null) setTotal(res.data.total)
      } catch (err) {
        toast.error('Failed to fetch users')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
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
      const res = await api.get('/admin/users', { params })
      setUsers(res.data.items || res.data)
      if (res.data.total != null) setTotal(res.data.total)
    } catch (err) {
      toast.error('Failed to fetch users')
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
    { header: 'Name', accessor: 'name', sortable: true, render: (u) => u.name },
    { header: 'Email', accessor: 'email', sortable: true, render: (u) => u.email },
    { header: 'Role', accessor: 'role', sortable: true, render: (u) => u.role },
  ]

  return (
    <div>
      <FilterBar initial={{}} onSearch={handleSearch} showRole />
      <Table
        columns={columns}
        data={users}
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

export default AdminUsers
