// Client-side API utility to replace localStorage calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

// Set auth token in localStorage
function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('authToken', token)
}

// Remove auth token
function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('authToken')
}

// Make authenticated API request
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      removeAuthToken()
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('currentUser')
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }

    return response
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// Helper to safely parse JSON from response
async function parseJSONResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type')
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    console.error('Non-JSON response:', text.substring(0, 200))
    throw new Error(`Expected JSON but got ${contentType}`)
  }
  
  try {
    return await response.json()
  } catch (error) {
    const text = await response.text()
    console.error('JSON parse error:', text.substring(0, 200))
    throw new Error('Failed to parse JSON response')
  }
}

// API client
export const api = {
  // Auth
  signup: async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth?: string
    gender?: string
    workplace?: string
  }) => {
    const response = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await parseJSONResponse(response).catch(() => ({ error: 'Signup failed' }))
      throw new Error(error.error || 'Signup failed')
    }
    
    const result = await parseJSONResponse(response)
    if (result.token) {
      setAuthToken(result.token)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', result.user.email)
      localStorage.setItem('currentUser', result.user.id)
      localStorage.setItem('userData', JSON.stringify(result.user))
    }
    return result
  },

  login: async (email: string) => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    
    if (!response.ok) {
      // Try to parse JSON error, fallback to localStorage mode if DB not available
      try {
        const error = await parseJSONResponse(response)
        // If database not available, use localStorage fallback
        if (error.code === 'DB_NOT_AVAILABLE' || error.fallback) {
          throw new Error('FALLBACK_TO_LOCALSTORAGE')
        }
        throw new Error(error.error || 'Login failed')
      } catch (parseError: any) {
        // If we can't parse JSON, it might be an HTML error page
        // Fallback to localStorage mode
        if (parseError.message?.includes('Expected JSON') || parseError.message?.includes('FALLBACK_TO_LOCALSTORAGE')) {
          throw new Error('FALLBACK_TO_LOCALSTORAGE')
        }
        throw new Error(parseError.message || 'Login failed')
      }
    }
    
    const result = await parseJSONResponse(response)
    if (result.token) {
      setAuthToken(result.token)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', result.user.email)
      localStorage.setItem('currentUser', result.user.id)
      localStorage.setItem('userData', JSON.stringify(result.user))
    }
    return result
  },

  logout: () => {
    removeAuthToken()
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userData')
  },

  // User
  getCurrentUser: async () => {
    const response = await fetchWithAuth('/users/me')
    if (!response.ok) return null
    return parseJSONResponse(response)
  },

  // Files
  getFiles: async () => {
    const response = await fetchWithAuth('/files')
    if (!response.ok) throw new Error('Failed to fetch files')
    const data = await parseJSONResponse(response)
    return data.files || []
  },

  getFile: async (fileId: string) => {
    const response = await fetchWithAuth(`/files/${fileId}`)
    if (!response.ok) throw new Error('Failed to fetch file')
    const data = await parseJSONResponse(response)
    return data.file
  },

  createFile: async (data: {
    name: string
    description?: string
    students?: Array<{ name: string; studentId: string }>
  }) => {
    const response = await fetchWithAuth('/files', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create file')
    const result = await parseJSONResponse(response)
    return result.file
  },

  updateFile: async (fileId: string, data: {
    name?: string
    description?: string
  }) => {
    const response = await fetchWithAuth(`/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update file')
    const result = await parseJSONResponse(response)
    return result.file
  },

  syncFile: async (fileId: string, file: any) => {
    const response = await fetchWithAuth(`/files/${fileId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ file }),
    })
    if (!response.ok) throw new Error('Failed to sync file')
    return parseJSONResponse(response)
  },

  deleteFile: async (fileId: string) => {
    const response = await fetchWithAuth(`/files/${fileId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete file')
    return parseJSONResponse(response)
  },

  // Subscription
  getSubscription: async () => {
    const response = await fetchWithAuth('/subscription')
    if (!response.ok) return null
    const data = await parseJSONResponse(response)
    return data.subscription
  },

  setSubscription: async (plan: string) => {
    const response = await fetchWithAuth('/subscription', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
    if (!response.ok) throw new Error('Failed to set subscription')
    const data = await parseJSONResponse(response)
    return data.subscription
  },

  // File exports and backups
  uploadExport: async (fileId: string, content: string, type: 'csv' | 'pdf', pageId?: string) => {
    const response = await fetchWithAuth(`/files/${fileId}/export`, {
      method: 'POST',
      body: JSON.stringify({ content, type, pageId }),
    })
    if (!response.ok) throw new Error('Failed to upload export')
    const data = await parseJSONResponse(response)
    return data.url
  },

  uploadBackup: async (fileId: string, content: any) => {
    const response = await fetchWithAuth(`/files/${fileId}/backup`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    if (!response.ok) throw new Error('Failed to create backup')
    const data = await parseJSONResponse(response)
    return data.url
  },
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!getAuthToken() && localStorage.getItem('isLoggedIn') === 'true'
}

// Helper to get current user ID
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('currentUser')
}

