# Category Layout Configuration Guide

## Overview
The category display page now supports dynamic layout configuration through the `positionConfigJson` field. This allows you to customize how articles are displayed for each category.

## Configuration Options

### Layout Modes

#### 1. **Grid View** (`mode: "grid"`)
- Displays articles in a responsive grid
- 1 column on mobile, 2 on tablet, 3 on desktop
- Equal-height cards
- Best for: Categories with consistent content types

#### 2. **List View** (`mode: "list"`)
- Displays articles in a vertical list
- Full-width cards
- Emphasizes reading order
- Best for: News, chronological content, featured articles

#### 3. **Masonry View** (`mode: "masonry"`)
- Pinterest-style column layout
- Variable height cards
- Optimizes vertical space
- Best for: Mixed content types, visual-heavy categories

### Sidebar Positions

- **None** (`sidebar: "none"`) - Full-width content, no sidebar
- **Left** (`sidebar: "left"`) - Sidebar on the left, content on the right
- **Right** (`sidebar: "right"`) - Sidebar on the right, content on the left (default)

### Display Options

- **Show Hero** (`showHero: true/false`) - Display category header with title and description
- **Items Per Page** (`itemsPerPage: number`) - Number of articles to display (default: 12)

## Configuration Examples

### Example 1: Business Category (Masonry with Right Sidebar)
```json
{
  "mode": "masonry",
  "sidebar": "right",
  "showHero": true,
  "itemsPerPage": 12
}
```

### Example 2: News Category (List View, No Sidebar)
```json
{
  "mode": "list",
  "sidebar": "none",
  "showHero": true,
  "itemsPerPage": 20
}
```

### Example 3: Gallery Category (Grid View, Left Sidebar)
```json
{
  "mode": "grid",
  "sidebar": "left",
  "showHero": false,
  "itemsPerPage": 15
}
```

### Example 4: Featured Category (Masonry, No Sidebar, No Hero)
```json
{
  "mode": "masonry",
  "sidebar": "none",
  "showHero": false,
  "itemsPerPage": 9
}
```

## How to Set Configuration

### Via Admin UI (if available)
1. Navigate to Categories
2. Edit the category
3. Go to the "Layout" tab
4. Select your preferred options
5. The JSON is automatically generated

### Via API
```bash
curl -X PUT http://localhost:8081/api/categories/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business",
    "slug": "business",
    "positionConfigJson": "{\"mode\":\"masonry\",\"sidebar\":\"right\",\"showHero\":true,\"itemsPerPage\":12}"
  }'
```

### Via Database
```sql
UPDATE categories 
SET position_config_json = '{"mode":"masonry","sidebar":"right","showHero":true,"itemsPerPage":12}'
WHERE slug = 'business';
```

## Default Configuration

If no `positionConfigJson` is set, the following defaults are used:

```json
{
  "mode": "masonry",
  "sidebar": "right",
  "showHero": true,
  "itemsPerPage": 12
}
```

## Layout Behavior

### Grid View
```
┌─────────┬─────────┬─────────┐
│ Article │ Article │ Article │
│    1    │    2    │    3    │
├─────────┼─────────┼─────────┤
│ Article │ Article │ Article │
│    4    │    5    │    6    │
└─────────┴─────────┴─────────┘
```

### List View
```
┌─────────────────────────────┐
│        Article 1            │
├─────────────────────────────┤
│        Article 2            │
├─────────────────────────────┤
│        Article 3            │
└─────────────────────────────┘
```

### Masonry View
```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │
│     ├─────┤     │
│     │  4  ├─────┤
├─────┤     │  5  │
│  6  │     │     │
└─────┴─────┴─────┘
```

## Sidebar Content

The sidebar displays:
1. **About Section** - Category description
2. **Quick Stats** - Article count and layout mode

The sidebar is sticky and follows the user as they scroll.

## Responsive Behavior

### Mobile (< 768px)
- All layouts collapse to single column
- Sidebar moves below content
- Hero section is always shown (if enabled)

### Tablet (768px - 1024px)
- Grid: 2 columns
- Masonry: 2 columns
- List: Full width
- Sidebar hidden

### Desktop (> 1024px)
- Grid: 3 columns
- Masonry: 3 columns
- List: Full width
- Sidebar shown (if configured)

## Performance Considerations

1. **Masonry Layout** - Uses CSS columns, very performant
2. **Grid Layout** - Uses CSS Grid, excellent performance
3. **List Layout** - Uses Flexbox, best performance

All layouts are server-side rendered for optimal SEO and initial load time.

## SEO Impact

- All layout modes are SEO-friendly
- Content order is preserved in HTML
- Semantic HTML structure maintained
- No JavaScript required for layout

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- ARIA labels on interactive elements
- Proper heading hierarchy

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox required
- CSS Columns for masonry layout
- Graceful degradation to single column on older browsers

## Troubleshooting

### Layout not applying
1. Check `positionConfigJson` is valid JSON
2. Verify field is being returned by API
3. Check browser console for parsing errors

### Sidebar not showing
1. Ensure `sidebar` is not set to `"none"`
2. Check viewport width (sidebar hidden on mobile/tablet)
3. Verify CSS classes are loading

### Articles not displaying
1. Check if articles exist for category
2. Verify `itemsPerPage` is not set too low
3. Check API response in network tab

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
