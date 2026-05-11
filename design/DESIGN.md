---
name: Cybernetic Hebrew Interface
colors:
  surface: '#08132a'
  surface-dim: '#08132a'
  surface-bright: '#2f3952'
  surface-container-lowest: '#030d25'
  surface-container-low: '#101b33'
  surface-container: '#151f37'
  surface-container-high: '#1f2942'
  surface-container-highest: '#2a344d'
  on-surface: '#d9e2ff'
  on-surface-variant: '#b9ccb2'
  inverse-surface: '#d9e2ff'
  inverse-on-surface: '#263049'
  outline: '#84967e'
  outline-variant: '#3b4b37'
  surface-tint: '#00e639'
  primary: '#ebffe2'
  on-primary: '#003907'
  primary-container: '#00ff41'
  on-primary-container: '#007117'
  inverse-primary: '#006e16'
  secondary: '#b9c7e4'
  on-secondary: '#233148'
  secondary-container: '#3c4962'
  on-secondary-container: '#abb9d6'
  tertiary: '#f9f8ff'
  on-tertiary: '#20304f'
  tertiary-container: '#cedcff'
  on-tertiary-container: '#516082'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72ff70'
  primary-fixed-dim: '#00e639'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#00530e'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b9c7e4'
  on-secondary-fixed: '#0d1c32'
  on-secondary-fixed-variant: '#39475f'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#b6c6ed'
  on-tertiary-fixed: '#091b39'
  on-tertiary-fixed-variant: '#374767'
  background: '#08132a'
  on-background: '#d9e2ff'
  surface-variant: '#2a344d'
typography:
  display-lg:
    fontFamily: Assistant
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Assistant
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h2:
    fontFamily: Assistant
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-main:
    fontFamily: Assistant
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Assistant
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Assistant
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
  code-block:
    fontFamily: Fira Code
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  terminal-log:
    fontFamily: Fira Code
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin: 32px
---

## Brand & Style

The design system is a high-performance, technical framework designed for data-intensive environments where Hebrew localization is a primary requirement. It strikes a balance between **Modern Minimalism** and **Cyberpunk-inspired Futurism**. 

The aesthetic is characterized by deep, oceanic dark tones punctuated by high-vibrancy "Neon Cyber Green" accents. The interface should feel like a command center: authoritative, precise, and highly legible. It utilizes subtle glassmorphism and sharp structural lines to maintain a sense of technological sophistication while ensuring that complex Hebrew typography remains the focal point of the user experience.

## Colors

The palette is rooted in a **Deep Navy** foundation to reduce eye strain during prolonged technical use. 

- **Primary:** Neon Cyber Green (#00FF41) is used exclusively for actionable elements, progress indicators, and critical success states.
- **Secondary/Tertiary:** Variations of Deep Navy create the structural hierarchy. Surfaces move from darker backgrounds to lighter "raised" containers.
- **Neutral:** A desaturated silver-blue provides high-contrast legibility for text without the harshness of pure white.
- **Functional:** A vivid magenta-red is reserved for terminal errors and destructive actions to contrast against the green primary theme.

## Typography

The typography strategy prioritizes bi-directional legibility. 

- **UI & Content:** **Assistant** is the workhorse font. Its modern Hebrew glyphs are designed for screen clarity, ensuring that vowel marks (Niqqud) and character distinctions are sharp even at smaller sizes.
- **Technical Data:** **Fira Code** is utilized for all logs, metrics, and terminal outputs. The monospaced nature provides the necessary alignment for scanning data columns and debugging scripts.
- **Hierarchy:** Use bold weights of Assistant for headlines to anchor the layout, especially in RTL (Right-to-Left) configurations where visual weight needs to lead the eye correctly.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a base-8 rhythm. 

The layout must be fully responsive to RTL and LTR contexts. In Hebrew mode, the grid flow reverses, with the primary navigation anchored to the right. Use ample whitespace (the `lg` and `xl` tokens) between major content sections to prevent the dark interface from feeling cluttered or claustrophobic. Gutters are kept tight at 20px to maintain the "dense information" feel required for technical dashboards.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Glassmorphism**, rather than traditional drop shadows.

1.  **Base Level:** Deep Navy (#0A192F).
2.  **Surface Level:** Tertiary Navy (#112240) with a 1px solid stroke of 10% opacity Neon Green to define boundaries.
3.  **Floating Level:** Semi-transparent glass (Surface Glass) with a background blur of 12px. This is used for modals and dropdown menus.

Inner glows (0 0 5px) using the Primary Green are permitted sparingly for active states or "online" indicators to simulate a glowing terminal screen.

## Shapes

The shape language is **Soft-Technical**. A consistent 0.25rem (4px) border radius is applied to buttons, input fields, and cards. This creates a precise, engineered look that is less aggressive than sharp corners but more professional than fully rounded "pill" shapes. 

Large containers (like main content areas) use the `rounded-lg` (8px) token to subtly frame the data.

## Components

- **Buttons:** Primary buttons feature a solid Neon Green background with black Assistant text for maximum contrast. Secondary buttons use a Ghost style: 1px Neon Green border with green text.
- **Data Logs:** Encapsulated in a container with a background of #050C16. Text must be Fira Code. Syntax highlighting should use the Neon Green for keywords.
- **Inputs:** Dark backgrounds with a bottom-border-only focus state in Neon Green. Labels use Assistant Bold at 12px.
- **Status Chips:** Small, rectangular tags with a subtle background tint and a high-brightness dot indicator.
- **Terminal Cards:** Cards that house technical metrics should have a "header" bar in a slightly lighter navy with the title in Assistant and the value in Fira Code.
- **Navigation:** Right-aligned (for Hebrew) vertical sidebar with icons and labels. The active state is indicated by a vertical Neon Green bar on the outer edge.