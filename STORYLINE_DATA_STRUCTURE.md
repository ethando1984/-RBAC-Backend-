# Storyline Data Structure - Clarification

## Issue Identified

Based on the screenshot, the `contentsJson` field is currently storing article metadata (list of article IDs and types), but it should store the **storyline's own narrative content**.

## Correct Data Structure

### Storyline Fields:

```
┌─────────────────────────────────────────────────────────┐
│ Storyline                                               │
├─────────────────────────────────────────────────────────┤
│ title           → "Xu hướng đầu tư năm 2026"           │
│ slug            → "xu-huong-dau-tu-nam-2026"           │
│ description     → "Chọn vàng, chứng khoán..."          │
│                   (Short summary for list page)         │
│                                                         │
│ contentsJson    → Rich HTML/JSON content               │
│                   (Storyline introduction/overview)     │
│                   NOT article list!                     │
│                                                         │
│ articles        → List<Article>                        │
│                   (Related articles in timeline)        │
└─────────────────────────────────────────────────────────┘
```

## What Should Be in `contentsJson`

The `contentsJson` field should contain the **storyline's narrative introduction**, like:

### Example 1: HTML Content
```html
<p>Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, bước sang 2026, bài toán của nhà đầu tư không chỉ là "chọn kênh nào" mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.</p>

<img src="/images/investment-2026.jpg" alt="Investment landscape" class="w-full rounded-2xl my-8" />

<h2>Các kênh đầu tư chính</h2>
<ul>
  <li>Vàng - Kênh trú ẩn an toàn</li>
  <li>Chứng khoán - Tiềm năng tăng trưởng</li>
  <li>Bất động sản - Đầu tư dài hạn</li>
</ul>
```

### Example 2: Editor.js JSON Format
```json
{
  "blocks": [
    {
      "type": "paragraph",
      "data": {
        "text": "Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh..."
      }
    },
    {
      "type": "image",
      "data": {
        "url": "/images/investment-2026.jpg",
        "caption": "Xu hướng đầu tư 2026"
      }
    },
    {
      "type": "header",
      "data": {
        "text": "Các kênh đầu tư chính",
        "level": 2
      }
    }
  ]
}
```

## What's Currently Wrong

Your screenshot shows `contentsJson` contains:
```json
[
  {
    "id": "d47fa674-4ca4-472a-9e91-19a8f7d23d5a",
    "type": "text",
    "content": "Sau một năm 2025...",
    "settings": {}
  },
  {
    "id": "82ee9ecd-2657-4272-add4-4509ea8e2f2b",
    "type": "image",
    "content": "7ede7d62-2a7a-3683-bbae-6dab77d2f5a8",
    "settings": {
      "url": "/uploads/d744e9e6-duong-sat-png",
      "filename": "d744e9e6-duong-sat.png"
    }
  }
]
```

This looks like it's storing individual content blocks with IDs, which is fine, but it should be the **storyline's introduction**, not a list of articles.

## Recommended Approach

### Option 1: Store as HTML (Simplest)

Update your storyline to store HTML directly:

```sql
UPDATE storylines 
SET contents_json = '
<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, 
    bước sang 2026, bài toán của nhà đầu tư không chỉ là "chọn kênh nào" 
    mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, 
    đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.
  </p>
  
  <img 
    src="/uploads/d744e9e6-duong-sat.png" 
    alt="Investment trends" 
    class="w-full rounded-2xl my-8"
  />
  
  <h2 class="text-2xl font-bold mt-8 mb-4">
    Năm 2025 khép lại với nhiều biến động
  </h2>
  
  <p class="text-lg leading-relaxed">
    Trong năm trường hợp tài sản đầu tư...
  </p>
</div>'
WHERE slug = 'xu-huong-dau-tu-nam-2026';
```

### Option 2: Convert Current Structure

If you want to keep your current block structure, convert it to Editor.js format:

```json
{
  "blocks": [
    {
      "type": "paragraph",
      "data": {
        "text": "Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh..."
      }
    },
    {
      "type": "image",
      "data": {
        "url": "/uploads/d744e9e6-duong-sat.png",
        "caption": "Xu hướng đầu tư 2026"
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "Năm 2025 khép lại với nhiều biến động..."
      }
    }
  ]
}
```

## How Articles Relate to Storylines

Articles should be linked via the `storyline_articles` junction table:

```sql
-- Link articles to storyline
INSERT INTO storyline_articles (article_id, storyline_id, sort_order)
VALUES 
  ('article-uuid-1', 'storyline-uuid', 0),
  ('article-uuid-2', 'storyline-uuid', 1),
  ('article-uuid-3', 'storyline-uuid', 2);
```

The backend will then populate the `articles` field when fetching the storyline.

## Frontend Display Logic

### List Page (`/storylines`)
- Shows: title, description, metadata
- Does NOT show: full content

### Detail Page (`/storylines/[slug]`)
- Shows: title, description
- **Renders `contentsJson`** as HTML/blocks
- Shows: timeline of related articles

## Summary

**Current Issue**: `contentsJson` contains article metadata
**Should Contain**: Storyline's own narrative/introduction content
**Articles**: Should be in separate `articles` field (populated from junction table)

---

**Action Required**: Update the `contentsJson` field to contain the storyline's introduction content, not article references.
