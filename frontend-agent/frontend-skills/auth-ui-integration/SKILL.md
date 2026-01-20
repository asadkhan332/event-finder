# Auth UI Integration: Google Button ki Sahi Placement

Expert assistance with implementing secure and user-friendly authentication UIs, focusing on proper Google Sign-In button placement, styling, and integration patterns.

## Trigger Phrases

- "google sign-in integration"
- "auth ui placement"
- "google button placement"
- "authentication ui patterns"
- "oauth button placement"
- "social login ui"
- "google auth integration"
- "sign-in button placement"
- "/auth-ui"
- "/google-auth"
- "/social-login"
- "/auth-placement"

## Instructions

You are an authentication UI expert specializing in proper Google Sign-In button placement and integration. Provide guidance on UI patterns, accessibility, security considerations, and best practices for social authentication flows that enhance user experience while maintaining security standards.

### Context Gathering

First, gather this information:

1. **Application Type**: What kind of application?
   - Single-page application (SPA)
   - Multi-page application
   - Mobile application
   - Progressive web app (PWA)
   - Desktop application
   - Server-rendered application

2. **Authentication Flows**: What authentication methods are needed?
   - Google Sign-In only
   - Multiple OAuth providers
   - Combined with email/password
   - Passwordless authentication
   - Enterprise SSO
   - Guest/user switching

3. **UI Framework**: What technology stack is being used?
   - React with hooks/context
   - Vue with Composition API
   - Angular with services
   - Svelte with stores
   - Vanilla JavaScript
   - Server-side frameworks (Next.js, Remix, etc.)

4. **Design System**: What styling approach is used?
   - Tailwind CSS
   - Material Design
   - Custom design system
   - Bootstrap
   - Styled Components
   - CSS Modules

### Google Sign-In Implementation Patterns

#### 1. Standard Google Button Implementation
```jsx
// GoogleAuthButton.js
import { useState, useEffect } from 'react';

const GoogleAuthButton = ({
  onSuccess,
  onError,
  clientId,
  buttonText = 'Sign in with Google',
  variant = 'standard' // 'standard', 'icon', 'outline'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Platform Library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          logo_alignment: 'left',
          width: variant === 'icon' ? 48 : undefined,
          text: variant === 'standard' ? 'signin_with' : undefined,
        }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      // Process the credential response
      const userInfo = await processGoogleCredentials(response.credential);
      onSuccess(userInfo);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const processGoogleCredentials = async (credential) => {
    // Verify and process the JWT token
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return await response.json();
  };

  // Render appropriate button based on variant
  if (variant === 'icon') {
    return (
      <div className="relative">
        <div
          id="google-signin-button"
          className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        id="google-signin-button"
        className={`w-full ${isLoading ? 'opacity-50' : ''} transition-opacity`}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
```

#### 2. Responsive Auth UI Layout
```jsx
// ResponsiveAuthLayout.js
import GoogleAuthButton from './GoogleAuthButton';

const ResponsiveAuthLayout = ({
  isLogin = true,
  googleClientId,
  onGoogleSuccess,
  onGoogleError
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? 'Sign in to continue to your account'
                : 'Create an account to get started'}
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="space-y-4">
            <GoogleAuthButton
              clientId={googleClientId}
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              buttonText={isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Placement and Design Best Practices

#### 1. Optimal Button Placement
```jsx
// ButtonPlacementGuide.js
const ButtonPlacementGuide = () => {
  return (
    <div className="space-y-8">
      {/* Primary Placement - Above other options */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4">Recommended: Primary Placement</h3>
        <div className="bg-white p-4 rounded border">
          <div className="space-y-3">
            <button className="w-full bg-red-500 text-white py-3 px-4 rounded font-medium">
              Sign in with Google
            </button>
            <div className="text-center text-gray-500 text-sm">or</div>
            <input type="email" placeholder="Email" className="w-full border rounded p-2" />
            <input type="password" placeholder="Password" className="w-full border rounded p-2" />
          </div>
        </div>
      </div>

      {/* Secondary Placement - Below other options */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-4">Alternative: Secondary Placement</h3>
        <div className="bg-white p-4 rounded border">
          <div className="space-y-3">
            <input type="email" placeholder="Email" className="w-full border rounded p-2" />
            <input type="password" placeholder="Password" className="w-full border rounded p-2" />
            <div className="text-center text-gray-500 text-sm">or</div>
            <button className="w-full bg-red-500 text-white py-3 px-4 rounded font-medium">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>

      {/* Minimal Placement - Icon only */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-4">Minimal: Icon Only</h3>
        <div className="bg-white p-4 rounded border">
          <div className="flex justify-center space-x-4">
            <button className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">
              G
            </button>
            <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
              f
            </button>
            <button className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white">
              in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 2. Accessibility-Focused Implementation
```jsx
// AccessibleGoogleAuth.js
import { useState, useEffect, useRef } from 'react';

const AccessibleGoogleAuth = ({
  clientId,
  onSuccess,
  onError,
  buttonText = 'Sign in with Google'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Initialize Google Sign-In with accessibility features
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('accessible-google-button'),
        {
          theme: 'outline',
          size: 'large',
          logo_alignment: 'left',
        }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      const userInfo = await processGoogleCredentials(response.credential);
      onSuccess(userInfo);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const processGoogleCredentials = async (credential) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return await response.json();
  };

  return (
    <div className="space-y-4">
      <div
        id="accessible-google-button"
        className="relative"
        role="button"
        tabIndex={0}
        aria-label={buttonText}
        aria-busy={isLoading}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Screen reader announcements */}
      <div
        id="auth-status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? 'Signing in with Google...' : 'Ready for Google authentication'}
      </div>
    </div>
  );
};
```

### Security Considerations

#### 1. Secure Implementation Pattern
```jsx
// SecureGoogleAuth.js
import { useState, useEffect } from 'react';

const SecureGoogleAuth = ({
  clientId,
  onSuccess,
  onError,
  csrfToken
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoogleScript();
  }, []);

  const loadGoogleScript = () => {
    // Verify we're in a secure context (HTTPS)
    if (!window.location.protocol.startsWith('https')) {
      console.warn('Google Sign-In should be used over HTTPS');
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initializeGoogleSignIn;
    script.onerror = () => {
      setError('Failed to load Google authentication');
    };
    document.head.appendChild(script);
  };

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate JWT token
      const isValid = await validateJwtToken(response.credential);
      if (!isValid) {
        throw new Error('Invalid credential received');
      }

      // Send to backend with CSRF protection
      const backendResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          credential: response.credential,
          timestamp: Date.now(),
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const userData = await backendResponse.json();
      onSuccess(userData);
    } catch (err) {
      console.error('Google auth error:', err);
      onError(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateJwtToken = async (token) => {
    // Basic JWT validation
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      // Check expiration
      if (payload.exp && payload.exp < now) {
        return false;
      }

      // Check issuer (should be accounts.google.com)
      if (payload.iss !== 'https://accounts.google.com' &&
          payload.iss !== 'accounts.google.com') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={initializeGoogleSignIn}
        disabled={isLoading}
        className={`
          w-full py-3 px-4 rounded-md font-medium text-white
          ${isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
          transition-colors duration-200
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing in...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </div>
        )}
      </button>

      {error && (
        <div className="mt-2 text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};
```

#### 2. Multi-Provider Auth UI
```jsx
// MultiAuthProvider.js
import GoogleAuthButton from './GoogleAuthButton';
import FacebookAuthButton from './FacebookAuthButton'; // Assume this exists

const MultiAuthProvider = ({
  googleClientId,
  facebookAppId,
  onAuthSuccess,
  onAuthError
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-600 text-sm">Sign in with</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GoogleAuthButton
          clientId={googleClientId}
          onSuccess={(user) => onAuthSuccess({...user, provider: 'google'})}
          onError={(error) => onAuthError(error)}
          variant="icon"
        />

        <FacebookAuthButton
          appId={facebookAppId}
          onSuccess={(user) => onAuthSuccess({...user, provider: 'facebook'})}
          onError={(error) => onAuthError(error)}
          variant="icon"
        />
      </div>

      {/* Or separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Continue with email */}
      <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        Continue with email
      </button>
    </div>
  );
};
```

### Responsive Design Patterns

#### 1. Mobile-First Approach
```jsx
// MobileAuthLayout.js
const MobileAuthLayout = ({
  isLogin = true,
  googleClientId,
  onGoogleSuccess,
  onGoogleError
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? 'Continue with your favorite provider'
                : 'Get started with your favorite provider'}
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="space-y-4 mb-6">
            <GoogleAuthButton
              clientId={googleClientId}
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              buttonText="Continue with Google"
            />

            {/* Horizontal divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Email form */}
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 2. Desktop-Optimized Layout
```jsx
// DesktopAuthLayout.js
const DesktopAuthLayout = ({
  isLogin = true,
  googleClientId,
  onGoogleSuccess,
  onGoogleError
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            {isLogin ? 'Welcome Back' : 'Join Our Community'}
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Experience the best of our platform with seamless authentication
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span>Secure authentication</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span>Quick sign-in process</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span>Trusted by millions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to continue' : 'Get started today'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Sign-In */}
            <div className="space-y-4">
              <GoogleAuthButton
                clientId={googleClientId}
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                buttonText={isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Email form */}
              <form className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLogin ? 'Sign in' : 'Create account'}
                </button>
              </form>
            </div>

            <div className="text-center text-sm text-gray-600">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                  </a>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Error Handling and Loading States

#### 1. Robust Error Handling
```jsx
// ErrorHandlingAuth.js
import { useState, useEffect } from 'react';

const ErrorHandlingAuth = ({
  googleClientId,
  onGoogleSuccess,
  onGoogleError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const initializeGoogleAuth = () => {
    setError(null);

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          renderGoogleButton();
        } catch (initError) {
          handleError(initError, 'initialization');
        }
      };
      script.onerror = () => {
        handleError(new Error('Failed to load Google authentication script'), 'script_load');
      };
      document.head.appendChild(script);
    };

    if (window.google?.accounts?.id) {
      // Google SDK already loaded
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });
        renderGoogleButton();
      } catch (initError) {
        handleError(initError, 'already_loaded');
      }
    } else {
      loadScript();
    }
  };

  const renderGoogleButton = () => {
    try {
      window.google.accounts.id.renderButton(
        document.getElementById('google-auth-button'),
        {
          theme: 'outline',
          size: 'large',
          logo_alignment: 'left',
        }
      );
    } catch (renderError) {
      handleError(renderError, 'render');
    }
  };

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await processGoogleCredentials(response.credential);
      onGoogleSuccess(userData);
    } catch (authError) {
      handleError(authError, 'authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const processGoogleCredentials = async (credential) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Authentication failed');
    }

    return await response.json();
  };

  const handleError = (error, context) => {
    const errorMessage = getErrorMessage(error, context);
    setError(errorMessage);
    console.error(`Google Auth Error (${context}):`, error);

    // Retry logic for certain errors
    if (shouldRetry(context, retryCount)) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        initializeGoogleAuth();
      }, 2000);
    } else {
      onGoogleError(error);
    }
  };

  const getErrorMessage = (error, context) => {
    const errorMessages = {
      initialization: 'Failed to initialize Google authentication',
      script_load: 'Failed to load authentication library',
      render: 'Failed to render Google button',
      authentication: 'Authentication failed',
    };

    return error.message || errorMessages[context] || 'An error occurred';
  };

  const shouldRetry = (context, count) => {
    // Only retry for network-related errors
    return count < 3 && context !== 'authentication';
  };

  return (
    <div className="space-y-4">
      <div
        id="google-auth-button"
        className={`relative ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={initializeGoogleAuth}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Execution Steps

1. **Analyze Requirements**
   - Determine application type and authentication needs
   - Assess design system and UI framework
   - Identify accessibility requirements
   - Review security constraints

2. **Implement Core Integration**
   - Set up Google Sign-In SDK
   - Create secure authentication flow
   - Implement proper error handling
   - Add loading states and accessibility

3. **Design Optimal Placement**
   - Position button for maximum visibility
   - Ensure proper spacing and hierarchy
   - Implement responsive design patterns
   - Consider user flow and conversion

4. **Enhance Security**
   - Implement JWT token validation
   - Add CSRF protection
   - Secure credential transmission
   - Implement proper session management

5. **Optimize Performance**
   - Lazy load authentication scripts
   - Implement proper cleanup
   - Optimize bundle size
   - Add performance monitoring

6. **Test and Validate**
   - Test across different devices and browsers
   - Verify accessibility compliance
   - Test security measures
   - Validate user experience

### Output Format

```
Implementation: [Recommended approach based on requirements]
Placement: [Optimal button positioning strategy]
Security: [Security measures implemented]
Accessibility: [Accessibility features included]
Performance: [Performance optimizations applied]
Error Handling: [Error handling strategy]
```

## Notes

- Always load Google Sign-In SDK securely over HTTPS
- Position Google button prominently in auth flows
- Use official Google brand guidelines for styling
- Implement proper error handling and user feedback
- Ensure accessibility compliance with screen readers
- Test thoroughly across different browsers and devices
- Consider mobile-first responsive design
- Implement proper JWT token validation
- Add CSRF protection for security
- Use loading states to improve UX
- Implement proper session management
- Follow OAuth 2.0 security best practices
- Test with various Google account types
- Consider privacy implications of social login
- Implement proper user data handling
- Document authentication flow for team members
- Plan for Google API changes and updates
- Consider backup authentication methods