// Authentication utility functions

/**
 * Get or create a demo JWT token
 * This ensures all components use the same user token
 */
export const getOrCreateToken = () => {
  let token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Create a consistent demo token
    const userId = 'demo-user-' + Date.now();
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const payload = btoa(JSON.stringify({
      sub: userId,
      email: 'demo@luxetime.com',
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      aud: 'authenticated',
      iat: Math.floor(Date.now() / 1000)
    }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const signature = btoa('demo-signature')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    token = `${header}.${payload}.${signature}`;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', userId);
    console.log('Created new demo token for user:', userId);
  }
  
  return token;
};

/**
 * Clear authentication token
 */
export const clearToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};
