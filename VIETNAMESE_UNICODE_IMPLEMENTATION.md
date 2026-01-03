# Vietnamese Unicode Support Implementation

## Overview
This document describes the complete implementation of Vietnamese Unicode (UTF-8) support with ASCII-safe slugs across the Hyperion CMS platform.

## Implementation Summary

### ✅ Backend (Hyperion CMS Core)

#### 1. Database Schema
- **File**: `src/main/resources/db/schema.sql`
- **Changes**:
  - Added `slug_redirects` table for tracking slug changes
  - All text fields support UTF-8 (VARCHAR/TEXT)
  - H2 database configured with PostgreSQL mode (UTF-8 by default)

#### 2. Slug Service
- **File**: `src/main/java/com/hyperion/cms/service/SlugService.java`
- **Features**:
  - Vietnamese diacritics → ASCII conversion
  - Special handling for đ/Đ → d/D
  - Unicode normalization (NFD)
  - Slug length limit (120 characters)
  - Uniqueness enforcement with suffix (-2, -3, etc.)
  - Redirect tracking on slug changes

#### 3. Models Updated
- `Article.java` - Added `redirectTo` field
- `Category.java` - Added `redirectTo` field
- `Tag.java` - Added `redirectTo` field
- `Storyline.java` - Added `redirectTo` field
- `SlugRedirect.java` - New model for tracking redirects

#### 4. Controllers Updated
All controllers now use `SlugService` for slug generation:
- `ArticleController.java`
- `CategoryController.java`
- `TagController.java`
- `StorylineController.java`

#### 5. Internal Public API
- **File**: `InternalPublicController.java`
- **Features**:
  - Checks for slug redirects on all entity lookups
  - Returns `redirectTo` field when old slug is used
  - Supports redirect chains

### ✅ Gateway (Hyperion Public Gateway)

#### 1. DTOs Updated
All DTOs include redirect fields:
- `ArticleDto.java` - Added `redirectTo`, `canonicalSlug`
- `CategoryDto.java` - Added `redirectTo`, `canonicalSlug`
- `TagDto.java` - Added `redirectTo`, `canonicalSlug`
- `StorylineDto.java` - Added `redirectTo`, `canonicalSlug`

#### 2. Public Controller
- **File**: `PublicController.java`
- **Features**:
  - Returns HTTP 301 (Moved Permanently) for old slugs
  - Sets `Location` header to new canonical URL
  - Preserves cache headers

### ✅ Frontend (Next.js Public Frontend)

#### 1. TypeScript Types
- **File**: `src/lib/types.ts`
- **Changes**: Added `redirectTo` and `canonicalSlug` to all entity interfaces

#### 2. API Client
- **File**: `src/lib/api.ts`
- Ready to handle 301 redirects (Next.js fetch follows redirects automatically)

## Vietnamese Slug Conversion Examples

| Vietnamese Title | Generated Slug |
|-----------------|----------------|
| Tiếng Việt có dấu: Đặc biệt! | `tieng-viet-co-dau-dac-biet` |
| Cà phê sữa đá | `ca-phe-sua-da` |
| Tết 2026: Xu hướng | `tet-2026-xu-huong` |
| Thành phố Hồ Chí Minh | `thanh-pho-ho-chi-minh` |
| Đà Nẵng | `da-nang` |
| Phở bò | `pho-bo` |
| Bánh mì | `banh-mi` |

## Slug Generation Rules

1. **Unicode Normalization**: NFD (Canonical Decomposition)
2. **Diacritic Removal**: Strip all combining marks
3. **Special Characters**: đ/Đ → d/D (before normalization)
4. **Case**: Convert to lowercase
5. **Non-alphanumeric**: Replace with hyphens
6. **Multiple hyphens**: Collapse to single hyphen
7. **Edge hyphens**: Remove leading/trailing hyphens
8. **Length**: Maximum 120 characters
9. **Uniqueness**: Append suffix if duplicate (-2, -3, etc.)

## Redirect Flow

### When a slug changes:

1. **Backend** (ArticleController, etc.):
   ```java
   if (!existing.getSlug().equals(oldSlug)) {
       slugService.handleSlugChange("ARTICLE", id, oldSlug, newSlug);
   }
   ```

2. **Database** (slug_redirects table):
   ```sql
   INSERT INTO slug_redirects (id, entity_type, entity_id, old_slug, new_slug, created_at)
   VALUES (uuid, 'ARTICLE', article_id, 'old-slug', 'new-slug', now());
   ```

3. **Internal API** (InternalPublicController):
   ```java
   Article article = articleMapper.findBySlug(slug);
   if (article == null) {
       SlugRedirect redirect = slugRedirectMapper.findByOldSlug(slug, "ARTICLE");
       if (redirect != null) {
           article.setRedirectTo(redirect.getNewSlug());
           return article;
       }
   }
   ```

4. **Gateway** (PublicController):
   ```java
   ArticleDto article = publicApiService.getArticle(slug);
   if (article != null && article.getRedirectTo() != null) {
       return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
           .header(HttpHeaders.LOCATION, "/public/articles/" + article.getRedirectTo())
           .build();
   }
   ```

5. **Frontend**: Next.js automatically follows 301 redirects

## Testing

### Unit Tests
- **File**: `src/test/java/com/hyperion/cms/service/SlugServiceTest.java`
- **Coverage**: 24 test cases covering:
  - Basic Vietnamese conversion
  - All Vietnamese vowel accents (à, á, ả, ã, ạ, â, ă, etc.)
  - Special character đ/Đ
  - Numbers preservation
  - Special character removal
  - Edge cases (empty, null, long titles)
  - Vietnamese cities and food names
  - Mixed Vietnamese-English

### Manual Testing Scenarios

1. **Create Article with Vietnamese Title**:
   ```
   Title: "Cà phê sữa đá - Hương vị Việt Nam"
   Expected Slug: "ca-phe-sua-da-huong-vi-viet-nam"
   ```

2. **Update Article Title**:
   ```
   Old: "Tin tức" → slug: "tin-tuc"
   New: "Tin tức mới nhất" → slug: "tin-tuc-moi-nhat"
   Redirect: "tin-tuc" → "tin-tuc-moi-nhat"
   ```

3. **Access Old Slug**:
   ```
   GET /public/articles/tin-tuc
   Response: 301 Moved Permanently
   Location: /public/articles/tin-tuc-moi-nhat
   ```

## Database Configuration

### H2 (Development)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:hyperion;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL
```
- H2 in PostgreSQL mode supports UTF-8 by default

### PostgreSQL (Production)
```sql
CREATE DATABASE hyperion
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';
```

## API Response Format

### Article with Canonical Slug
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Cà phê sữa đá",
  "slug": "ca-phe-sua-da",
  "canonicalSlug": "ca-phe-sua-da",
  "contentHtml": "<p>Nội dung bài viết...</p>",
  "redirectTo": null
}
```

### Article with Redirect (Old Slug)
```json
{
  "redirectTo": "ca-phe-sua-da-moi-nhat"
}
```

## SEO Considerations

1. **Canonical URLs**: Always set in `<head>`:
   ```html
   <link rel="canonical" href="https://example.com/articles/ca-phe-sua-da" />
   ```

2. **301 Redirects**: Search engines transfer page rank to new URL

3. **Slug Stability**: Only update slugs when necessary (title changes significantly)

4. **Vietnamese Content**: Fully supported in title, meta description, and content

## Future Enhancements

1. **Diacritic-Insensitive Search**:
   - PostgreSQL `unaccent` extension (commented in schema.sql)
   - Store normalized search field alongside original

2. **Slug History UI**:
   - Admin panel to view all redirects for an entity
   - Ability to manually manage redirects

3. **Slug Customization**:
   - Allow manual slug override in admin UI
   - Validation to ensure ASCII-only input

4. **Analytics**:
   - Track redirect usage
   - Identify frequently accessed old slugs

## Migration Guide

### Existing Content
If you have existing content with non-ASCII slugs:

1. Run migration script to regenerate all slugs:
   ```sql
   -- This would be a custom migration
   UPDATE articles SET slug = generate_ascii_slug(title);
   ```

2. Create redirects for all changed slugs:
   ```sql
   INSERT INTO slug_redirects (id, entity_type, entity_id, old_slug, new_slug, created_at)
   SELECT gen_random_uuid(), 'ARTICLE', id, old_slug, new_slug, now()
   FROM articles_slug_changes;
   ```

## Troubleshooting

### Issue: Slugs not converting correctly
- Check `SlugService.toAsciiSlug()` implementation
- Verify Unicode normalization (NFD vs NFKD)
- Test with `SlugServiceTest`

### Issue: Redirects not working
- Check `slug_redirects` table has correct data
- Verify `InternalPublicController` is checking redirects
- Ensure `PublicController` returns 301 status

### Issue: Frontend not following redirects
- Next.js fetch should follow redirects automatically
- Check browser network tab for 301 response
- Verify canonical URL is set in page metadata

## Compliance

- ✅ UTF-8 content storage
- ✅ ASCII-safe slugs
- ✅ Slug uniqueness
- ✅ Redirect tracking
- ✅ 301 HTTP redirects
- ✅ Canonical URL support
- ✅ Vietnamese diacritic conversion
- ✅ SEO-friendly URLs
- ✅ Comprehensive test coverage

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
