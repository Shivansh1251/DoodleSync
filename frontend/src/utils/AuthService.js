const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class AuthService {
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Set user
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Check if user is guest
  isGuest() {
    const user = this.getUser();
    return user?.isGuest || false;
  }

  // Sign up
  async signup(name, email, password) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  // Request Login OTP
  async requestLoginOTP(email, password) {
    const response = await fetch(`${API_URL}/auth/login/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  }

  // Verify Login OTP
  async verifyLoginOTP(email, otp) {
    const response = await fetch(`${API_URL}/auth/login/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Invalid OTP');
    }

    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  // Login (traditional without OTP)
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  // Guest login
  async guestLogin(name) {
    const response = await fetch(`${API_URL}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Guest login failed');
    }

    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  // Logout
  async logout() {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.removeToken();
  }

  // Get current user from server
  async getCurrentUser() {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.removeToken();
      }
      throw new Error(data.error || 'Failed to fetch user');
    }

    this.setUser(data.user);
    return data.user;
  }

  // Update profile
  async updateProfile(updates) {
    const token = this.getToken();
    
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    this.setUser(data.user);
    return data;
  }

  // Upload avatar
  async uploadAvatar(file) {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/auth/avatar`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload avatar');
    }

    const user = this.getUser();
    user.avatar = data.avatar;
    this.setUser(user);
    return data;
  }

  // Set preset avatar
  async setPresetAvatar(avatarUrl) {
    const token = this.getToken();

    const response = await fetch(`${API_URL}/auth/avatar/preset`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ avatarUrl })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to set avatar');
    }

    const user = this.getUser();
    user.avatar = data.avatar;
    this.setUser(user);
    return data;
  }

  // Forgot password - request OTP
  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  }

  // Verify reset password OTP
  async verifyResetOTP(email, otp) {
    const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Invalid OTP');
    }

    return data;
  }

  // Reset password with OTP
  async resetPassword(email, otp, password) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  }

  // Reset password with token (backward compatibility)
  async resetPasswordWithToken(token, password) {
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  }

  // Get activity history
  async getActivity() {
    const token = this.getToken();
    
    const response = await fetch(`${API_URL}/auth/activity`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch activity');
    }

    return data.activity;
  }

  // Google OAuth
  initiateGoogleLogin() {
    window.location.href = `${API_URL}/oauth/google`;
  }
}

export default new AuthService();
