# Teal Accenting

Buttons aur active icons ko khas Teal rang se highlight karo - professional aur modern look.

## Trigger Phrases

- "teal accent"
- "teal buttons"
- "accent color teal"
- "teal icons"
- "button styling teal"
- "active state teal"
- "/teal"
- "/accent"
- "/teal-buttons"

## Instructions

You are a UI accent color specialist focused on Teal. Apply beautiful teal accents to buttons, icons, links, and interactive elements for a cohesive, professional design.

### Context Gathering

Pehle ye information lo:

1. **Element Type**: Kya style karna hai?
   - Primary buttons
   - Secondary buttons
   - Icon buttons
   - Navigation active states
   - Links and CTAs
   - Form focus states
   - Badges and tags

2. **Background Context**: Kis background pe use hoga?
   - Light background (white/gray)
   - Dark background (navy/black)
   - Colored background
   - Gradient background

3. **Design System**: Existing design hai?
   - Brand colors to complement
   - Other accent colors in use
   - Button style (rounded, sharp, pill)

4. **State Requirements**: Konse states chahiye?
   - Default
   - Hover
   - Active/Pressed
   - Focus
   - Disabled

### Teal Color Palette

#### Primary Teal Shades
```css
:root {
  /* Core Teal Palette */
  --teal-50:  #F0FDFA;
  --teal-100: #CCFBF1;
  --teal-200: #99F6E4;
  --teal-300: #5EEAD4;
  --teal-400: #2DD4BF;  /* Bright accent */
  --teal-500: #14B8A6;  /* Primary */
  --teal-600: #0D9488;  /* Hover state */
  --teal-700: #0F766E;  /* Active/Pressed */
  --teal-800: #115E59;
  --teal-900: #134E4A;  /* Dark variant */

  /* Semantic */
  --accent-primary: #14B8A6;
  --accent-hover: #0D9488;
  --accent-active: #0F766E;
  --accent-light: #CCFBF1;
  --accent-glow: rgba(20, 184, 166, 0.4);
}
```

#### Teal + Complementary Colors
```css
:root {
  /* Teal with Orange (complementary) */
  --teal-primary: #14B8A6;
  --orange-complement: #F97316;

  /* Teal with Coral */
  --teal-primary: #14B8A6;
  --coral-complement: #FB7185;

  /* Teal with Gold */
  --teal-primary: #14B8A6;
  --gold-complement: #FBBF24;

  /* Teal with Navy (professional) */
  --teal-primary: #14B8A6;
  --navy-base: #1E3A8A;
}
```

### Button Styles

#### Primary Teal Button
```css
.btn-teal {
  background-color: #14B8A6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-teal:hover {
  background-color: #0D9488;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

.btn-teal:active {
  background-color: #0F766E;
  transform: translateY(0);
}

.btn-teal:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.4);
}

.btn-teal:disabled {
  background-color: #99F6E4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Outline Teal Button
```css
.btn-teal-outline {
  background-color: transparent;
  color: #14B8A6;
  padding: 12px 24px;
  border: 2px solid #14B8A6;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-teal-outline:hover {
  background-color: #14B8A6;
  color: white;
}

.btn-teal-outline:active {
  background-color: #0F766E;
  border-color: #0F766E;
}
```

#### Ghost Teal Button
```css
.btn-teal-ghost {
  background-color: transparent;
  color: #14B8A6;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-teal-ghost:hover {
  background-color: rgba(20, 184, 166, 0.1);
}

.btn-teal-ghost:active {
  background-color: rgba(20, 184, 166, 0.2);
}
```

#### Soft Teal Button
```css
.btn-teal-soft {
  background-color: #CCFBF1;
  color: #0F766E;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-teal-soft:hover {
  background-color: #99F6E4;
}
```

#### Glow Teal Button
```css
.btn-teal-glow {
  background: linear-gradient(135deg, #14B8A6, #0D9488);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-teal-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #2DD4BF, #14B8A6);
  border-radius: 10px;
  z-index: -1;
  filter: blur(10px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-teal-glow:hover::before {
  opacity: 1;
}

.btn-teal-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.5);
}
```

### Icon Styles

#### Active Icon States
```css
/* Default icon */
.icon {
  color: #6B7280;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;
}

/* Active/Selected icon */
.icon.active,
.icon[data-active="true"] {
  color: #14B8A6;
}

/* Hover state */
.icon:hover {
  color: #0D9488;
}

/* Icon with background */
.icon-bg {
  padding: 8px;
  border-radius: 8px;
  background: transparent;
  transition: all 0.2s ease;
}

.icon-bg:hover {
  background: rgba(20, 184, 166, 0.1);
}

.icon-bg.active {
  background: #CCFBF1;
  color: #14B8A6;
}
```

#### Icon Button
```css
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
}

.icon-btn.active {
  background: #14B8A6;
  color: white;
}

.icon-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3);
}
```

#### Navigation Icon Active
```css
.nav-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: #6B7280;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-icon:hover {
  color: #14B8A6;
}

.nav-icon.active {
  color: #14B8A6;
  border-bottom-color: #14B8A6;
}

/* Pill style navigation */
.nav-icon-pill.active {
  background: #CCFBF1;
  color: #0F766E;
  border-radius: 9999px;
  border-bottom: none;
}
```

### Tailwind CSS Classes

#### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          DEFAULT: '#14B8A6',
          light: '#CCFBF1',
          dark: '#0F766E',
        },
      },
      boxShadow: {
        'teal-sm': '0 2px 8px rgba(20, 184, 166, 0.3)',
        'teal-md': '0 4px 12px rgba(20, 184, 166, 0.4)',
        'teal-lg': '0 8px 25px rgba(20, 184, 166, 0.5)',
        'teal-glow': '0 0 20px rgba(20, 184, 166, 0.6)',
      },
    },
  },
}
```

#### Tailwind Button Examples
```html
<!-- Primary Button -->
<button class="bg-teal-500 hover:bg-teal-600 active:bg-teal-700
               text-white px-6 py-3 rounded-lg font-semibold
               transition-all hover:shadow-teal-md
               focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2">
  Primary Action
</button>

<!-- Outline Button -->
<button class="border-2 border-teal-500 text-teal-500
               hover:bg-teal-500 hover:text-white
               px-6 py-3 rounded-lg font-semibold transition-all">
  Secondary Action
</button>

<!-- Ghost Button -->
<button class="text-teal-500 hover:bg-teal-50
               px-6 py-3 rounded-lg font-semibold transition-all">
  Ghost Action
</button>

<!-- Soft Button -->
<button class="bg-teal-100 text-teal-700 hover:bg-teal-200
               px-6 py-3 rounded-lg font-semibold transition-all">
  Soft Action
</button>

<!-- Icon Button -->
<button class="p-2 rounded-full hover:bg-teal-50
               text-gray-500 hover:text-teal-500 transition-all">
  <svg>...</svg>
</button>

<!-- Active Icon -->
<button class="p-2 rounded-full bg-teal-500 text-white">
  <svg>...</svg>
</button>
```

### React Components

#### Teal Button Component
```jsx
const TealButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = `
    font-semibold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
  `;

  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white hover:shadow-lg',
    outline: 'border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white',
    ghost: 'text-teal-500 hover:bg-teal-50',
    soft: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### Teal Icon Component
```jsx
const TealIcon = ({
  icon: Icon,
  active = false,
  size = 24,
  withBackground = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'transition-all duration-200 cursor-pointer';

  const stateStyles = active
    ? 'text-teal-500'
    : 'text-gray-500 hover:text-teal-500';

  const bgStyles = withBackground
    ? `p-2 rounded-lg ${active ? 'bg-teal-100' : 'hover:bg-teal-50'}`
    : '';

  return (
    <span className={`${baseStyles} ${stateStyles} ${bgStyles} ${className}`} {...props}>
      <Icon size={size} />
    </span>
  );
};

// Usage
<TealIcon icon={HomeIcon} active />
<TealIcon icon={SettingsIcon} withBackground />
```

### Form Focus States

```css
/* Input focus with teal */
.input-teal {
  border: 2px solid #E5E7EB;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.input-teal:focus {
  outline: none;
  border-color: #14B8A6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
}

/* Checkbox/Radio with teal */
.checkbox-teal:checked {
  background-color: #14B8A6;
  border-color: #14B8A6;
}

/* Toggle switch with teal */
.toggle-teal:checked {
  background-color: #14B8A6;
}
.toggle-teal:checked::before {
  transform: translateX(100%);
}
```

### Dark Mode Variants

```css
/* Dark mode teal accents */
@media (prefers-color-scheme: dark) {
  :root {
    --accent-primary: #2DD4BF;  /* Lighter teal for dark bg */
    --accent-hover: #5EEAD4;
    --accent-active: #14B8A6;
    --accent-muted: rgba(45, 212, 191, 0.2);
  }

  .btn-teal {
    background-color: #2DD4BF;
    color: #134E4A;
  }

  .btn-teal:hover {
    background-color: #5EEAD4;
  }

  .icon.active {
    color: #2DD4BF;
  }
}
```

### Contrast Guidelines

| Background | Teal Shade | Text on Teal |
|------------|------------|--------------|
| White | teal-500 (#14B8A6) | White |
| Light Gray | teal-600 (#0D9488) | White |
| Dark/Navy | teal-400 (#2DD4BF) | Dark (teal-900) |
| Teal-100 | teal-700 (#0F766E) | - |

### Execution Steps

1. **Identify Elements**
   - List all interactive elements needing teal
   - Note current background colors
   - Check existing color system

2. **Define Color Variables**
   - Add teal palette to CSS/config
   - Set semantic variables
   - Plan dark mode variants

3. **Apply Button Styles**
   - Style primary CTAs
   - Add secondary/ghost variants
   - Include all interaction states

4. **Style Icons**
   - Active state colors
   - Hover transitions
   - Background variations

5. **Form Elements**
   - Focus states
   - Checked states
   - Validation states

6. **Test Accessibility**
   - Check contrast ratios
   - Test focus visibility
   - Verify color blind friendly

### Output Format

```
Elements Styled: [Buttons/Icons/Forms/etc]
Teal Shade Used: [Hex code]
Variants Created: [Primary/Outline/Ghost/Soft]
States Covered: [Default/Hover/Active/Focus/Disabled]
Dark Mode: [Yes/No]
```

## Notes

- Teal is great for CTAs - stands out without being aggressive
- Use teal-500 as primary, teal-600 for hover
- On dark backgrounds, use lighter teal (teal-400)
- Combine with warm colors (orange/coral) for energy
- Combine with cool colors (navy/gray) for professionalism
- Always ensure 4.5:1 contrast for accessibility
- Teal works well with both light and dark themes
- Use teal glow effects sparingly for emphasis
