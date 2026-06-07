import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axios.instance'
import { toast } from 'react-toastify'

export const ChangePassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await api.put('/users/change-password', data)
      toast.success('Password changed successfully')
    } catch {
      toast.error('Failed to change password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm">Current Password</label>
          <input type="password" {...register('currentPassword', { required: true })} className="w-full" />
          {errors.currentPassword && <span className="text-xs text-red-400">Required</span>}
        </div>
        <div>
          <label className="block text-sm">New Password</label>
          <input type="password" {...register('newPassword', { required: true })} className="w-full" />
          {errors.newPassword && <span className="text-xs text-red-400">Required</span>}
        </div>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-600 text-white rounded">{isSubmitting ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}

export default ChangePassword
