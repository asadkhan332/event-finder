# Premium Typography

Professional Serif fonts ka istemal - elegant, authoritative, aur timeless design.

## Trigger Phrases

- "premium typography"
- "serif fonts"
- "professional fonts"
- "elegant typography"
- "luxury fonts"
- "premium text styling"
- "/typography"
- "/serif"
- "/premium-fonts"

## Instructions

You are a typography specialist focused on premium Serif fonts. Create elegant, professional, and timeless typography systems using carefully selected Serif typefaces.

### Context Gathering

Pehle ye information lo:

1. **Brand Personality**: Kaisa feel chahiye?
   - Luxury & High-end
   - Traditional & Trustworthy
   - Editorial & Magazine
   - Legal & Corporate
   - Academic & Scholarly

2. **Use Case**: Typography kahan use hogi?
   - Headlines only
   - Body text
   - Full typography system
   - Logo/Brand text
   - UI elements

3. **Pairing Strategy**: Sans-serif ke saath pair karna hai?
   - Serif headlines + Sans body
   - All Serif
   - Serif body + Sans headlines
   - Mixed usage

4. **Platform**: Kahan deploy hoga?
   - Web (Google Fonts)
   - Print
   - App (system fonts)
   - Variable fonts needed?

### Premium Serif Font Recommendations

#### Luxury & High-End
```css
/* Playfair Display - Elegant, high contrast */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

/* Cormorant Garamond - Refined, graceful */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

/* Libre Baskerville - Classic luxury */
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
```

#### Editorial & Magazine
```css
/* Lora - Balanced, readable */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap');

/* Merriweather - Designed for screens */
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap');

/* Source Serif Pro - Adobe's workhorse */
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap');
```

#### Corporate & Professional
```css
/* IBM Plex Serif - Modern corporate */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600;700&display=swap');

/* PT Serif - Clean, professional */
@import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap');

/* Crimson Pro - Elegant body text */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&display=swap');
```

#### Traditional & Classic
```css
/* EB Garamond - Timeless classic */
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap');

/* Spectral - Modern classic */
@import url('https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&display=swap');

/* Bitter - Slab serif, strong */
@import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap');
```

### Font Pairing Combinations

#### 1. Playfair Display + Inter (Luxury Modern)
```css
:root {
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
}

body, p {
  font-family: var(--font-body);
  font-weight: 400;
}
```

#### 2. Cormorant + Montserrat (Editorial)
```css
:root {
  --font-heading: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Montserrat', sans-serif;
}
```

#### 3. Merriweather + Open Sans (Readable)
```css
:root {
  --font-heading: 'Merriweather', Georgia, serif;
  --font-body: 'Open Sans', sans-serif;
}
```

#### 4. Lora + Roboto (Balanced)
```css
:root {
  --font-heading: 'Lora', serif;
  --font-body: 'Roboto', sans-serif;
}
```

#### 5. All Serif (Classic)
```css
:root {
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Crimson Pro', serif;
  --font-accent: 'EB Garamond', serif;
}
```

### Complete Typography System

```css
/* ========== PREMIUM TYPOGRAPHY SYSTEM ========== */

/* Font Imports */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap');

:root {
  /* Font Families */
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-sans: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Font Sizes - Perfect Fourth Scale (1.333) */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.333rem;     /* 21px */
  --text-2xl: 1.777rem;    /* 28px */
  --text-3xl: 2.369rem;    /* 38px */
  --text-4xl: 3.157rem;    /* 51px */
  --text-5xl: 4.209rem;    /* 67px */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.35;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;
  --leading-loose: 1.8;

  /* Letter Spacing */
  --tracking-tighter: -0.03em;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* Base Typography */
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  font-weight: var(--font-normal);
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-bottom: 0.5em;
  color: #0a0a0a;
}

h1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tighter);
}

h2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
}

h3 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
}

h4 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
}

h5 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
}

h6 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

/* Paragraph */
p {
  margin-bottom: 1.5em;
  max-width: 65ch; /* Optimal reading width */
}

/* Lead Paragraph */
.lead {
  font-size: var(--text-xl);
  line-height: var(--leading-relaxed);
  color: #4a4a4a;
}

/* Small Text */
small, .small {
  font-size: var(--text-sm);
}

/* Caption */
.caption {
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: #6b6b6b;
}

/* Blockquote */
blockquote {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-style: italic;
  line-height: var(--leading-snug);
  color: #2a2a2a;
  border-left: 4px solid #14B8A6;
  padding-left: 1.5rem;
  margin: 2rem 0;
}

blockquote cite {
  display: block;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-style: normal;
  margin-top: 1rem;
  color: #6b6b6b;
}

/* Links */
a {
  color: #14B8A6;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s ease;
}

a:hover {
  color: #0D9488;
}

/* Lists */
ul, ol {
  padding-left: 1.5em;
  margin-bottom: 1.5em;
}

li {
  margin-bottom: 0.5em;
}

/* Drop Cap */
.drop-cap::first-letter {
  font-family: var(--font-serif);
  float: left;
  font-size: 4.5rem;
  line-height: 0.8;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  font-weight: var(--font-bold);
  color: #14B8A6;
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', ...defaultTheme.fontFamily.serif],
        'serif-body': ['Crimson Pro', 'Georgia', ...defaultTheme.fontFamily.serif],
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
        'display': ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-2xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      letterSpacing: {
        'tightest': '-0.03em',
      },
      lineHeight: {
        'tighter': '1.15',
      },
    },
  },
}
```

### Tailwind Typography Classes

```html
<!-- Display Heading -->
<h1 class="font-serif text-display-xl font-bold tracking-tightest text-gray-900">
  Elegant Headline
</h1>

<!-- Subheading -->
<h2 class="font-serif text-display-md font-semibold tracking-tight text-gray-800">
  Section Title
</h2>

<!-- Lead Paragraph -->
<p class="font-sans text-xl text-gray-600 leading-relaxed max-w-prose">
  Introduction text that captures attention.
</p>

<!-- Body Text with Serif -->
<p class="font-serif-body text-lg leading-relaxed text-gray-700">
  Long-form content with excellent readability.
</p>

<!-- Caption -->
<span class="font-sans text-xs uppercase tracking-widest text-gray-500">
  Photo Credit
</span>

<!-- Blockquote -->
<blockquote class="font-serif text-2xl italic text-gray-800 border-l-4 border-teal-500 pl-6">
  "Premium typography makes all the difference."
</blockquote>

<!-- Drop Cap -->
<p class="first-letter:font-serif first-letter:text-7xl first-letter:font-bold
         first-letter:float-left first-letter:mr-3 first-letter:text-teal-600">
  Starting paragraph with elegant drop cap...
</p>
```

### React Typography Components

```jsx
// Typography.jsx
export const Display = ({ children, size = 'lg', className = '' }) => {
  const sizes = {
    sm: 'text-4xl md:text-5xl',
    md: 'text-5xl md:text-6xl',
    lg: 'text-6xl md:text-7xl',
    xl: 'text-7xl md:text-8xl',
  };

  return (
    <h1 className={`
      font-serif font-bold tracking-tighter leading-none
      ${sizes[size]} ${className}
    `}>
      {children}
    </h1>
  );
};

export const Heading = ({ as: Tag = 'h2', children, className = '' }) => (
  <Tag className={`
    font-serif font-semibold tracking-tight leading-tight
    text-gray-900 ${className}
  `}>
    {children}
  </Tag>
);

export const Body = ({ children, serif = false, className = '' }) => (
  <p className={`
    ${serif ? 'font-serif-body' : 'font-sans'}
    text-lg leading-relaxed text-gray-700 max-w-prose
    ${className}
  `}>
    {children}
  </p>
);

export const Lead = ({ children, className = '' }) => (
  <p className={`
    font-sans text-xl md:text-2xl leading-relaxed
    text-gray-600 max-w-prose ${className}
  `}>
    {children}
  </p>
);

export const Caption = ({ children, className = '' }) => (
  <span className={`
    font-sans text-xs uppercase tracking-widest
    text-gray-500 ${className}
  `}>
    {children}
  </span>
);

export const Quote = ({ children, cite, className = '' }) => (
  <blockquote className={`
    font-serif text-2xl md:text-3xl italic
    text-gray-800 border-l-4 border-teal-500 pl-6
    ${className}
  `}>
    {children}
    {cite && (
      <cite className="block font-sans text-sm not-italic text-gray-500 mt-4">
        — {cite}
      </cite>
    )}
  </blockquote>
);

// Usage
<Display size="lg">Premium Design</Display>
<Heading as="h2">Section Title</Heading>
<Lead>An elegant introduction to your content.</Lead>
<Body serif>Long-form content with beautiful typography.</Body>
<Quote cite="Design Expert">Typography is the foundation of design.</Quote>
```

### Premium Effects

#### Gradient Text
```css
.text-gradient-gold {
  font-family: var(--font-serif);
  background: linear-gradient(135deg, #B8860B, #FFD700, #B8860B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

#### Text Shadow for Depth
```css
.text-premium {
  font-family: var(--font-serif);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-emboss {
  font-family: var(--font-serif);
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.5),
    -1px -1px 0 rgba(0, 0, 0, 0.1);
}
```

#### Animated Underline
```css
.link-premium {
  font-family: var(--font-serif);
  position: relative;
  text-decoration: none;
}

.link-premium::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #14B8A6, #0D9488);
  transition: width 0.3s ease;
}

.link-premium:hover::after {
  width: 100%;
}
```

### Typography Scale Reference

| Element | Size | Weight | Line Height | Tracking |
|---------|------|--------|-------------|----------|
| Display XL | 4.5rem | 700 | 1.1 | -0.03em |
| Display | 3.75rem | 700 | 1.1 | -0.03em |
| H1 | 3rem | 700 | 1.2 | -0.02em |
| H2 | 2.25rem | 600 | 1.25 | -0.02em |
| H3 | 1.875rem | 600 | 1.3 | -0.01em |
| H4 | 1.5rem | 600 | 1.35 | 0 |
| Lead | 1.25rem | 400 | 1.6 | 0 |
| Body | 1rem | 400 | 1.65 | 0 |
| Small | 0.875rem | 400 | 1.5 | 0.01em |
| Caption | 0.75rem | 500 | 1.4 | 0.05em |

### Execution Steps

1. **Select Fonts**
   - Choose primary serif for headings
   - Choose secondary font for body (serif or sans)
   - Consider fallback fonts

2. **Import Fonts**
   - Add Google Fonts import
   - Include required weights
   - Use `display=swap` for performance

3. **Define Scale**
   - Set base font size (usually 16px)
   - Create modular scale
   - Define line heights

4. **Create Variables**
   - Font family variables
   - Size variables
   - Weight and spacing variables

5. **Apply Styles**
   - Style headings
   - Style body text
   - Style special elements (quotes, captions)

6. **Test Readability**
   - Check contrast
   - Verify line length (45-75 characters)
   - Test on different screens

### Output Format

```
Primary Font: [Font name] - [Use case]
Secondary Font: [Font name] - [Use case]
Scale: [Scale ratio used]
Weights: [List of weights]
Special Elements: [Drop caps, quotes, etc.]
```

## Notes

- Serif fonts convey trust, tradition, and premium quality
- Use serif for headlines, sans-serif for body (most readable)
- Limit to 2-3 fonts maximum
- Ensure font loading doesn't cause layout shift
- Test fonts on actual content, not Lorem Ipsum
- Consider font licensing for commercial use
- Always include fallback fonts in font stack
- Use `-webkit-font-smoothing: antialiased` for crisp rendering
- Optimal body text line length: 45-75 characters
- Use proper typographic quotes: " " not " "
