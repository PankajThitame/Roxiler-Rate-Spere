import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/auth.context'
import { Star, Mail, Lock, Loader2 } from 'lucide-react'

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await login(data)
      toast.success('Successfully logged in!')

      const role = res.role
      if (role === 'SYSTEM_ADMIN') {
        navigate('/admin/dashboard')
      } else if (role === 'STORE_OWNER') {
        navigate('/owner/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message?.[0] || 'Invalid credentials. Please try again.'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="flex items-center justify-center space-x-2.5 mb-8">
          <div className="p-2.5 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center shadow-lg">
            <Star className="text-brand-500 fill-brand-500" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold font-sans tracking-wide bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">RateSphere</h1>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-1">Please sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail size={18} /></span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please provide a valid email address' },
                  })}
                />
              </div>
              {errors.email && (<span className="text-xs text-red-400 mt-1 block font-medium">{errors.email.message}</span>)}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={18} /></span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && (<span className="text-xs text-red-400 mt-1 block font-medium">{errors.password.message}</span>)}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all duration-200 flex justify-center items-center shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-900 pt-5 text-center">
            <p className="text-sm text-slate-400">Don't have an account? <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors duration-150">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
