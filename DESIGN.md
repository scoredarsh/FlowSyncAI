# Design System Strategy: Tactical Intelligence

## 1. Overview & Creative North Star

### Creative North Star: "The Silent Sentinel"
This design system is engineered to feel like a high-performance command center—an interface that doesn't just display data but "operates" it. The aesthetic is rooted in **Tactical Intelligence**: a cinematic, dark-room environment where focus is directed through luminous accents and atmospheric depth rather than structural rigidity.

To move beyond a generic dashboard, we utilize **Intentional Asymmetry**. Large-scale data visualizations (Heatmaps/Safety Matrices) should act as the anchor, while peripheral controls utilize varying card widths and "Ghost" headers to break the standard 12-column grid monotony. The system leverages the contrast between expansive, void-like backgrounds (`#0a0e14`) and sharp, neon-precision elements to create a sense of high-stakes reliability.

---

## 2. Colors

### Tonal Foundation
- **Primary (`#99f7ff`):** Use for active states, high-priority data points, and tactical "glow" effects. 
- **Urgency Accents:** 
    - `secondary` (`#ff716b`): High-alert zones and critical failures.
    - `tertiary` (`#ffa44f`): Warning states and predictive risk.
- **Background (`#0a0e14`):** The absolute foundation. All UI elements must feel like they are emerging from this deep, matte void.

### The "No-Line" Rule
Explicitly prohibit 1px solid borders for sectioning. Boundaries are defined by background shifts.
- A **Main Control Panel** sits on `background`.
- **Sub-panels** or sidebar utilities should use `surface-container-low`.
- **Primary Data Cards** use `surface-container`.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent glass:
1. **Base Layer:** `surface` (#0a0e14).
2. **Structural Sections:** `surface-container-low` (#0f141a).
3. **Interactive Containers:** `surface-container` (#151a21).
4. **Active Highlighting:** `surface-container-highest` (#20262f).

### The "Glass & Gradient" Rule
Floating tactical overlays must use **Glassmorphism**: 
- `background-color`: rgba(21, 26, 33, 0.7)
- `backdrop-filter`: blur(12px)
- **Signature Texture:** Use a 45-degree linear gradient from `primary` (#99f7ff) to `primary-container` (#00f1fe) at 10% opacity for large card backgrounds to give them a "powered-on" energy.

---

## 3. Typography

The typographic system balances technical precision with editorial legibility.

- **Display & Headlines (Space Grotesk):** This is our "engineered" face. Its geometric apertures evoke a sense of high-tech manufacturing. Use `display-lg` for critical metric readouts (e.g., "3 Zones").
- **Titles & Body (Manrope):** A clean, modern sans-serif that ensures long-form logs and status reports remain highly readable in low-light environments.
- **Micro-labels (Inter):** Reserved for technical metadata, status pills, and axis labels. The high x-height of Inter ensures legibility at `label-sm` (0.6875rem) sizes.

**Editorial Hierarchy Tip:** High-contrast metrics should be 300% larger than their supporting subtext (`on-surface-variant`) to create an immediate visual "hook" for the operator.

---

## 4. Elevation & Depth

### Tonal Layering
Depth is achieved through "stacking" tones. Never use a drop shadow to separate a card from its parent container; instead, use the `surface-container` scale. A `surface-container-high` card on a `surface-container-low` background creates a "lift" that feels integrated into the hardware.

### Ambient Shadows
For floating modals or pop-overs, use **Atmospheric Shadows**:
- **Color:** `on-primary` (#005f64) at 5% opacity.
- **Blur:** 40px - 60px.
- **Effect:** This creates a subtle cyan "aura" rather than a dark shadow, mimicking the light cast from a monitor.

### The "Ghost Border" Fallback
If an element requires a container boundary (like a Safety Score card), use a **Ghost Border**:
- `outline-variant` (#44484f) at **15% opacity**.
- **Luminous Edge:** On the "Active" state, the top border can be a 1px solid `primary` (#99f7ff) to simulate a light-catching edge.

---

## 5. Components

### Tactical Buttons
- **Primary:** Full `primary` fill with `on-primary` text. No border.
- **Secondary:** `surface-container-highest` fill with a `primary` Ghost Border (20% opacity).
- **Interactive States:** Hovering should trigger a `primary_dim` outer glow (`box-shadow: 0 0 15px #00f1fe`).

### Status Pills (Micro-Labels)
- **Nominal:** `surface-container-high` background with a `primary` dot and text.
- **Alert:** `secondary_container` background with `secondary` text.
- Sizing: Always use `rounded-full` and `label-sm` typography.

### Data Cards
- **Construction:** No dividers. Separate "Metric," "Label," and "Trend" using the `Spacing Scale`.
- **Spacing:** Use `spacing-5` (1.1rem) for internal padding to maintain a "breathable" high-end feel.
- **Header:** Use `title-sm` in `on-surface-variant` (muted) to prioritize the data over the label.

### The "Safety Matrix" Heatmap
Specialized component: Uses a dark satellite imagery base with a `primary` radial gradient for "Optimal" zones and a `secondary` pulse for "Conflict" zones.

---

## 6. Do's and Don'ts

### Do:
- **Use Subtlety:** Lean on `on-surface-variant` for 80% of your UI text. Only use `on-surface` (pure white/blue) for the most critical data.
- **Embrace the Void:** Leave ample `spacing-16` or `spacing-24` between major dashboard sections. Crowding kills the premium feel.
- **Use Micro-Glows:** Apply a 2px `blur` to critical icons in the `primary` color to make them look like glowing LED indicators.

### Don't:
- **Don't use 100% Opacity Borders:** High-contrast lines make the UI look like a spreadsheet.
- **Don't use Pure Greys:** All neutrals must be "tinted" with the blue/teal of the background (`#0a0e14`) to maintain the cinematic atmosphere.
- **Don't use Standard Shadows:** Avoid "Drop Shadow: Black 25%." It breaks the glassmorphism. Use the Cyan "Ambient Shadow" instead.