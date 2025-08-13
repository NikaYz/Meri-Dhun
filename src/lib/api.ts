const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'

export class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
   const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof options.headers === 'object' && !Array.isArray(options.headers)
        ? options.headers as Record<string, string>
        : {}),
    };

    if (this.token) {
      finalHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || 'Request failed')
    }

    return response.json()
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async qrLogin(data: { organizationId: string; qrToken: string }) {
    return this.request('/auth/qr-login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Organization endpoints
  async generateQR(organizationId: string) {
    return this.request(`/organizations/${organizationId}/qr`)
  }

  async getLeaderboard(organizationId: string) {
    return this.request(`/organizations/${organizationId}/songs`)
  }

  async addSong(organizationId: string, songData: unknown) {
    return this.request(`/organizations/${organizationId}/songs`, {
      method: 'POST',
      body: JSON.stringify(songData),
    })
  }

  async voteSong(organizationId: string, songId: string, voteType: 'UP' | 'DOWN') {
    return this.request(`/organizations/${organizationId}/songs/${songId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    })
  }

  async boostSong(organizationId: string, songId: string, amount: number) {
    return this.request(`/organizations/${organizationId}/songs/${songId}/boost`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async getSpecialRequests(organizationId: string) {
    return this.request(`/organizations/${organizationId}/special-requests`)
  }

  async createSpecialRequest(organizationId: string, requestData: unknown) {
    return this.request(`/organizations/${organizationId}/special-requests`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async updateSpecialRequestStatus(organizationId: string, requestId: string, status: string) {
    return this.request(`/organizations/${organizationId}/special-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async getSettings(organizationId: string) {
    return this.request(`/organizations/${organizationId}/settings`)
  }

  async updateSettings(organizationId: string, settings: unknown) {
    return this.request(`/organizations/${organizationId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  }
}

export const apiClient = new ApiClient()