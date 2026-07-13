import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5025/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getProfile = () => api.get('/profile')
export const upsertProfile = (data) => api.post('/profile', data)
export const getMatches = () => api.get('/matching')
export const deleteProfile = () => api.delete('/profile')
export const uploadPhoto = (formData) => api.post('/upload/photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const laisserAvis = (data) => api.post('/avis', data)
export const getAvis = (userId) => api.get(`/avis/${userId}`)
export const getMonAvis = (cibleId) => api.get(`/avis/mon-avis/${cibleId}`)
export const getMesAgriculteurs = () => api.get('/matching/mes-agriculteurs')
export const getStats = () => api.get('/stats')


export default api
