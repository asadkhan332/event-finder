# Zero-Margin Design

Sides se white patches ka complete khatma - Full-width, edge-to-edge layouts banao.

## Trigger Phrases

- "zero margin"
- "remove white space"
- "full width layout"
- "edge to edge"
- "no side gaps"
- "white patches hatao"
- "full bleed design"
- "/zero-margin"
- "/full-width"
- "/no-gaps"

## Instructions

You are a layout specialist focused on eliminating unwanted white space and creating seamless edge-to-edge designs. Fix common spacing issues that cause ugly white patches on sides.

### Context Gathering

Pehle identify karo:

1. **Problem Source**: White space kahan se aa raha hai?
   - Container max-width
   - Default body/html margins
   - Parent padding
   - Nested container constraints
   - Framework default styles

2. **Framework**: Kaunsa framework use ho raha hai?
   - Plain HTML/CSS
   - Tailwind CSS
   - Bootstrap
   - React/Next.js
   - Material UI

3. **Layout Type**: Kya full-width chahiye?
   - Entire page
   - Specific sections (hero, footer)
   - Images/backgrounds only
   - Breakout from container

4. **Content Strategy**: Content kaise handle karna hai?
   - Full-width background, contained content
   - Everything edge-to-edge
   - Selective breakouts

### Common Culprits & Fixes

#### 1. Default Browser Margins
```css
/* Problem: Browser adds default margins */
/* Solution: CSS Reset */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}
```

#### 2. Container Max-Width Issues
```css
/* Problem */
.container {
  max-width: 1200px;
  margin: 0 auto; /* Creates side gaps on large screens */
}

/* Solution 1: Remove max-width for full sections */
.full-width-section {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

/* Solution 2: Breakout from container */
.breakout {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
```

#### 3. Parent Padding Inheritance
```css
/* Problem: Parent has padding */
.parent {
  padding: 0 20px; /* Causes child gaps */
}

/* Solution: Negative margins on child */
.full-width-child {
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
}

/* Better Solution: Use calc() */
.full-width-child {
  width: calc(100% + 40px);
  margin-left: -20px;
}
```

#### 4. Viewport Width Issues
```css
/* Problem: 100vw includes scrollbar */
/* Solution: Use 100% or custom property */

:root {
  --full-width: calc(100vw - var(--scrollbar-width, 0px));
}

/* Or use 100% of parent */
.full-width {
  width: 100%;
}

/* JavaScript scrollbar detection */
```
```javascript
document.documentElement.style.setProperty(
  '--scrollbar-width',
  (window.innerWidth - document.documentElement.clientWidth) + 'px'
);
```

### Complete Reset Template

```css
/* ========== ZERO MARGIN RESET ========== */

/* 1. Box Sizing Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 2. Remove Default Margins */
* {
  margin: 0;
  padding: 0;
}

/* 3. HTML & Body Full Width */
html, body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 4. Images Full Width by Default */
img, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

/* 5. Remove List Styles */
ul, ol {
  list-style: none;
}

/* ========== UTILITY CLASSES ========== */

/* Full Width Section */
.w-full {
  width: 100%;
}

/* Full Viewport Width */
.w-screen {
  width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

/* Breakout from Container */
.breakout {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

/* Full Bleed (background extends, content contained) */
.full-bleed {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding-left: calc(50vw - 50%);
  padding-right: calc(50vw - 50%);
}

/* Zero Padding */
.p-0 {
  padding: 0 !important;
}

/* Zero Margin */
.m-0 {
  margin: 0 !important;
}
```

### Tailwind CSS Solutions

#### Tailwind Config for Full Width
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'full-bleed': 'calc(-50vw + 50%)',
      },
      width: {
        'screen-safe': 'calc(100vw - var(--scrollbar-width, 0px))',
      },
    },
  },
}
```

#### Tailwind Utility Classes
```html
<!-- Full width section -->
<section class="w-full max-w-none mx-0 px-0">

<!-- Breakout from container -->
<div class="w-screen relative left-1/2 -translate-x-1/2">

<!-- Full bleed background -->
<div class="w-screen ml-[calc(-50vw+50%)] px-[calc(50vw-50%)]">

<!-- Remove all spacing -->
<div class="m-0 p-0">
```

#### Custom Tailwind Plugin
```javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.breakout': {
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
        },
        '.full-bleed': {
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          paddingLeft: 'calc(50vw - 50%)',
          paddingRight: 'calc(50vw - 50%)',
        },
        '.zero-margin': {
          margin: '0',
          padding: '0',
          maxWidth: 'none',
        },
      });
    }),
  ],
}
```

### Framework-Specific Fixes

#### Next.js / React
```jsx
// styles/globals.css
html, body, #__next {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

// Component
const FullWidthSection = ({ children, className }) => (
  <section className={`w-full max-w-none m-0 p-0 ${className}`}>
    {children}
  </section>
);

// Breakout Component
const Breakout = ({ children, className }) => (
  <div
    className={className}
    style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
    }}
  >
    {children}
  </div>
);
```

#### Bootstrap Override
```css
/* Override Bootstrap container */
.container-fluid.zero-margin {
  padding-left: 0;
  padding-right: 0;
  max-width: 100%;
}

.row.zero-margin {
  margin-left: 0;
  margin-right: 0;
}

.col.zero-margin,
[class*="col-"].zero-margin {
  padding-left: 0;
  padding-right: 0;
}

/* Full width section in Bootstrap */
.full-width-bootstrap {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
```

### Common Layout Patterns

#### Pattern 1: Full-Width Hero, Contained Content
```html
<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .hero-full {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background: #1E3A8A;
  }
  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 20px;
  }
</style>

<div class="container">
  <nav>Navigation</nav>

  <!-- Full width hero breaks out -->
  <section class="hero-full">
    <div class="hero-content">
      <h1>Edge to Edge Background</h1>
      <p>Content stays contained</p>
    </div>
  </section>

  <main>Regular contained content</main>
</div>
```

#### Pattern 2: Alternating Full/Contained
```css
.section-full {
  width: 100%;
  padding: 4rem 0;
}

.section-contained {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 20px;
}

/* Auto-alternating with nth-child */
section:nth-child(odd) {
  background: #f8f9fa;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding-left: calc(50vw - 50%);
  padding-right: calc(50vw - 50%);
}
```

#### Pattern 3: Image Full Bleed
```css
.image-full-bleed {
  width: 100vw;
  height: 60vh;
  margin-left: calc(-50vw + 50%);
  object-fit: cover;
  object-position: center;
}
```

### Debugging Checklist

```markdown
## White Space Debugging

1. [ ] Check html/body margins → Set to 0
2. [ ] Check container max-width → Remove or breakout
3. [ ] Check parent padding → Negative margins
4. [ ] Check overflow-x → Set to hidden on body
5. [ ] Check 100vw vs 100% → Account for scrollbar
6. [ ] Check framework defaults → Override as needed
7. [ ] Inspect with DevTools → Highlight element boundaries
```

### DevTools Quick Debug
```javascript
// Paste in console to highlight all element boundaries
document.querySelectorAll('*').forEach(el => {
  el.style.outline = '1px solid red';
});

// Find elements causing horizontal overflow
document.querySelectorAll('*').forEach(el => {
  if (el.scrollWidth > el.clientWidth) {
    console.log('Overflow:', el);
    el.style.outline = '3px solid blue';
  }
});
```

### Execution Steps

1. **Identify the Problem**
   - Use DevTools to find white space source
   - Check computed styles for margins/padding
   - Identify which element is constrained

2. **Apply Base Reset**
   - Add box-sizing border-box
   - Remove html/body default margins
   - Set overflow-x hidden

3. **Fix Container Issues**
   - Remove or override max-width where needed
   - Use breakout technique for specific sections
   - Apply full-bleed for backgrounds

4. **Handle Scrollbar**
   - Use 100% instead of 100vw where possible
   - Or calculate scrollbar width with JS

5. **Test Responsively**
   - Check all breakpoints
   - Verify no horizontal scroll
   - Ensure content doesn't touch edges (add internal padding)

### Output Format

```
Problem Identified: [Source of white space]
Framework: [CSS/Tailwind/Bootstrap/etc]
Solution Applied: [Reset/Breakout/Override]
Classes Added: [List of utility classes]
Code Changes: [Specific CSS/HTML changes]
```

## Notes

- `100vw` includes scrollbar width - can cause horizontal scroll
- Use `overflow-x: hidden` on body as safety net
- Internal content should still have padding for readability
- Test on multiple screen sizes
- Framework resets may conflict - check specificity
- Mobile browsers have different viewport calculations
- Always check for horizontal scrollbar after changes
