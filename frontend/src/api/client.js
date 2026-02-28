import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('mm_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// On 401, clear token and redirect to login
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
