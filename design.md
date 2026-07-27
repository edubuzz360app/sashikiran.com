# SashVerse - Visual Language of the Product Foundation Engine

## Mission

Define the visual expression layer of Sashology - the AI-native Product Foundation Engine - ensuring that every surface rendered for humans and AI agents within SashVerse communicates depth, clarity, and intentional hierarchy through a dark, immersive, token-driven visual language.

---

## Brand

| Property | Value |
|---|---|
| **Product** | Sashology - The Product Foundation Engine |
| **Ecosystem** | SashVerse |
| **Founder** | Sashikiran |
| **Audience** | AI agents, product engineers, founders, and autonomous systems building within SashVerse |
| **Product surface** | AI-native product interfaces, agent interaction layers, and immersive intelligence dashboards |

---

## Style Foundations

| Property | Value |
|---|---|
| **Visual style** | Futuristic, immersive, intelligence-driven |
| **Font** | `font.family.primary` = Inter |
| **Font stack** | `font.family.stack` = Inter, system-ui, sans-serif |
| **Base size** | 14px |
| **Line height** | 22px |

---

## Color Tokens

### Surface

| Token | Value |
|---|---|
| `color.surface.base` | `#05070F` |
| `color.surface.elevated` | `#0B1220` |
| `color.surface.glass` | `rgba(255, 255, 255, 0.05)` |
| `color.surface.glass.strong` | `rgba(255, 255, 255, 0.08)` |

### Text

| Token | Value |
|---|---|
| `color.text.primary` | `#E5E7EB` |
| `color.text.secondary` | `#9CA3AF` |
| `color.text.muted` | `#6B7280` |

### Primary

| Token | Value |
|---|---|
| `color.primary` | `#E10600` |
| `color.primary.hover` | `#FF2A1A` |
| `color.primary.glow` | `rgba(225, 6, 0, 0.4)` |

### Border

| Token | Value |
|---|---|
| `color.border.subtle` | `rgba(255, 255, 255, 0.08)` |

---

## Glass Tokens

| Token | Value |
|---|---|
| `blur` | 16px |
| `border` | `rgba(255, 255, 255, 0.1)` |

---

## Motion Tokens

| Token | Value |
|---|---|
| `fast` | 200ms |
| `normal` | 300ms |
| `slow` | 500ms |

---

## Accessibility

- **WCAG 2.2 AA** required
- **Focus-visible** must be clearly visible
- **Glass** must not reduce readability

---

## Rules

1. Must use semantic tokens - all visual values reference the token layer, never raw values
2. Must include all interaction states for every rendered surface
3. Must maintain depth hierarchy across layered panels and agent interfaces
4. Must ensure readability on dark surfaces for both human and agent-consumed views
5. Visual expression must align with the intelligence contracts defined in Sashology
