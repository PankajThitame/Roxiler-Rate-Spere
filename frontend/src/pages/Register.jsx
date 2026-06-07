import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios.instance'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await api.post('/auth/register', data)
      toast.success('Registered successfully. Please login.')
      navigate('/login')
    } catch (err) {
      const serverMsg = err?.response?.data?.message
      const friendly = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg || 'Registration failed'
      toast.error(friendly)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-4">Create an account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            placeholder="Name"
            {...register('name', { required: 'Name is required', minLength: { value: 20, message: 'Name must be at least 20 characters' }, maxLength: { value: 60, message: 'Name must be at most 60 characters' } })}
            className="w-full"
          />
          {errors.name && <div className="text-xs text-red-400 mt-1">{errors.name.message}</div>}
        </div>

        <div>
          <input
            placeholder="Email"
            {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please provide a valid email address' } })}
            className="w-full"
          />
          {errors.email && <div className="text-xs text-red-400 mt-1">{errors.email.message}</div>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' }, maxLength: { value: 16, message: 'Password must be at most 16 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/, message: 'Password must include upper, lower, number, and special char' } })}
            className="w-full"
          />
          {errors.password && <div className="text-xs text-red-400 mt-1">{errors.password.message}</div>}
        </div>

        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-600 text-white rounded disabled:opacity-50">
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
