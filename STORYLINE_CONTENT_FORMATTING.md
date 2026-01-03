# Storyline Content Formatting Guide

## Overview
The `contentsJson` field in storylines can store content in multiple formats. The frontend will intelligently detect and render the format.

## Supported Formats

### 1. HTML Content (Recommended for Rich Text)

Store HTML directly in the `contentsJson` field:

```json
{
  "title": "Xu hướng đầu tư năm 2026",
  "contentsJson": "<p>Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, bước sang 2026, bài toán của nhà đầu tư không chỉ là \"chọn kênh nào\" mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.</p><img src=\"/images/investment-2026.jpg\" alt=\"Investment landscape\" class=\"w-full rounded-2xl my-8\" />"
}
```

### 2. Editor.js JSON Format

For structured content with blocks:

```json
{
  "title": "Xu hướng đầu tư năm 2026",
  "contentsJson": "{\"blocks\":[{\"type\":\"paragraph\",\"data\":{\"text\":\"Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, bước sang 2026, bài toán của nhà đầu tư không chỉ là \\\"chọn kênh nào\\\" mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.\"}},{\"type\":\"header\",\"data\":{\"text\":\"Chọn vàng, chứng khoán, bất động sản hay giữ tiền trong ngân hàng?\",\"level\":2}},{\"type\":\"image\",\"data\":{\"url\":\"/images/investment-2026.jpg\",\"caption\":\"Xu hướng đầu tư 2026\"}}]}"
}
```

### 3. Simple Content Object

```json
{
  "title": "Xu hướng đầu tư năm 2026",
  "contentsJson": "{\"content\":\"<p>Your HTML content here</p>\"}"
}
```

## Example: Creating a Storyline with HTML Content

### Via API:

```bash
curl -X POST http://localhost:8081/api/storylines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Xu hướng đầu tư năm 2026",
    "slug": "xu-huong-dau-tu-nam-2026",
    "description": "Chọn vàng, chứng khoán, bất động sản hay giữ tiền trong ngân hàng?",
    "status": "ONGOING",
    "contentsJson": "<p class=\"text-lg leading-relaxed\">Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, bước sang 2026, bài toán của nhà đầu tư không chỉ là \"chọn kênh nào\" mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.</p><img src=\"https://example.com/investment-landscape.jpg\" alt=\"Investment 2026\" class=\"w-full rounded-2xl my-8\" /><h2 class=\"text-2xl font-bold mt-8 mb-4\">Các kênh đầu tư tiềm năng</h2><ul class=\"list-disc list-inside space-y-2\"><li>Vàng: Kênh trú ẩn an toàn</li><li>Chứng khoán: Cơ hội tăng trưởng</li><li>Bất động sản: Đầu tư dài hạn</li><li>Tiền gửi ngân hàng: Ổn định lãi suất</li></ul>"
  }'
```

### Via Database:

```sql
UPDATE storylines 
SET contents_json = '<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, 
    bước sang 2026, bài toán của nhà đầu tư không chỉ là "chọn kênh nào" 
    mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, 
    đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.
  </p>
  
  <img 
    src="/images/investment-2026.jpg" 
    alt="Investment landscape" 
    class="w-full rounded-2xl my-8"
  />
  
  <h2 class="text-2xl font-bold mt-8 mb-4">
    Các kênh đầu tư tiềm năng
  </h2>
  
  <ul class="list-disc list-inside space-y-2 text-white/80">
    <li>Vàng: Kênh trú ẩn an toàn</li>
    <li>Chứng khoán: Cơ hội tăng trưởng</li>
    <li>Bất động sản: Đầu tư dài hạn</li>
    <li>Tiền gửi ngân hàng: Ổn định lãi suất</li>
  </ul>
</div>'
WHERE slug = 'xu-huong-dau-tu-nam-2026';
```

## Recommended HTML Structure

For best visual results, use these Tailwind CSS classes:

```html
<div class="space-y-6">
  <!-- Paragraphs -->
  <p class="text-lg leading-relaxed text-white/80">
    Your paragraph text here with Vietnamese characters: 
    Tiếng Việt có dấu hoàn toàn được hỗ trợ.
  </p>

  <!-- Headings -->
  <h2 class="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
    Section Heading
  </h2>

  <h3 class="text-xl font-bold text-white/90 mt-6 mb-3">
    Subsection Heading
  </h3>

  <!-- Images -->
  <img 
    src="/images/your-image.jpg" 
    alt="Description" 
    class="w-full rounded-2xl my-8"
  />
  <p class="text-sm text-white/50 text-center -mt-6 mb-8">
    Image caption
  </p>

  <!-- Lists -->
  <ul class="list-disc list-inside space-y-2 text-white/80 ml-4">
    <li>List item 1</li>
    <li>List item 2</li>
    <li>List item 3</li>
  </ul>

  <!-- Ordered Lists -->
  <ol class="list-decimal list-inside space-y-2 text-white/80 ml-4">
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
  </ol>

  <!-- Blockquotes -->
  <blockquote class="border-l-4 border-indigo-500 pl-6 py-4 my-8 italic text-white/70">
    "Important quote or highlight"
  </blockquote>

  <!-- Call-to-action boxes -->
  <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 my-8">
    <h4 class="font-bold text-indigo-400 mb-2">Key Takeaway</h4>
    <p class="text-white/80">Important information highlighted</p>
  </div>
</div>
```

## Vietnamese Content Support

All Vietnamese characters are fully supported:

```html
<p>
  Tiếng Việt với đầy đủ dấu: 
  à á ả ã ạ â ầ ấ ẩ ẫ ậ ă ằ ắ ẳ ẵ ặ
  è é ẻ ẽ ẹ ê ề ế ể ễ ệ
  ì í ỉ ĩ ị
  ò ó ỏ õ ọ ô ồ ố ổ ỗ ộ ơ ờ ớ ở ỡ ợ
  ù ú ủ ũ ụ ư ừ ứ ử ữ ự
  ỳ ý ỷ ỹ ỵ
  đ Đ
</p>
```

## Content Rendering Logic

The frontend will:

1. **Try to parse as JSON** - If successful, render structured blocks
2. **Check for HTML tags** - If found, render as HTML
3. **Fallback** - Display as formatted text

## Example: Full Storyline Content

```html
<div class="space-y-8">
  <p class="text-lg leading-relaxed text-white/80">
    Sau một năm 2025 hầu hết các kênh đầu tư cùng lập đỉnh, 
    bước sang 2026, bài toán của nhà đầu tư không chỉ là "chọn kênh nào" 
    mà là phân bổ danh mục ra sao để tận dụng nhịp tăng, 
    đồng thời kiểm soát rủi ro trong bối cảnh lãi suất có dấu hiệu nhích lên.
  </p>

  <img 
    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3" 
    alt="Investment landscape with mountains" 
    class="w-full rounded-2xl shadow-2xl"
  />

  <h2 class="text-3xl font-bold text-white mt-12 mb-6">
    Chọn vàng, chứng khoán, bất động sản hay giữ tiền trong ngân hàng?
  </h2>

  <p class="text-lg leading-relaxed text-white/80">
    Đây là câu hỏi mà nhiều nhà đầu tư đang đặt ra khi bước vào năm mới. 
    Mỗi kênh đầu tư đều có những ưu điểm và rủi ro riêng.
  </p>

  <div class="grid md:grid-cols-2 gap-6 my-8">
    <div class="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-6">
      <h3 class="text-xl font-bold text-yellow-400 mb-3">💰 Vàng</h3>
      <p class="text-white/70">Kênh trú ẩn an toàn trong bối cảnh bất ổn</p>
    </div>

    <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6">
      <h3 class="text-xl font-bold text-blue-400 mb-3">📈 Chứng khoán</h3>
      <p class="text-white/70">Tiềm năng tăng trưởng cao nhưng rủi ro lớn</p>
    </div>

    <div class="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6">
      <h3 class="text-xl font-bold text-green-400 mb-3">🏠 Bất động sản</h3>
      <p class="text-white/70">Đầu tư dài hạn, thanh khoản thấp</p>
    </div>

    <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6">
      <h3 class="text-xl font-bold text-purple-400 mb-3">🏦 Tiền gửi</h3>
      <p class="text-white/70">Ổn định nhưng lợi nhuận hạn chế</p>
    </div>
  </div>

  <blockquote class="border-l-4 border-indigo-500 pl-6 py-4 my-8 italic text-white/70 text-lg">
    "Đa dạng hóa danh mục là chìa khóa để giảm thiểu rủi ro 
    và tối ưu hóa lợi nhuận trong năm 2026"
  </blockquote>
</div>
```

## Best Practices

1. **Use semantic HTML** - `<p>`, `<h2>`, `<ul>`, etc.
2. **Include Tailwind classes** - For consistent styling
3. **Optimize images** - Use appropriate sizes and formats
4. **Test Vietnamese characters** - Ensure proper UTF-8 encoding
5. **Keep it readable** - Use proper spacing and typography
6. **Mobile-friendly** - Use responsive classes (`md:`, `lg:`)

## Troubleshooting

### Content shows as JSON
- Ensure you're storing HTML, not JSON string
- Check if quotes are properly escaped

### Vietnamese characters broken
- Verify database uses UTF-8 encoding
- Check API response headers include `charset=utf-8`

### Styling not applied
- Ensure Tailwind classes are in the HTML
- Check that classes are not purged in production

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
