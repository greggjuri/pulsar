# INITIAL-20: AWS-Aligned Node Color Presets

## Problem Statement

With the addition of official AWS service icons (PRP-18), there's a visual disconnect when node colors don't match their icon colors. For example, a Lambda node with a green glow looks inconsistent next to the orange Lambda icon. Users should be able to easily match node colors to the standard AWS category colors for professional-looking diagrams.

## User Story

**As a** user creating an AWS architecture diagram  
**I want** the color picker to offer AWS category colors  
**So that** I can easily match node colors to their service icons for visual consistency

## Goals

1. Replace current color presets with AWS-aligned colors
2. Keep one sci-fi accent color (cyan) for generic/custom nodes
3. Make it easy to create color-coordinated diagrams

## Non-Goals

- Auto-assigning colors based on service type (user controls color)
- Custom color input (hex picker) — future enhancement
- Per-category grouping in the color picker UI

## Design

### Current Color Presets (from PRP-13)
```javascript
const COLORS = [
  '#00ffff', // Cyan
  '#ff9900', // Orange  
  '#ff00ff', // Magenta
  '#4a90d9', // Blue
  '#00ff88', // Green
  '#ffffff', // White
];
```

### New AWS-Aligned Color Presets
Based on official AWS Architecture Icon colors:

| Color | Hex | AWS Category | Services |
|-------|-----|--------------|----------|
| Orange | `#FF9900` | Compute | Lambda, EC2, ECS, Fargate |
| Green | `#7AA116` | Storage | S3, EFS, EBS |
| Blue | `#527FFF` | Database | DynamoDB, RDS, Aurora, ElastiCache |
| Purple | `#8C4FFF` | Networking | API Gateway, CloudFront, Route53, VPC, ALB |
| Pink | `#E7157B` | App Integration | SQS, SNS, EventBridge, Step Functions |
| Red | `#DD344C` | Security | Cognito, IAM, WAF |
| Cyan | `#00FFFF` | Generic/Custom | Sci-fi accent, non-AWS nodes |

**7 colors total** — one more than current, but provides full AWS coverage plus our signature cyan.

### Color Picker Layout

Current layout is a horizontal row of color swatches. Keep this pattern:

```
┌─────────────────────────────────────────────────┐
│ Color                                           │
│ [🟠][🟢][🔵][🟣][🩷][🔴][🩵]                    │
│  ↑    ↑    ↑    ↑    ↑    ↑    ↑               │
│ Comp Stor  DB  Net  Int  Sec  Gen              │
└─────────────────────────────────────────────────┘
```

### Tooltip Enhancement (Optional)

Add tooltips to color swatches indicating their AWS category:
- Orange: "Compute (Lambda, EC2...)"
- Green: "Storage (S3, EFS...)"
- etc.

This helps users learn the color associations. Mark as optional — implement if straightforward.

## Technical Requirements

### Functional Requirements

1. **FR-1: Updated Color Presets**
   - Color picker shows 7 AWS-aligned colors
   - Colors match official AWS Architecture Icon palette
   - Order: Orange, Green, Blue, Purple, Pink, Red, Cyan

2. **FR-2: Visual Consistency**
   - Color swatches render correctly with new hex values
   - Selected state works for all colors
   - Glow/bloom effects look good with new colors

3. **FR-3: Existing Diagrams**
   - Nodes with old colors continue to display (colors are stored as hex)
   - No migration needed — old hex values still work

### Non-Functional Requirements

1. **NFR-1: Maintainability**
   - Colors defined in a single constant array
   - Easy to add/modify colors in future

## Component Changes

| File | Change |
|------|--------|
| `src/components/hud/NodeInfoPanel.jsx` | Update COLORS array with AWS-aligned hex values |

## Implementation

Single file change — update the COLORS constant:

```javascript
// AWS-aligned color presets
const COLORS = [
  '#FF9900', // Compute Orange (Lambda, EC2, ECS, Fargate)
  '#7AA116', // Storage Green (S3, EFS, EBS)
  '#527FFF', // Database Blue (DynamoDB, RDS, Aurora, ElastiCache)
  '#8C4FFF', // Network Purple (API GW, CloudFront, Route53, VPC, ALB)
  '#E7157B', // Integration Pink (SQS, SNS, EventBridge, Step Functions)
  '#DD344C', // Security Red (Cognito, IAM, WAF)
  '#00FFFF', // Generic Cyan (sci-fi accent, custom nodes)
];
```

### Optional: Tooltips

If adding tooltips, update the color swatch rendering:

```jsx
{COLORS.map((c) => (
  <button
    key={c}
    title={getColorTooltip(c)} // "Compute (Lambda, EC2...)"
    onClick={() => handleColorChange(c)}
    className={...}
    style={{ backgroundColor: c }}
  />
))}
```

With a helper:
```javascript
const COLOR_TOOLTIPS = {
  '#FF9900': 'Compute (Lambda, EC2, ECS, Fargate)',
  '#7AA116': 'Storage (S3, EFS, EBS)',
  '#527FFF': 'Database (DynamoDB, RDS, Aurora, ElastiCache)',
  '#8C4FFF': 'Networking (API Gateway, CloudFront, Route53, VPC, ALB)',
  '#E7157B': 'Integration (SQS, SNS, EventBridge, Step Functions)',
  '#DD344C': 'Security (Cognito, IAM, WAF)',
  '#00FFFF': 'Generic / Custom',
};

const getColorTooltip = (hex) => COLOR_TOOLTIPS[hex.toUpperCase()] || '';
```

## Acceptance Criteria

- [ ] Color picker shows 7 colors in order: Orange, Green, Blue, Purple, Pink, Red, Cyan
- [ ] All colors match official AWS hex values
- [ ] Selecting each color updates node correctly
- [ ] Node glow/bloom looks good with all new colors
- [ ] Existing diagrams with old colors still load correctly
- [ ] (Optional) Tooltips show AWS category on hover

## Testing Strategy

1. **Visual test:** Click each color, verify node updates with correct hex
2. **Bloom test:** Verify all 7 colors bloom nicely (not too bright/dim)
3. **Legacy test:** Load an old diagram with cyan/magenta nodes — should still work
4. **Coordination test:** Create a Lambda node, set to orange — should match icon

## Out of Scope

- Auto-color based on service type
- Custom hex input field
- Color categories/grouping in picker UI
- Saving color presets

---

**Ready for handoff to Claude Code** — Once approved, use `/generate-prp` to create the implementation plan.
