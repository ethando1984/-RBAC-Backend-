# Vietnamese Unicode - Quick Reference

## 🚀 Quick Start

### Test Slug Conversion
```java
SlugService slugService = new SlugService(...);
String slug = slugService.toAsciiSlug("Cà phê sữa đá");
// Result: "ca-phe-sua-da"
```

### Create Article with Vietnamese Title
```bash
curl -X POST http://localhost:8081/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cà phê sữa đá - Hương vị Việt Nam",
    "contentHtml": "<p>Nội dung bài viết...</p>"
  }'
```

### Access Article (Public)
```bash
curl http://localhost:8089/public/articles/ca-phe-sua-da-huong-vi-viet-nam
```

## 📝 Common Vietnamese Characters

### Vowels with Diacritics
| Character | ASCII | Example Input | Example Output |
|-----------|-------|---------------|----------------|
| à á ả ã ạ | a | Hà Nội | ha-noi |
| è é ẻ ẽ ẹ | e | Tết | tet |
| ò ó ỏ õ ọ | o | Phở | pho |
| ù ú ủ ũ ụ | u | Hủ tiếu | hu-tieu |
| ì í ỉ ĩ ị | i | Mì | mi |
| ỳ ý ỷ ỹ ỵ | y | Mỹ | my |
| â ă | a | Cầu | cau |
| ê | e | Kê | ke |
| ô ơ | o | Cơm | com |
| ư | u | Ướt | uot |

### Special Character
| Character | ASCII | Example Input | Example Output |
|-----------|-------|---------------|----------------|
| đ Đ | d D | Đà Nẵng | da-nang |

## 🔧 Common Operations

### 1. Create with Auto-Slug
```java
Article article = new Article();
article.setTitle("Cà phê sữa đá");
// Slug auto-generated: "ca-phe-sua-da"
```

### 2. Create with Manual Slug
```java
Article article = new Article();
article.setTitle("Cà phê sữa đá");
article.setSlug("ca-phe-sua-da-dac-biet");
// Uses provided slug (still normalized to ASCII)
```

### 3. Update Title (Auto-Update Slug)
```java
existing.setTitle("Cà phê sữa đá mới nhất");
// Old slug: "ca-phe-sua-da"
// New slug: "ca-phe-sua-da-moi-nhat"
// Redirect created automatically
```

### 4. Check for Redirects
```sql
SELECT * FROM slug_redirects 
WHERE old_slug = 'ca-phe-sua-da';
```

## 🧪 Testing

### Run Slug Tests
```bash
cd Hyperion-backend
mvn test -Dtest=SlugServiceTest
```

### Test Specific Case
```bash
mvn test -Dtest=SlugServiceTest#testCoffeeExample
```

## 🌐 Frontend Usage

### TypeScript Type
```typescript
interface Article {
  title: string;           // "Cà phê sữa đá"
  slug: string;            // "ca-phe-sua-da"
  redirectTo?: string;     // "ca-phe-sua-da-moi-nhat" (if old slug)
  canonicalSlug?: string;  // "ca-phe-sua-da-moi-nhat"
}
```

### Fetch Article
```typescript
const article = await PublicApi.getArticle('ca-phe-sua-da');
// Automatically follows 301 redirects
```

### Set Canonical URL
```tsx
<head>
  <link rel="canonical" href={`/articles/${article.canonicalSlug || article.slug}`} />
</head>
```

## 🔍 Debugging

### Check Slug Generation
```java
String input = "Tiếng Việt";
String slug = slugService.toAsciiSlug(input);
System.out.println(slug); // "tieng-viet"
```

### Check Uniqueness
```java
String baseSlug = "ca-phe";
String uniqueSlug = slugService.ensureUniqueSlug("ARTICLE", baseSlug, articleId);
// Returns "ca-phe" or "ca-phe-2" if duplicate exists
```

### Check Redirects
```java
SlugRedirect redirect = slugRedirectMapper.findByOldSlug("old-slug", "ARTICLE");
if (redirect != null) {
    System.out.println("Redirects to: " + redirect.getNewSlug());
}
```

## 📊 Database Queries

### Find All Redirects for Entity
```sql
SELECT * FROM slug_redirects 
WHERE entity_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC;
```

### Find Redirect Chain
```sql
WITH RECURSIVE redirect_chain AS (
  SELECT old_slug, new_slug, 1 as depth
  FROM slug_redirects
  WHERE old_slug = 'original-slug'
  
  UNION ALL
  
  SELECT sr.old_slug, sr.new_slug, rc.depth + 1
  FROM slug_redirects sr
  JOIN redirect_chain rc ON sr.old_slug = rc.new_slug
  WHERE rc.depth < 10
)
SELECT * FROM redirect_chain;
```

### Clean Up Old Redirects (Optional)
```sql
-- Delete redirects older than 1 year
DELETE FROM slug_redirects 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## ⚠️ Common Issues

### Issue: Slug not converting
**Solution**: Check if input contains Vietnamese characters
```java
String input = "Test"; // No Vietnamese chars
String slug = slugService.toAsciiSlug(input); // Returns "test"
```

### Issue: Duplicate slug error
**Solution**: Use `ensureUniqueSlug` instead of `toAsciiSlug`
```java
String baseSlug = slugService.toAsciiSlug(title);
String uniqueSlug = slugService.ensureUniqueSlug("ARTICLE", baseSlug, articleId);
```

### Issue: Redirect not working
**Solution**: Check if redirect exists in database
```sql
SELECT * FROM slug_redirects WHERE old_slug = 'your-old-slug';
```

## 📈 Performance Tips

1. **Index old_slug column** (already done in schema)
2. **Cache slug lookups** at gateway level
3. **Limit redirect chain depth** (prevent infinite loops)
4. **Clean up old redirects** periodically

## 🎯 Best Practices

1. **Always use SlugService** - Don't manually create slugs
2. **Let system generate slugs** - Only override when necessary
3. **Test with real Vietnamese content** - Use actual article titles
4. **Monitor redirect usage** - Track which old slugs are accessed
5. **Set canonical URLs** - Always include in page metadata

## 📚 Resources

- **Full Documentation**: `VIETNAMESE_UNICODE_IMPLEMENTATION.md`
- **Implementation Summary**: `VIETNAMESE_IMPLEMENTATION_SUMMARY.md`
- **Test Suite**: `SlugServiceTest.java`
- **Database Schema**: `schema.sql`

---

**Quick Help**: For issues, check the full documentation or run the test suite.
