# Password Visibility: Eye Icon ki Toggle Logic

Expert assistance with implementing password visibility toggles using eye icons, ensuring proper UX, accessibility, and security practices.

## Trigger Phrases

- "password visibility toggle"
- "eye icon password"
- "show/hide password"
- "password toggle logic"
- "eye icon implementation"
- "password reveal"
- "password masking"
- "secure password toggle"
- "/password-toggle"
- "/eye-icon"
- "/password-visibility"
- "/reveal-password"

## Instructions

You are a password visibility expert specializing in implementing eye icon toggles for password fields. Provide guidance on proper UX patterns, accessibility considerations, security implications, and cross-browser compatibility for password visibility controls.

### Context Gathering

First, gather this information:

1. **Framework/Technology**: What technology stack is being used?
   - React with hooks/state management
   - Vue with Composition API
   - Angular with reactive forms
   - Svelte with stores
   - Vanilla JavaScript
   - Web Components

2. **Form Requirements**: What type of form is this?
   - Login form
   - Registration form
   - Password change form
   - Multi-step form
   - Wizard form
   - Progressive disclosure

3. **Accessibility Needs**: What accessibility requirements apply?
   - Screen reader compatibility
   - Keyboard navigation
   - High contrast mode
   - Reduced motion preferences
   - WCAG compliance
   - ARIA attributes

4. **Security Considerations**: What security requirements apply?
   - No password logging
   - Screen recording prevention
   - Clipboard protection
   - Session timeout handling
   - Audit trail requirements
   - Compliance regulations

### Basic Implementation Patterns

#### 1. React Hook Pattern
```jsx
// PasswordVisibilityHook.js
import { useState, useCallback } from 'react';

export const usePasswordVisibility = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const showPassword = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hidePassword = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    toggleVisibility,
    showPassword,
    hidePassword,
    inputType: isVisible ? 'text' : 'password'
  };
};

// PasswordField.js
import React from 'react';
import { usePasswordVisibility } from './PasswordVisibilityHook';

const PasswordField = ({
  id = 'password',
  label = 'Password',
  placeholder = 'Enter your password',
  onChange,
  value,
  error,
  ...props
}) => {
  const { isVisible, toggleVisibility, inputType } = usePasswordVisibility();

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 pr-10 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          aria-describedby={`${id}-toggle ${error ? id + '-error' : ''}`}
          {...props}
        />

        <button
          type="button"
          id={`${id}-toggle`}
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-md"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
```

#### 2. Vanilla JavaScript Implementation
```javascript
// PasswordVisibility.js
class PasswordVisibility {
  constructor(inputSelector, toggleSelector) {
    this.input = document.querySelector(inputSelector);
    this.toggle = document.querySelector(toggleSelector);

    if (!this.input || !this.toggle) {
      throw new Error('Required elements not found');
    }

    this.isVisible = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateToggleIcon();
  }

  setupEventListeners() {
    this.toggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleVisibility();
    });

    // Optional: Hide password after timeout
    this.input.addEventListener('focusout', () => {
      if (this.autoHideTimeout) {
        clearTimeout(this.autoHideTimeout);
      }
    });
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.input.type = this.isVisible ? 'text' : 'password';
    this.updateToggleIcon();
    this.updateAriaAttributes();

    // Auto-hide after delay if configured
    if (this.isVisible && this.autoHideDelay > 0) {
      this.autoHideTimeout = setTimeout(() => {
        this.hidePassword();
      }, this.autoHideDelay);
    }
  }

  showPassword() {
    this.isVisible = true;
    this.input.type = 'text';
    this.updateToggleIcon();
    this.updateAriaAttributes();
  }

  hidePassword() {
    this.isVisible = false;
    this.input.type = 'password';
    this.updateToggleIcon();
    this.updateAriaAttributes();
  }

  updateToggleIcon() {
    const svg = this.toggle.querySelector('svg');
    if (!svg) return;

    if (this.isVisible) {
      // Show "hide" icon (crossed eye)
      svg.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      `;
    } else {
      // Show "show" icon (open eye)
      svg.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      `;
    }
  }

  updateAriaAttributes() {
    this.toggle.setAttribute('aria-label', this.isVisible ? 'Hide password' : 'Show password');
    this.toggle.setAttribute('aria-pressed', this.isVisible.toString());
  }

  setAutoHide(delayMs) {
    this.autoHideDelay = delayMs;
  }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
  const passwordToggle = new PasswordVisibility('#password', '#password-toggle');
  passwordToggle.setAutoHide(10000); // Auto-hide after 10 seconds
});
```

### Advanced Toggle Patterns

#### 1. Multi-Password Form Pattern
```jsx
// MultiPasswordField.js
import React, { useState } from 'react';
import PasswordField from './PasswordField';

const MultiPasswordField = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setPasswords(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswords = () => {
    const newErrors = {};

    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    if (passwords.new.length < 8) {
      newErrors.new = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatePasswords()) {
      // Process form submission
      console.log('Form submitted successfully');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PasswordField
        id="current-password"
        label="Current Password"
        value={passwords.current}
        onChange={handleChange('current')}
        error={errors.current}
      />

      <PasswordField
        id="new-password"
        label="New Password"
        value={passwords.new}
        onChange={handleChange('new')}
        error={errors.new}
      />

      <PasswordField
        id="confirm-password"
        label="Confirm New Password"
        value={passwords.confirm}
        onChange={handleChange('confirm')}
        error={errors.confirm}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Change Password
      </button>
    </form>
  );
};
```

#### 2. Accessibility-Focused Implementation
```jsx
// AccessiblePasswordField.js
import React, { useState, useRef, useEffect } from 'react';

const AccessiblePasswordField = ({
  id = 'password',
  label = 'Password',
  placeholder = 'Enter your password',
  onChange,
  value,
  error,
  autoHideDelay = 0,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState(null);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);

    // Auto-hide if configured
    if (newState && autoHideDelay > 0) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      setShowTimeout(timeout);
    }

    // Return focus to input after toggle
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Generate unique IDs for accessibility
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = `${id}-description`;

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 pr-10 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          aria-describedby={`${descriptionId} ${errorId || ''}`}
          aria-invalid={!!error}
          {...props}
        />

        <div
          id={descriptionId}
          className="sr-only"
          aria-live="polite"
        >
          {isVisible ? 'Password is visible' : 'Password is masked'}
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-md"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          aria-controls={id}
        >
          {isVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
```

### Security Considerations

#### 1. Secure Implementation Patterns
```javascript
// SecurePasswordToggle.js
class SecurePasswordToggle {
  constructor(inputElement, toggleElement) {
    this.input = inputElement;
    this.toggle = toggleElement;
    this.isVisible = false;
    this.lastFocusedElement = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.preventUnnecessaryLogging();
  }

  setupEventListeners() {
    // Click toggle
    this.toggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleToggle();
    });

    // Keyboard navigation
    this.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleToggle();
      }
    });

    // Prevent form submission when clicking toggle
    this.toggle.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    // Track focus changes
    this.input.addEventListener('focus', () => {
      this.lastFocusedElement = document.activeElement;
    });
  }

  handleToggle() {
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.showPassword();
      this.setupSecurityMeasures();
    } else {
      this.hidePassword();
      this.cleanupSecurityMeasures();
    }

    this.updateAriaAttributes();
    this.notifyScreenReader();
  }

  showPassword() {
    this.input.type = 'text';
    this.input.setAttribute('autocomplete', 'off');
  }

  hidePassword() {
    this.input.type = 'password';
    this.input.setAttribute('autocomplete', 'current-password');
  }

  setupSecurityMeasures() {
    // Monitor for sensitive actions
    this.blurHandler = () => {
      if (this.isVisible) {
        this.hidePassword();
      }
    };

    this.visibilityChangeHandler = () => {
      if (document.hidden && this.isVisible) {
        this.hidePassword();
      }
    };

    this.input.addEventListener('blur', this.blurHandler);
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  cleanupSecurityMeasures() {
    if (this.blurHandler) {
      this.input.removeEventListener('blur', this.blurHandler);
      this.blurHandler = null;
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  preventUnnecessaryLogging() {
    // Prevent password from being logged in error messages
    this.input.addEventListener('error', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  updateAriaAttributes() {
    this.toggle.setAttribute('aria-label', this.isVisible ? 'Hide password' : 'Show password');
    this.toggle.setAttribute('aria-pressed', this.isVisible.toString());
  }

  notifyScreenReader() {
    // Create live region for screen readers
    let liveRegion = document.getElementById('password-visibility-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'password-visibility-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = this.isVisible ? 'Password is now visible' : 'Password is now hidden';
  }

  destroy() {
    this.cleanupSecurityMeasures();
    this.input.type = 'password';
  }
}
```

#### 2. Auto-Hide with Timeout
```jsx
// AutoHidePasswordField.js
import React, { useState, useEffect, useRef } from 'react';

const AutoHidePasswordField = ({
  id = 'password',
  label = 'Password',
  placeholder = 'Enter your password',
  onChange,
  value,
  autoHideDelay = 10000, // 10 seconds default
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(autoHideDelay);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isVisible && autoHideDelay > 0) {
      // Start countdown timer
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1000) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      // Set auto-hide timeout
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setRemainingTime(autoHideDelay);
      }, autoHideDelay);
    } else {
      // Cleanup when hidden
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setRemainingTime(autoHideDelay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, autoHideDelay]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    setRemainingTime(autoHideDelay);
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.ceil(milliseconds / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 pr-16 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          {...props}
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            type="button"
            onClick={toggleVisibility}
            className="px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-md"
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isVisible}
          >
            {isVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>

          {isVisible && remainingTime > 0 && (
            <div className="px-2 text-xs text-gray-500">
              {formatTime(remainingTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Cross-Browser Compatibility

#### 1. Browser Support Detection
```javascript
// BrowserSupport.js
const PasswordVisibilitySupport = {
  // Check if password field supports type switching
  supportsPasswordToggle: () => {
    const input = document.createElement('input');
    input.type = 'password';
    input.type = 'text';
    return input.type === 'text';
  },

  // Check for modern event support
  supportsModernEvents: () => {
    return 'addEventListener' in window && 'classList' in document.createElement('div');
  },

  // Check for SVG support
  supportsSVG: () => {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
  },

  // Get browser-specific quirks
  getBrowserQuirks: () => {
    const ua = navigator.userAgent.toLowerCase();
    return {
      isIE: /trident/.test(ua),
      isEdge: /edge/.test(ua),
      isFirefox: /firefox/.test(ua),
      isSafari: /safari/.test(ua) && !/chrome/.test(ua),
      isChrome: /chrome/.test(ua),
      isMobile: /mobile|tablet|android|iphone|ipad/.test(ua)
    };
  }
};

// Enhanced Password Toggle with Fallbacks
class CompatiblePasswordToggle {
  constructor(inputSelector, toggleSelector) {
    this.input = document.querySelector(inputSelector);
    this.toggle = document.querySelector(toggleSelector);

    if (!this.input || !this.toggle) {
      throw new Error('Required elements not found');
    }

    // Check browser support and initialize accordingly
    if (!PasswordVisibilitySupport.supportsPasswordToggle()) {
      this.fallbackInit();
    } else {
      this.standardInit();
    }
  }

  standardInit() {
    this.isVisible = false;
    this.browserQuirks = PasswordVisibilitySupport.getBrowserQuirks();
    this.init();
  }

  fallbackInit() {
    // Create a more robust fallback for older browsers
    this.isVisible = false;
    this.createVisualIndicator();
    this.setupFallbackToggle();
  }

  createVisualIndicator() {
    // Create a text-based indicator for browsers without SVG support
    if (!PasswordVisibilitySupport.supportsSVG()) {
      const indicator = document.createElement('span');
      indicator.textContent = '👁️';
      indicator.style.position = 'absolute';
      indicator.style.right = '10px';
      indicator.style.top = '50%';
      indicator.style.transform = 'translateY(-50%)';
      indicator.style.cursor = 'pointer';
      indicator.style.fontSize = '16px';

      this.toggle.parentNode.insertBefore(indicator, this.toggle.nextSibling);
      this.visualIndicator = indicator;
    }
  }

  setupFallbackToggle() {
    this.toggle.addEventListener('click', (e) => {
      e.preventDefault();

      if (this.isVisible) {
        this.hidePassword();
      } else {
        this.showPassword();
      }

      this.isVisible = !this.isVisible;

      // Update visual indicator for text-based fallback
      if (this.visualIndicator) {
        this.visualIndicator.textContent = this.isVisible ? '👁️' : '🙈';
      }
    });
  }

  showPassword() {
    // For maximum compatibility
    try {
      this.input.type = 'text';
    } catch (e) {
      // Fallback for IE8 and below
      const newInput = this.input.cloneNode(true);
      newInput.type = 'text';
      this.input.parentNode.replaceChild(newInput, this.input);
      this.input = newInput;
    }
  }

  hidePassword() {
    try {
      this.input.type = 'password';
    } catch (e) {
      // Fallback for IE8 and below
      const newInput = this.input.cloneNode(true);
      newInput.type = 'password';
      this.input.parentNode.replaceChild(newInput, this.input);
      this.input = newInput;
    }
  }
}
```

### Animation and Visual Feedback

#### 1. Smooth Transitions
```css
/* PasswordToggle.css */
.password-input-container {
  position: relative;
  transition: all 0.2s ease-in-out;
}

.password-toggle-button {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}

.password-toggle-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.password-toggle-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.eye-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease-in-out;
}

.eye-icon.visible {
  transform: scale(1.1);
}

.eye-icon.hidden {
  transform: scale(1);
}

/* Pulse animation when password is revealed */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.password-input-visible {
  animation: pulse 2s infinite;
}
```

#### 2. Animated Password Field
```jsx
// AnimatedPasswordField.js
import React, { useState } from 'react';

const AnimatedPasswordField = ({
  id = 'password',
  label = 'Password',
  placeholder = 'Enter your password',
  onChange,
  value,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleVisibility = () => {
    setIsAnimating(true);

    setTimeout(() => {
      setIsVisible(!isVisible);
      setIsAnimating(false);
    }, 150); // Match CSS transition time
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            isVisible ? 'password-input-visible' : ''
          } ${isAnimating ? 'transition-pulse' : ''}`}
          {...props}
        />

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-md transition-all duration-200"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          <span className={`eye-icon ${isVisible ? 'visible' : 'hidden'}`}>
            {isVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
```

### Execution Steps

1. **Analyze Requirements**
   - Determine framework and technology stack
   - Identify accessibility requirements
   - Assess security constraints
   - Review design system guidelines

2. **Implement Core Toggle**
   - Create state management for visibility
   - Implement eye icon toggle button
   - Add proper ARIA attributes
   - Ensure keyboard navigation support

3. **Add Accessibility Features**
   - Implement screen reader support
   - Add focus management
   - Include proper labeling
   - Support reduced motion preferences

4. **Enhance Security**
   - Add auto-hide functionality
   - Implement tab-out protection
   - Add visibility change notifications
   - Prevent password logging

5. **Optimize Performance**
   - Implement memoization for React components
   - Add proper cleanup of event listeners
   - Optimize DOM operations
   - Consider lazy loading for complex forms

6. **Test Across Environments**
   - Test cross-browser compatibility
   - Verify mobile responsiveness
   - Test with screen readers
   - Validate security measures

### Output Format

```
Implementation: [Recommended approach based on framework]
Accessibility: [ARIA attributes and screen reader considerations]
Security: [Security measures implemented]
Animation: [Visual feedback and transition effects]
Browser Support: [Compatibility and fallback strategies]
Performance: [Optimization considerations]
```

## Notes

- Always use proper ARIA attributes for accessibility
- Consider auto-hiding passwords after a timeout period
- Ensure keyboard navigability for all users
- Test thoroughly across different browsers and devices
- Implement proper cleanup of event listeners
- Consider security implications of revealing passwords
- Use SVG icons for better scalability and accessibility
- Follow WCAG guidelines for form accessibility
- Consider user privacy when implementing visibility features
- Add proper focus management for keyboard users
- Implement reduced motion support for animation-sensitive users
- Test with various screen readers and assistive technologies
- Consider password managers and their interactions with toggles
- Ensure consistent styling across different form states
- Document the toggle behavior for other developers
- Consider adding visual indicators for password strength
- Implement proper error handling and user feedback