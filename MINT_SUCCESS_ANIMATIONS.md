# Receipt Mint Success Micro-Animations

## Overview

Enhanced receipt NFT minting success screen with delightful micro-animations that provide clear visual feedback without being distracting.

## Animation Components

### 1. **Checkmark Draw Animation**
- **SVG path animation** that draws the checkmark stroke from start to finish
- Duration: 0.8s with 0.3s delay
- Easing: `cubic-bezier(0.65, 0, 0.35, 1)` for smooth drawing effect
- Uses `stroke-dasharray` and `stroke-dashoffset` for the draw effect

### 2. **Success Scale-In**
- Icon container scales from 0 to 1 with rotation
- Creates a playful bounce effect
- Duration: 0.8s
- Easing: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` for elastic bounce

### 3. **Radial Burst Effect**
- Background glow expands outward and fades
- Creates a burst of light effect
- Duration: 1s
- Two layers:
  - Fast burst (animate-radial-burst)
  - Slow pulsing glow (animate-glow-expand)

### 4. **Confetti Particles**
- 10 pure CSS confetti particles
- Fall from top with rotation
- Staggered animation delays for natural effect
- Colors match Base brand palette (blues, teals, purples)
- Duration: 3s

### 5. **Sparkle Twinkle**
- Sparkle icons rotate and scale
- Creates a twinkling effect
- Duration: 2s infinite loop
- Two sparkles with offset delays (0s and 0.5s)

### 6. **Sequential Float-Up**
- Content elements float up sequentially
- Staggered delays (0.1s, 0.2s, 0.3s, etc.)
- Creates a cascading reveal effect
- Duration: 0.6s per element
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth motion

## Animation Timing

```
0.0s  - Card fades in
0.0s  - Success icon scales in with rotation
0.1s  - Confetti starts falling
0.3s  - Checkmark draws
0.1s  - Title floats up
0.2s  - Subtitle floats up
0.3s  - Transaction hash floats up
0.4s  - Button floats up
0.5s  - Footer text floats up
```

Total duration: ~1.5s for complete sequence

## Accessibility

### Reduced Motion Support

All animations respect user preferences via `@media (prefers-reduced-motion: reduce)`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-checkmark-draw,
  .animate-success-scale-in,
  .animate-radial-burst,
  .animate-float-up,
  .animate-glow-expand,
  .animate-sparkle-twinkle,
  .confetti-particle {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

When reduced motion is enabled:
- All animations are disabled
- Elements appear instantly in their final state
- Checkmark is fully drawn immediately
- No movement or transitions

## Technical Implementation

### CSS Keyframes

All animations are pure CSS using `@keyframes`:
- `checkmark-draw` - SVG stroke animation
- `success-scale-in` - Scale and rotation
- `radial-burst` - Expanding glow
- `confetti-fall` - Falling particles with rotation
- `float-up` - Upward movement with fade-in
- `glow-expand` - Pulsing glow effect
- `sparkle-twinkle` - Scale and rotation

### Performance

- **No JavaScript animations** - All CSS for optimal performance
- **Hardware accelerated** - Uses transform and opacity for 60fps
- **No heavy libraries** - Pure CSS implementation
- **Lightweight** - ~2KB of additional CSS
- **Non-blocking** - Animations don't prevent user interaction

## Usage

The animations automatically trigger when the mint transaction is successful:

```tsx
if (isSuccess) {
  return (
    <Card className="animate-fade-in relative overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="confetti-particle rounded-full" />
        ))}
      </div>

      {/* Success icon with animations */}
      <div className="animate-success-scale-in">
        <div className="animate-radial-burst" />
        <div className="animate-glow-expand" />
        {/* Checkmark SVG with animate-checkmark-draw */}
      </div>

      {/* Content with staggered float-up */}
      <h3 className="animate-float-up stagger-1">Receipt Minted!</h3>
      <p className="animate-float-up stagger-2">Success message</p>
      {/* More elements with stagger-3, stagger-4, etc. */}
    </Card>
  );
}
```

## Animation Principles

1. **Purposeful** - Each animation provides visual feedback
2. **Delightful** - Celebrates the successful mint
3. **Fast** - Completes in ~1.5s, doesn't block interaction
4. **Smooth** - Uses proper easing curves
5. **Accessible** - Respects reduced-motion preferences
6. **Lightweight** - Pure CSS, no heavy dependencies

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

All animations use standard CSS features with excellent browser support.
