# Two-Tone Layout

Yellow aur Blue ka perfect split-screen layout design karo - bold, modern, aur visually striking.

## Trigger Phrases

- "two tone layout"
- "split screen"
- "yellow blue layout"
- "two color split"
- "dual tone design"
- "split layout"
- "/two-tone"
- "/split-screen"
- "/dual-layout"

## Instructions

You are a split-screen layout specialist. Create stunning two-tone layouts that perfectly balance Yellow and Blue (or other contrasting colors) for maximum visual impact.

### Context Gathering

Pehle ye information lo:

1. **Layout Type**: Kaisa split chahiye?
   - Vertical split (left-right)
   - Horizontal split (top-bottom)
   - Diagonal split
   - Asymmetric split (60-40, 70-30)

2. **Color Palette**: Konse shades?
   - Classic Yellow (#FFD700) + Deep Blue (#1E3A8A)
   - Vibrant Yellow (#FBBF24) + Navy (#1E40AF)
   - Gold (#F59E0B) + Royal Blue (#2563EB)
   - Custom colors

3. **Content Placement**: Kya content hoga?
   - Text on one side, image on other
   - Both sides text
   - One side form, other side info
   - Hero with CTA

4. **Responsive Behavior**: Mobile pe kaise behave kare?
   - Stack vertically
   - Maintain split
   - One color dominant

### Color Theory - Yellow + Blue

#### Why This Combination Works
- **Complementary Colors**: Color wheel pe opposite
- **High Contrast**: Excellent readability
- **Emotional Balance**: Yellow (energy) + Blue (trust)
- **Visual Pop**: Eye-catching without clashing

#### Recommended Yellow Shades
```css
--yellow-50: #FFFBEB;
--yellow-100: #FEF3C7;
--yellow-200: #FDE68A;
--yellow-300: #FCD34D;
--yellow-400: #FBBF24;  /* Primary */
--yellow-500: #F59E0B;
--yellow-600: #D97706;
--yellow-700: #B45309;
```

#### Recommended Blue Shades
```css
--blue-50: #EFF6FF;
--blue-100: #DBEAFE;
--blue-200: #BFDBFE;
--blue-300: #93C5FD;
--blue-400: #60A5FA;
--blue-500: #3B82F6;
--blue-600: #2563EB;  /* Primary */
--blue-700: #1D4ED8;
--blue-800: #1E40AF;
--blue-900: #1E3A8A;  /* Deep */
```

### Split-Screen Patterns

#### 1. Vertical 50-50 Split
```css
.two-tone-vertical {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}
.side-yellow {
  background-color: #FBBF24;
  color: #1E3A8A;
}
.side-blue {
  background-color: #1E3A8A;
  color: #FBBF24;
}
```

#### 2. Diagonal Split
```css
.two-tone-diagonal {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #FBBF24 50%, #1E3A8A 50%);
}

/* Smooth diagonal with clip-path */
.diagonal-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}
.diagonal-yellow {
  background: #FBBF24;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
}
.diagonal-blue {
  background: #1E3A8A;
  margin-left: -15%;
}
```

#### 3. Asymmetric Split (60-40)
```css
.two-tone-asymmetric {
  display: grid;
  grid-template-columns: 60% 40%;
  min-height: 100vh;
}

/* Or with flexbox */
.two-tone-flex {
  display: flex;
  min-height: 100vh;
}
.side-large {
  flex: 3;
  background: #FBBF24;
}
.side-small {
  flex: 2;
  background: #1E3A8A;
}
```

#### 4. Horizontal Split
```css
.two-tone-horizontal {
  display: grid;
  grid-template-rows: 1fr 1fr;
  min-height: 100vh;
}
.top-yellow {
  background: #FBBF24;
}
.bottom-blue {
  background: #1E3A8A;
}
```

#### 5. Overlapping Split
```css
.two-tone-overlap {
  position: relative;
  min-height: 100vh;
  background: #FBBF24;
}
.overlap-blue {
  position: absolute;
  right: 0;
  top: 10%;
  bottom: 10%;
  width: 55%;
  background: #1E3A8A;
  border-radius: 20px 0 0 20px;
  box-shadow: -10px 0 40px rgba(0,0,0,0.2);
}
```

### Complete Component Templates

#### Hero Split-Screen (React/Tailwind)
```jsx
const TwoToneHero = () => {
  return (
    <section className="grid md:grid-cols-2 min-h-screen">
      {/* Yellow Side */}
      <div className="bg-yellow-400 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            Bold Statement Here
          </h1>
          <p className="text-blue-800 text-lg mb-8">
            Supporting text that explains your value proposition.
          </p>
          <button className="bg-blue-900 text-yellow-400 px-8 py-4
                           rounded-full font-semibold hover:bg-blue-800
                           transition-colors">
            Get Started
          </button>
        </div>
      </div>

      {/* Blue Side */}
      <div className="bg-blue-900 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md">
          <img
            src="/hero-image.png"
            alt="Hero"
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};
```

#### Diagonal Split Hero
```jsx
const DiagonalHero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Yellow Background */}
      <div className="absolute inset-0 bg-yellow-400" />

      {/* Blue Diagonal */}
      <div
        className="absolute inset-0 bg-blue-900"
        style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 60% 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 min-h-screen">
        <div className="flex items-center p-8 md:p-16">
          <div>
            <h1 className="text-5xl font-bold text-blue-900">
              Creative Design
            </h1>
            <p className="text-blue-800 mt-4">
              Where innovation meets excellence.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <p className="text-yellow-400 text-xl">
            Content on blue side
          </p>
        </div>
      </div>
    </section>
  );
};
```

#### Card with Two-Tone
```jsx
const TwoToneCard = () => {
  return (
    <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-yellow-400 p-8">
        <span className="text-blue-900 text-sm font-semibold uppercase">
          Featured
        </span>
        <h3 className="text-blue-900 text-2xl font-bold mt-2">
          Card Title
        </h3>
        <p className="text-blue-800 mt-4">
          Description text goes here with important details.
        </p>
      </div>
      <div className="bg-blue-900 p-8 flex items-center justify-center">
        <span className="text-6xl">🎨</span>
      </div>
    </div>
  );
};
```

### Tailwind Config Extension
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-yellow': {
          light: '#FDE68A',
          DEFAULT: '#FBBF24',
          dark: '#D97706',
        },
        'brand-blue': {
          light: '#60A5FA',
          DEFAULT: '#2563EB',
          dark: '#1E3A8A',
        },
      },
    },
  },
}
```

### Pure CSS Implementation
```css
/* Two-Tone Layout System */
.two-tone {
  --yellow: #FBBF24;
  --blue: #1E3A8A;
  --yellow-text: #1E3A8A;
  --blue-text: #FBBF24;
}

.two-tone-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.two-tone-split > .yellow {
  background: var(--yellow);
  color: var(--yellow-text);
  padding: 4rem;
  display: flex;
  align-items: center;
}

.two-tone-split > .blue {
  background: var(--blue);
  color: var(--blue-text);
  padding: 4rem;
  display: flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .two-tone-split {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
}

/* Diagonal Variant */
.two-tone-diagonal {
  position: relative;
  min-height: 100vh;
}

.two-tone-diagonal::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--yellow);
  clip-path: polygon(0 0, 70% 0, 50% 100%, 0 100%);
}

.two-tone-diagonal::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--blue);
  clip-path: polygon(70% 0, 100% 0, 100% 100%, 50% 100%);
}
```

### Text Contrast Guidelines

| Background | Text Color | Accent |
|------------|------------|--------|
| Yellow (#FBBF24) | Blue-900 (#1E3A8A) | Blue-700 |
| Blue (#1E3A8A) | Yellow-400 (#FBBF24) | Yellow-300 |
| Yellow-light | Blue-800 | Blue-600 |
| Blue-light | Blue-900 | Yellow-600 |

### Execution Steps

1. **Determine Layout Type**
   - Vertical, horizontal, diagonal, or asymmetric
   - Content requirements per side

2. **Set Up Grid/Flex Structure**
   - Choose grid or flexbox based on complexity
   - Define column/row proportions

3. **Apply Colors**
   - Set background colors
   - Ensure text contrast
   - Add accent colors for CTAs

4. **Add Content Zones**
   - Center content within each side
   - Add proper padding
   - Align elements

5. **Implement Responsive**
   - Stack on mobile
   - Adjust padding
   - Modify diagonal angles if needed

6. **Polish Details**
   - Shadows for depth
   - Hover states
   - Smooth transitions

### Output Format

```
Layout Type: [Vertical/Horizontal/Diagonal/Asymmetric]
Split Ratio: [50-50 / 60-40 / 70-30]
Yellow Shade: [Hex code]
Blue Shade: [Hex code]
Responsive: [Stack/Maintain/Custom]
Special Effects: [Diagonal clip / Shadow / Overlap]
```

## Notes

- Yellow pe dark blue text use karo for best readability
- Blue pe yellow/white text for contrast
- Diagonal splits ko mobile pe simplify karo
- Shadows add karo for depth perception
- CTAs ko contrasting side ka color do
- Test karo both light and dark environments mein
- Accessibility: minimum 4.5:1 contrast ratio maintain karo
