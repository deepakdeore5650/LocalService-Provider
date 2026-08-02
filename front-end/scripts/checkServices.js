import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089'

axios.get(`${baseUrl}/api/services`)
  .catch(() => {})
