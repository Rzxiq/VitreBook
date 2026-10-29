# Reactive Native Liquid Glass UI Engine

> A premium, production-quality Liquid Glass UI system inspired by Apple's liquid glass design language for React Native & Android.

---

## 1. Visual Design Architecture (Obsidian Glass)

- **Base Canvas:** Deep obsidian black (`#050506` & `#0A0A0D`).
- **Dynamic Glass Fill:** `rgba(20, 20, 24, 0.58)` scaled dynamically via real-time opacity controls.
- **Dual-Border Optical Refraction:**
  - Top Bevel / Specular Rim: `rgba(255, 255, 255, 0.28)`
  - Lateral Edges: `rgba(255, 255, 255, 0.12)`
  - Bottom Ambient Falloff: `rgba(255, 255, 255, 0.07)`
- **Dynamic Specular Sheen:** Ambient oscillating reflection beam simulating directional light falling over polished curved glass surfaces.
- **Ambient Occlusion:** Multi-layer soft drop shadows (`shadowRadius: 12-32, elevation: 6-18`).

---

## 2. Spring Physics Specifications

Tuned physical springs mapped to React Native's native UI driver:

| Preset | Stiffness | Damping | Mass | Primary Use Case |
|---|---|---|---|---|
| **Primary** | `280` | `24` | `0.8` | Tactile button press compression & tab pill gliding |
| **Soft Panel** | `170` | `22` | `1.0` | Sheet dragging & smooth expansion |
| **Elastic Release**| `220` | `18` | `0.9` | Drag boundary snapback & card return |
| **Modal Entrance** | `240` | `26` | `0.9` | Bottom sheet entrance & dialog pop-in |

All springs dynamically scale with the user's **Spring Multiplier** (0.5x to 2.0x) from `useGlassStore`.

---

## 3. Reusable Component Matrix (`src/components/`)

1. **`GlassSurface`** (`src/components/glass/GlassSurface.tsx`): Configurable glass container with dynamic opacity, specular top edge, and ambient sheen reflection.
2. **`GlassButton`** (`src/components/controls/GlassButton.tsx`): Tactile button with spring compression (down to `0.95` scale), highlight tracking, variants (`primary`, `secondary`, `ghost`, `danger`), and loading states.
3. **`GlassTabBar`** (`src/components/navigation/GlassTabBar.tsx`): Floating obsidian navigation bar with gliding active pill indicator and spring transitions.
4. **`GlassCard`** (`src/components/glass/GlassCard.tsx`): Layered card with depth, elevation levels, and interactive press states.
5. **`GlassSheet`** (`src/components/glass/GlassSheet.tsx`): Drag-to-dismiss bottom sheet with elastic boundaries, grab handle, and backdrop dimming.
6. **`GlassInput`** (`src/components/controls/GlassInput.tsx`): Input field with focus glow, animated border transition, and keyboard safety.
7. **`GlassToggle`** (`src/components/controls/GlassToggle.tsx`): Tactile switch with spring-driven thumb physics.
8. **`GlassSlider`** (`src/components/controls/GlassSlider.tsx`): Touch-responsive slider with spring-assisted thumb and live numeric feedback.
9. **`GlassDialog`** (`src/components/glass/GlassDialog.tsx`): Modal with spring zoom entrance, accessible controls, and dark backdrop.
10. **`GlassIcon`** (`src/components/controls/GlassIcon.tsx`): Icon wrapper with animated touch compression and selection states.
11. **`GlassProgress`** (`src/components/controls/GlassProgress.tsx`): Progress bar with specular shimmer highlight.
12. **`GlassToast`** (`src/components/glass/GlassToast.tsx`): Transient notification with spring entrance and horizontal swipe-to-dismiss.
13. **`GlassRipple`** (`src/components/glass/GlassRipple.tsx`): Touch-originating optical ripple propagation.

---

## 4. Flagship Interactive Demo (`LiquidDemoScreen.tsx`)

The main screen features:
- **Full-screen obsidian canvas** with subtle ambient light field drift.
- **Top status header** titled "Liquid" with live 60 FPS pulsating indicator.
- **Floating Hero Panel** with real-time density progress and action triggers.
- **Draggable Elastic Card** demonstrating logarithmic boundary resistance and spring snapback.
- **Live Optical Controls:**
  - Glass Opacity slider (15% to 95%).
  - Backdrop Blur Intensity slider (4px to 40px).
  - Physics Spring Multiplier slider (0.5x to 2.0x).
  - Specular Sheen Reflection toggle.
  - Reset Scene to Default button.
- **Press & Hold showcase** tracking hold counts and toast events.
- **Obsidian Tile Matrix** (bento grid layout).
- **Floating Bottom Glass Bar** for fluid tab switching.
