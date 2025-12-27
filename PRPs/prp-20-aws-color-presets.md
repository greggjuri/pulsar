# PRP-20: AWS-Aligned Node Color Presets

## Overview
- **Source:** INITIAL/initial-20-aws-color-presets.md
- **Summary:** Replace current color presets with AWS category-aligned colors for visual consistency with AWS service icons
- **Complexity:** Low
- **Estimated Changes:** 1 file

## Background

With the addition of official AWS service icons (PRP-18), there's a visual disconnect when node colors don't match their icon colors. The current color presets include Cyan, Orange, Magenta, Blue, Green, and White. This PRP updates them to match official AWS Architecture Icon category colors, making it easy for users to create color-coordinated diagrams.

## Requirements

### Functional Requirements
1. **FR-1:** Color picker shows 7 AWS-aligned colors in order: Orange, Green, Blue, Purple, Pink, Red, Cyan
2. **FR-2:** All colors match official AWS Architecture Icon hex values
3. **FR-3:** Tooltips show AWS category and example services on hover
4. **FR-4:** Existing diagrams with old colors continue to display correctly (backward compatible)

### Non-Functional Requirements
1. **NFR-1:** Colors defined in a single constant for maintainability

## Implementation Plan

### Step 1: Update COLOR_PRESETS array
**File:** `src/components/hud/NodeInfoPanel.jsx`

Replace the current `COLOR_PRESETS` array with AWS-aligned colors:

```javascript
const COLOR_PRESETS = [
  { name: 'Compute (Lambda, EC2, ECS)', value: '#FF9900' },
  { name: 'Storage (S3, EFS, EBS)', value: '#7AA116' },
  { name: 'Database (DynamoDB, RDS, Aurora)', value: '#527FFF' },
  { name: 'Networking (API Gateway, CloudFront, VPC)', value: '#8C4FFF' },
  { name: 'Integration (SQS, SNS, EventBridge)', value: '#E7157B' },
  { name: 'Security (Cognito, IAM, WAF)', value: '#DD344C' },
  { name: 'Generic / Custom', value: '#00FFFF' },
];
```

**Changes:**
- Replace 6 colors with 7 AWS-aligned colors
- Update `name` field to include AWS category and example services (used for tooltips)
- Use official AWS hex values (uppercase for consistency)

### Step 2: Verify existing tooltip implementation
**File:** `src/components/hud/NodeInfoPanel.jsx`

The current implementation already uses `title={name}` on color buttons:
```jsx
<button
  key={value}
  onClick={() => handleColorSelect(value)}
  title={name}  // Already shows tooltip on hover
  ...
/>
```

No changes needed - the expanded `name` field will automatically appear in tooltips.

## Acceptance Criteria

- [ ] Color picker shows 7 colors in order: Orange, Green, Blue, Purple, Pink, Red, Cyan
- [ ] All colors match official AWS hex values:
  - Orange: `#FF9900`
  - Green: `#7AA116`
  - Blue: `#527FFF`
  - Purple: `#8C4FFF`
  - Pink: `#E7157B`
  - Red: `#DD344C`
  - Cyan: `#00FFFF`
- [ ] Hovering over each color shows AWS category tooltip
- [ ] Selecting each color updates the node correctly
- [ ] Node glow/bloom looks good with all new colors
- [ ] Existing diagrams with old colors (Magenta `#ff4f8b`, old Blue `#3b48cc`, old Green `#00ff88`, White `#ffffff`) still display correctly

## Testing Strategy

1. **Visual test:** Click each color, verify node updates with correct hex
2. **Tooltip test:** Hover over each swatch, verify AWS category appears
3. **Bloom test:** Verify all 7 colors bloom nicely in the 3D scene
4. **Legacy test:** If you have a saved diagram with old colors (magenta, white), verify they still render

## Files Changed

| File | Change |
|------|--------|
| `src/components/hud/NodeInfoPanel.jsx` | Update COLOR_PRESETS array with 7 AWS-aligned colors |

## Out of Scope

- Auto-color based on service type
- Custom hex input field
- Color categories/grouping in picker UI
- Saving custom color presets
