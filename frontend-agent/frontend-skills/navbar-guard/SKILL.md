# Navbar Guard: Logout par Private Toggles Chhupana

Expert assistance with implementing secure navigation that hides private controls when users are logged out, ensuring proper access control and UI consistency.

## Trigger Phrases

- "navbar guard"
- "private toggle protection"
- "secure navigation"
- "logout toggle hiding"
- "navigation security"
- "private controls hiding"
- "auth-aware navbar"
- "conditional navigation"
- "/navbar-guard"
- "/secure-nav"
- "/auth-nav"
- "/private-toggle"

## Instructions

You are a navigation security expert specializing in protecting private toggles and controls in navigation bars. Provide guidance on implementing conditional rendering, authentication state management, and secure UI patterns that hide sensitive controls when users are logged out.

### Context Gathering

First, gather this information:

1. **Authentication System**: What authentication mechanism is used?
   - Session-based authentication
   - JWT tokens
   - OAuth/OIDC
   - Custom authentication
   - Third-party provider (Auth0, Firebase, etc.)
   - Cookie-based authentication

2. **Framework/Technology**: What technology stack is being used?
   - React with Context/Redux
   - Vue with Pinia/Vuex
   - Angular with Services
   - Svelte with Stores
   - Vanilla JavaScript
   - Server-side rendering (Next.js, Nuxt, etc.)

3. **Private Toggle Types**: What kinds of private controls need protection?
   - Admin panels
   - User settings/profile
   - Billing/payment controls
   - Private content toggles
   - Account management
   - Debug/development tools

4. **Security Requirements**: What level of security is needed?
   - Client-side only
   - Server-side rendering with hydration
   - Hybrid approach
   - Real-time updates
   - Session timeout handling
   - Cross-tab synchronization

### Authentication State Management

#### 1. React Context Pattern
```jsx
// AuthContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  // Check for existing session on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and set user
      validateToken(token)
        .then(user => {
          dispatch({ type: 'LOGIN', payload: { user, token } });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    const response = await authenticate(credentials);
    if (response.success) {
      localStorage.setItem('token', response.token);
      dispatch({ type: 'LOGIN', payload: { user: response.user, token: response.token } });
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### 2. Protected Navbar Component
```jsx
// Navbar.js
import React from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) {
    return (
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="animate-pulse bg-gray-600 rounded w-24 h-6"></div>
          <div className="animate-pulse bg-gray-600 rounded w-16 h-8"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-xl font-bold">
          <Link to="/">MyApp</Link>
        </div>

        {/* Public Navigation */}
        <div className="flex space-x-4">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          <Link to="/about" className="text-white hover:text-gray-300">About</Link>
          <Link to="/contact" className="text-white hover:text-gray-300">Contact</Link>
        </div>

        {/* Conditional Private Controls */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* User Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-white">
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user?.name}</span>
                </button>

                {/* Private Controls Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>

                  {/* Admin-only controls */}
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Panel
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        System Settings
                      </Link>
                    </>
                  )}

                  {/* User-specific controls */}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/billing"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Billing
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Login/Register for non-authenticated users
            <div className="flex space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-gray-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

### Secure Toggle Implementation

#### 1. Permission-Based Toggle System
```jsx
// PermissionGuard.js
import React from 'react';
import { useAuth } from './AuthContext';

const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { user, isAuthenticated } = useAuth();

  // Check if user has required permission
  const hasPermission = () => {
    if (!isAuthenticated || !user) return false;

    // For admin permissions
    if (permission === 'admin' && user.role === 'admin') return true;

    // For specific permissions
    if (user.permissions && user.permissions.includes(permission)) return true;

    // For role-based permissions
    if (user.role === permission) return true;

    return false;
  };

  if (!hasPermission()) {
    return fallback;
  }

  return <>{children}</>;
};

// Usage in Navbar
const PrivateToggle = () => {
  return (
    <PermissionGuard
      permission="admin"
      fallback={<div className="hidden"></div>}
    >
      <div className="relative group">
        <button className="text-white hover:text-gray-300">
          Admin Tools
        </button>
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <a href="/admin/debug" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Debug Tools</a>
          <a href="/admin/metrics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Metrics</a>
        </div>
      </div>
    </PermissionGuard>
  );
};
```

#### 2. Role-Based Navigation Component
```jsx
// RoleBasedNav.js
import React from 'react';
import { useAuth } from './AuthContext';

const RoleBasedNav = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // Hide private controls when not authenticated
  }

  const renderRoleSpecificLinks = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <>
            <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</Link>
            <Link to="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Manage Users</Link>
            <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">System Settings</Link>
          </>
        );
      case 'moderator':
        return (
          <>
            <Link to="/moderate" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Moderation</Link>
            <Link to="/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Reports</Link>
          </>
        );
      case 'user':
        return (
          <>
            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
            <Link to="/preferences" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Preferences</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
      {renderRoleSpecificLinks()}
      <hr className="my-1" />
      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
    </div>
  );
};
```

### Advanced Security Patterns

#### 1. Token Expiration Handling
```javascript
// TokenManager.js
class TokenManager {
  constructor() {
    this.tokenExpiryThreshold = 5 * 60 * 1000; // 5 minutes before expiry
    this.checkInterval = setInterval(() => this.checkTokenValidity(), 60000); // Every minute
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token, expiry) {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiry);
  }

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
  }

  isTokenExpired() {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;

    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();

    return currentTime > (expiryTime - this.tokenExpiryThreshold);
  }

  checkTokenValidity() {
    if (this.isTokenExpired()) {
      this.removeToken();
      // Emit logout event
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  refreshToken() {
    // Implement refresh token logic
    return fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Token refresh failed');
    }).then(data => {
      this.setToken(data.token, data.expiry);
    });
  }
}

export const tokenManager = new TokenManager();
```

#### 2. Secure Navigation Hook
```javascript
// useSecureNavigation.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { tokenManager } from './TokenManager';

export const useSecureNavigation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleAuthExpiration = () => {
      logout();
      navigate('/login');
    };

    const handleTabSync = (event) => {
      if (event.key === 'auth-token' && event.newValue === null) {
        // Token was removed in another tab
        logout();
        navigate('/login');
      }
    };

    window.addEventListener('auth:expired', handleAuthExpiration);
    window.addEventListener('storage', handleTabSync);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpiration);
      window.removeEventListener('storage', handleTabSync);
    };
  }, [navigate, logout]);

  return { isTokenValid: !tokenManager.isTokenExpired() };
};
```

### Server-Side Protection

#### 1. API Route Protection
```javascript
// middleware/auth.js
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// middleware/permissions.js
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Example protected routes
app.get('/api/admin', requireAuth, requirePermission('admin'), (req, res) => {
  res.json({ data: 'Admin data' });
});

app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

#### 2. Server-Side Navbar Rendering
```jsx
// ServerSideNavbar.jsx (for SSR frameworks)
import { getUserFromToken } from '../utils/auth';

export const ServerSideNavbar = async ({ request }) => {
  const token = request.cookies.get('token');
  const user = token ? await getUserFromToken(token) : null;

  return `
    <nav class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white text-xl font-bold">MyApp</div>

        <div class="flex space-x-4">
          <a href="/" class="text-white hover:text-gray-300">Home</a>
          <a href="/about" class="text-white hover:text-gray-300">About</a>
        </div>

        <div class="flex items-center space-x-4">
          ${
            user
              ? `
                <div class="relative">
                  <span class="text-white">${user.name}</span>
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <a href="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                    ${
                      user.role === 'admin'
                        ? '<a href="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</a>'
                        : ''
                    }
                    <a href="/logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
                  </div>
                </div>
              `
              : `
                <div class="flex space-x-2">
                  <a href="/login" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</a>
                  <a href="/register" class="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-gray-800">Register</a>
                </div>
              `
          }
        </div>
      </div>
    </nav>
  `;
};
```

### Performance Optimization

#### 1. Memoized Navigation Components
```jsx
// Optimized Navbar with React.memo
import React, { memo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PrivateControls = memo(({ user, logout }) => {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    // Handle private control click
  }, []);

  return (
    <div className="relative">
      <button className="flex items-center space-x-2 text-white">
        <img src={user?.avatar || '/default-avatar.png'} alt="Profile" className="w-8 h-8 rounded-full" />
        <span>{user?.name}</span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
        <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
        {user?.role === 'admin' && (
          <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</a>
        )}
        <button
          onClick={logout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
});

PrivateControls.displayName = 'PrivateControls';

const Navbar = memo(() => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) {
    return <LoadingNavbar />;
  }

  return (
    <nav className="bg-gray-800 p-4">
      {/* Navigation content */}
      {isAuthenticated && (
        <PrivateControls user={user} logout={logout} />
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';
```

#### 2. Lazy Loading for Heavy Components
```jsx
// Lazy load heavy admin components
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));
const DebugTools = lazy(() => import('./DebugTools'));

const LazyPrivateControl = ({ user }) => {
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="relative">
      <button className="text-white hover:text-gray-300">Admin Tools</button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
        <Suspense fallback={<div className="px-4 py-2 text-sm text-gray-700">Loading...</div>}>
          <AdminPanel />
          <DebugTools />
        </Suspense>
      </div>
    </div>
  );
};
```

### Error Handling and Edge Cases

#### 1. Session Management
```javascript
// SessionManager.js
class SessionManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Tab became visible, check if session is still valid
        this.validateSession();
      }
    });

    // Handle beforeunload to clean up
    window.addEventListener('beforeunload', () => {
      // Optionally save session state
    });
  }

  async validateSession() {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        // Session invalid, trigger logout
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      // Handle network errors gracefully
    }
  }

  // Handle concurrent logouts across tabs
  handleConcurrentLogout() {
    localStorage.setItem('logout-event', Date.now().toString());
  }

  setupLogoutListener(onLogout) {
    const handleStorageChange = (e) => {
      if (e.key === 'logout-event') {
        onLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }
}

export const sessionManager = new SessionManager();
```

#### 2. Graceful Degradation
```jsx
// Fallback components for when auth fails
const AuthFallback = ({ onRetry }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">Authentication Error! </strong>
    <span className="block sm:inline">Unable to verify your session.</span>
    <div className="mt-2">
      <button
        onClick={onRetry}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm mr-2"
      >
        Retry
      </button>
      <a
        href="/login"
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
      >
        Login Again
      </a>
    </div>
  </div>
);

// Protected route with fallback
const ProtectedRoute = ({ children, fallback = <AuthFallback /> }) => {
  const { isAuthenticated, loading, error } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return fallback;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

### Execution Steps

1. **Analyze Current State**
   - Review existing authentication implementation
   - Identify private toggles and controls
   - Map out current session management
   - Document security gaps

2. **Implement Authentication Context**
   - Set up global auth state management
   - Create login/logout functionality
   - Add token storage and validation
   - Implement loading states

3. **Secure Navigation Components**
   - Wrap private toggles in auth checks
   - Implement role-based access controls
   - Add proper fallback UI for non-auth users
   - Create loading states for auth verification

4. **Add Security Measures**
   - Implement token expiration handling
   - Add cross-tab session sync
   - Set up session validation
   - Create error handling patterns

5. **Optimize Performance**
   - Memoize navigation components
   - Lazy load heavy admin sections
   - Optimize re-renders
   - Add proper cleanup

6. **Test and Validate**
   - Test logout scenarios thoroughly
   - Verify private toggles are hidden
   - Test cross-tab behavior
   - Validate error handling

### Output Format

```
Security Level: [Current and recommended security measures]
Private Controls: [List of toggles that need protection]
Implementation Plan: [Step-by-step implementation approach]
Authentication Flow: [Login/logout flow details]
Performance Impact: [Any performance considerations]
Cross-Tab Sync: [How session state is maintained across tabs]
```

## Notes

- Always validate authentication state before showing private controls
- Implement both client-side and server-side protection
- Handle token expiration gracefully
- Use proper loading states during auth verification
- Implement cross-tab session synchronization
- Protect against XSS and CSRF attacks
- Use secure token storage (preferably httpOnly cookies)
- Implement proper error handling and fallbacks
- Regularly audit private control access
- Consider accessibility in secured navigation
- Test edge cases like network failures
- Implement proper cleanup of auth listeners
- Use memoization to prevent unnecessary re-renders
- Consider using CSP headers for additional security
- Log security events for monitoring
- Implement rate limiting for auth endpoints