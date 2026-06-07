import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.instance'
import { toast } from 'react-toastify'
import { Users, Store, Star, ArrowRight, ShieldAlert } from 'lucide-react'

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard')
        setStats(response.data)
      } catch {
        toast.error('Failed to load dashboard statistics.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cardData = [
    {
      title: 'Total Users Registered',
      value: stats?.totalUsers ?? 0,
      icon: <Users size={24} className="text-blue-400" />,
      colorClass: 'border-blue-500/10 hover:border-blue-500/30',
      bgIcon: 'bg-blue-500/10 text-blue-400',
      path: '/admin/users',
      actionText: 'Manage Users',
    },
    {
      title: 'Active Stores Directory',
      value: stats?.totalStores ?? 0,
      icon: <Store size={24} className="text-emerald-400" />,
      colorClass: 'border-emerald-500/10 hover:border-emerald-500/30',
      bgIcon: 'bg-emerald-500/10 text-emerald-400',
      path: '/admin/stores',
      actionText: 'Manage Stores',
    },
    {
      title: 'Total User Ratings',
      value: stats?.totalRatings ?? 0,
      icon: <Star size={24} className="text-amber-400 fill-amber-400/10" />,
      colorClass: 'border-amber-500/10 hover:border-amber-500/30',
      bgIcon: 'bg-amber-500/10 text-amber-400',
      path: '/admin/stores',
      actionText: 'View Store Metrics',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-sans text-slate-100 tracking-wide">System Overview</h1>
        <p className="text-slate-400 mt-1.5 font-medium">Monitor active platform registries, register verified store owners, and create new business hubs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map((card, index) => (
          <div key={index} className={`glass-panel rounded-3xl p-6 border ${card.colorClass} flex flex-col justify-between h-48 transition-all duration-300 hover:translate-y-[-4px] shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-4xl font-extrabold text-slate-100 mt-2 font-sans">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${card.bgIcon} flex items-center justify-center`}>{card.icon}</div>
            </div>

            <button onClick={() => navigate(card.path)} className="flex items-center space-x-1.5 text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors mt-4 self-start group cursor-pointer">
              <span>{card.actionText}</span>
              <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-brand-500/10 flex items-start space-x-4">
        <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-200">Administrative Notice</h4>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-3xl">As a System Administrator, you have full write privileges to register user profiles of all roles (Admin, Normal User, Store Owner) and seed business stores. Normal users are allowed to self-register via the portal. Store Owner profiles must be created by administrators to prevent fake registries.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
