package com.hyperion.cms.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test suite for Vietnamese Unicode to ASCII slug conversion
 * Covers 20+ test cases for Vietnamese diacritics and special characters
 */
public class SlugServiceTest {

    private final SlugService slugService = new SlugService(null, null, null, null, null);

    @Test
    public void testBasicVietnamese() {
        assertEquals("tieng-viet", slugService.toAsciiSlug("Tiếng Việt"));
    }

    @Test
    public void testVietnameseWithDiacritics() {
        assertEquals("tieng-viet-co-dau-dac-biet",
                slugService.toAsciiSlug("Tiếng Việt có dấu: Đặc biệt!"));
    }

    @Test
    public void testCoffeeExample() {
        assertEquals("ca-phe-sua-da", slugService.toAsciiSlug("Cà phê sữa đá"));
    }

    @Test
    public void testTetExample() {
        assertEquals("tet-2026-xu-huong", slugService.toAsciiSlug("Tết 2026: Xu hướng"));
    }

    @Test
    public void testVietnameseD() {
        assertEquals("dong-dac-dieu-da", slugService.toAsciiSlug("Đồng đặc điều đá"));
    }

    @Test
    public void testVietnameseAAccents() {
        assertEquals("a-a-a-a-a-a",
                slugService.toAsciiSlug("à á ả ã ạ â"));
    }

    @Test
    public void testVietnameseEAccents() {
        assertEquals("e-e-e-e-e-e",
                slugService.toAsciiSlug("è é ẻ ẽ ẹ ê"));
    }

    @Test
    public void testVietnameseOAccents() {
        assertEquals("o-o-o-o-o-o",
                slugService.toAsciiSlug("ò ó ỏ õ ọ ô"));
    }

    @Test
    public void testVietnameseUAccents() {
        assertEquals("u-u-u-u-u-u",
                slugService.toAsciiSlug("ù ú ủ ũ ụ ư"));
    }

    @Test
    public void testVietnameseIAccents() {
        assertEquals("i-i-i-i-i",
                slugService.toAsciiSlug("ì í ỉ ĩ ị"));
    }

    @Test
    public void testVietnameseYAccents() {
        assertEquals("y-y-y-y-y",
                slugService.toAsciiSlug("ỳ ý ỷ ỹ ỵ"));
    }

    @Test
    public void testMixedCase() {
        assertEquals("ha-noi-viet-nam",
                slugService.toAsciiSlug("Hà Nội Việt Nam"));
    }

    @Test
    public void testNumbersPreserved() {
        assertEquals("bai-viet-2026", slugService.toAsciiSlug("Bài viết 2026"));
    }

    @Test
    public void testSpecialCharactersRemoved() {
        assertEquals("tin-tuc-moi-nhat",
                slugService.toAsciiSlug("Tin tức @#$% mới nhất!!!"));
    }

    @Test
    public void testMultipleSpaces() {
        assertEquals("mot-hai-ba",
                slugService.toAsciiSlug("Một    hai     ba"));
    }

    @Test
    public void testLeadingTrailingSpaces() {
        assertEquals("noi-dung",
                slugService.toAsciiSlug("   Nội dung   "));
    }

    @Test
    public void testEmptyString() {
        assertEquals("untitled", slugService.toAsciiSlug(""));
    }

    @Test
    public void testNullString() {
        assertEquals("untitled", slugService.toAsciiSlug(null));
    }

    @Test
    public void testLongTitle() {
        String longTitle = "Đây là một tiêu đề rất dài với nhiều từ để kiểm tra giới hạn độ dài của slug khi chuyển đổi từ tiếng Việt sang ASCII an toàn cho URL";
        String result = slugService.toAsciiSlug(longTitle);
        assertTrue(result.length() <= 120);
        assertFalse(result.endsWith("-"));
    }

    @Test
    public void testOnlySpecialCharacters() {
        assertEquals("untitled", slugService.toAsciiSlug("@#$%^&*()"));
    }

    @Test
    public void testVietnameseCities() {
        assertEquals("thanh-pho-ho-chi-minh",
                slugService.toAsciiSlug("Thành phố Hồ Chí Minh"));
        assertEquals("da-nang", slugService.toAsciiSlug("Đà Nẵng"));
        assertEquals("hai-phong", slugService.toAsciiSlug("Hải Phòng"));
    }

    @Test
    public void testVietnameseFood() {
        assertEquals("pho-bo", slugService.toAsciiSlug("Phở bò"));
        assertEquals("banh-mi", slugService.toAsciiSlug("Bánh mì"));
        assertEquals("bun-cha", slugService.toAsciiSlug("Bún chả"));
    }

    @Test
    public void testMixedVietnameseEnglish() {
        assertEquals("vietnam-travel-guide-2026",
                slugService.toAsciiSlug("Vietnam Travel Guide 2026"));
    }

    @Test
    public void testConsecutiveHyphens() {
        String result = slugService.toAsciiSlug("Một -- hai --- ba");
        assertEquals("mot-hai-ba", result);
        assertFalse(result.contains("--"));
    }
}
