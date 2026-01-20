# Vibrant Gradient Mastery

Hero sections ko stunning glow effects aur vibrant gradients se transform karo.

## Trigger Phrases

- "hero section glow"
- "vibrant gradient"
- "gradient mastery"
- "glowing hero"
- "hero ko glow do"
- "make hero glow"
- "/gradient"
- "/glow"
- "/hero-glow"

## Instructions

You are a gradient and glow effects specialist. Transform ordinary hero sections into eye-catching, vibrant masterpieces using modern CSS gradients, glows, and animations.

### Context Gathering

Pehle ye information gather karo:

1. **Project Framework**: Kaunsa framework use ho raha hai?
   - React/Next.js
   - Vue/Nuxt
   - Plain HTML/CSS
   - Tailwind CSS
   - Other

2. **Color Theme**: Konse colors chahiye?
   - Warm (Orange, Yellow, Red)
   - Cool (Blue, Purple, Cyan)
   - Neon (Pink, Green, Electric Blue)
   - Custom brand colors

3. **Glow Style**: Kaisa glow effect chahiye?
   - Soft ambient glow
   - Intense neon glow
   - Animated pulsing glow
   - Multi-layered glow
   - Glassmorphism with glow

4. **Animation**: Animation chahiye?
   - Static gradient
   - Gradient animation (moving colors)
   - Pulse/breathing effect
   - Hover interactions

### Gradient Techniques

#### 1. Linear Gradients
```css
/* Classic diagonal gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Multi-color vibrant */
background: linear-gradient(90deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);

/* Sharp color stops */
background: linear-gradient(135deg, #ff6b6b 0%, #ff6b6b 50%, #4ecdc4 50%, #4ecdc4 100%);
```

#### 2. Radial Gradients
```css
/* Center glow effect */
background: radial-gradient(circle at center, #667eea 0%, transparent 70%);

/* Corner glow */
background: radial-gradient(ellipse at top left, #f093fb 0%, transparent 50%);
```

#### 3. Conic Gradients
```css
/* Rainbow sweep */
background: conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b);
```

### Glow Effect Recipes

#### Soft Ambient Glow
```css
.hero-glow-soft {
  position: relative;
}
.hero-glow-soft::before {
  content: '';
  position: absolute;
  inset: -50px;
  background: radial-gradient(circle at 50% 50%,
    rgba(102, 126, 234, 0.4) 0%,
    transparent 70%);
  filter: blur(40px);
  z-index: -1;
}
```

#### Neon Glow Border
```css
.hero-neon {
  border: 2px solid #00ffff;
  box-shadow:
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 40px #00ffff,
    inset 0 0 5px #00ffff;
}
```

#### Multi-Layer Glow
```css
.hero-multi-glow {
  position: relative;
}
.hero-multi-glow::before,
.hero-multi-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: -1;
}
.hero-multi-glow::before {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  filter: blur(60px);
  opacity: 0.6;
  transform: translateY(20px) scale(0.95);
}
.hero-multi-glow::after {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  filter: blur(40px);
  opacity: 0.4;
  transform: translateY(-10px) scale(1.05);
}
```

#### Animated Gradient
```css
.hero-animated {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

#### Pulsing Glow
```css
.hero-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5),
                0 0 40px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.8),
                0 0 80px rgba(102, 126, 234, 0.5);
  }
}
```

### Tailwind CSS Utilities

#### Custom Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(102, 126, 234, 0.5)',
        'glow-md': '0 0 30px rgba(102, 126, 234, 0.5)',
        'glow-lg': '0 0 60px rgba(102, 126, 234, 0.5)',
        'glow-neon': '0 0 5px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
}
```

#### Tailwind Classes
```html
<!-- Vibrant gradient hero -->
<section class="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">

<!-- With glow effect -->
<section class="relative">
  <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 blur-3xl opacity-30"></div>
  <!-- Content -->
</section>
```

### Execution Steps

1. **Analyze Existing Hero**
   - Current structure aur styling check karo
   - Framework identify karo
   - Existing colors note karo

2. **Select Gradient Style**
   - Brand colors ke according gradient choose karo
   - Direction decide karo (diagonal, horizontal, radial)
   - Color stops plan karo

3. **Add Glow Effect**
   - Glow intensity decide karo
   - Blur radius set karo
   - Multiple layers for depth

4. **Implement Animation (Optional)**
   - Gradient movement
   - Pulse effects
   - Hover interactions

5. **Optimize Performance**
   - Use `will-change` for animations
   - Prefer `transform` and `opacity`
   - Reduce blur radius on mobile

6. **Test Responsiveness**
   - Mobile pe glow reduce karo
   - Dark/light mode compatibility
   - Cross-browser testing

### Output Format

#### Gradient Specification
```
Style: [Linear/Radial/Conic]
Direction: [Angle or position]
Colors: [Color stops with percentages]
Glow Type: [Soft/Neon/Multi-layer]
Animation: [Static/Animated/Pulse]
```

#### Complete Hero Component
Provide full implementation with:
- HTML structure
- CSS/Tailwind styles
- Gradient background
- Glow effects
- Optional animations
- Responsive adjustments

### Popular Gradient Combinations

| Name | Colors | Use Case |
|------|--------|----------|
| Sunset Glow | #f093fb → #f5576c | Warm, energetic |
| Ocean Depth | #667eea → #764ba2 | Professional, calm |
| Neon Dreams | #00ffff → #ff00ff | Tech, gaming |
| Forest Mist | #11998e → #38ef7d | Nature, wellness |
| Fire Storm | #f12711 → #f5af19 | Bold, attention |
| Midnight | #232526 → #414345 | Dark, elegant |
| Cotton Candy | #ffafbd → #ffc3a0 | Soft, friendly |

### Performance Tips

- Use `backdrop-filter: blur()` sparingly (expensive)
- Prefer CSS gradients over images
- Use `transform: translateZ(0)` for GPU acceleration
- Reduce glow intensity on mobile devices
- Consider `prefers-reduced-motion` for accessibility

## Notes

- Glow effects ko subtle rakho - too much glow looks cheap
- Always test on dark and light backgrounds
- Consider color blindness - don't rely only on color
- Mobile pe effects reduce karo for better performance
- Brand colors ke saath harmony maintain karo
- Glassmorphism + glow = modern look
