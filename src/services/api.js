import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5025/api',
})

// Intercepteur : ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

// Profile
export const getProfile = () => api.get('/profile')
export const upsertProfile = (data) => api.post('/profile', data)

// Matching
export const getMatches = () => api.get('/matching')

export default api