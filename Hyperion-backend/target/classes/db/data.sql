-- Seed Categories
INSERT INTO categories (id, parent_id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', NULL, 'News', 'news'),
('22222222-2222-2222-2222-222222222222', NULL, 'Business', 'business'),
('33333333-3333-3333-3333-333333333333', NULL, 'Sports', 'sports'),
('44444444-4444-4444-4444-444444444444', NULL, 'Technology', 'technology'),
-- Technology subcategories
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'AI', 'ai'),
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Gadgets', 'gadgets'),
('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Programming', 'programming'),
-- Business subcategories
('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Finance', 'finance'),
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'Marketing', 'marketing');

-- Seed Articles
INSERT INTO articles (id, title, slug, status, created_by_user_id, created_by_email) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hemera Launch Day', 'hemera-launch-day', 'PUBLISHED', 'admin-001', 'admin@hemera.com'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft Article about AI', 'draft-article-ai', 'DRAFT', 'editor-001', 'editor@hemera.com');

-- Seed Article Categories
INSERT INTO article_categories (article_id, category_id, is_primary) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', true);

-- Seed Crawler Sources
INSERT INTO crawler_sources (id, name, base_url, enabled) VALUES 
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TechCrunch', 'https://techcrunch.com', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'The Verge', 'https://theverge.com', true);

-- Seed Tasks
INSERT INTO tasks (id, title, description, status, priority, assigned_to_user_id, assigned_to_email, article_id, due_date, created_by_user_id, created_by_email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Review AI Article Draft', 'Need to review and provide feedback on the AI article draft', 'TODO', 'HIGH', 'editor-001', 'editor@hemera.com', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_TIMESTAMP + INTERVAL '2' DAY, 'admin-001', 'admin@hemera.com'),
('22222222-2222-2222-2222-222222222222', 'Add cover images to published articles', 'Upload and assign cover images to all published articles', 'IN_PROGRESS', 'MEDIUM', 'admin-001', 'admin@hemera.com', NULL, CURRENT_TIMESTAMP + INTERVAL '5' DAY, 'admin-001', 'admin@hemera.com'),
('33333333-3333-3333-3333-333333333333', 'SEO optimization for tech category', 'Optimize SEO metadata for all articles in technology category', 'TODO', 'MEDIUM', NULL, NULL, NULL, CURRENT_TIMESTAMP + INTERVAL '7' DAY, 'admin-001', 'admin@hemera.com'),
('44444444-4444-4444-4444-444444444444', 'Setup crawler for new sources', 'Configure and test crawlers for new content sources', 'TODO', 'URGENT', 'admin-001', 'admin@hemera.com', NULL, CURRENT_TIMESTAMP + INTERVAL '1' DAY, 'admin-001', 'admin@hemera.com'),
('55555555-5555-5555-5555-555555555555', 'Update editorial guidelines', 'Review and update the editorial style guidelines document', 'COMPLETED', 'LOW', 'editor-001', 'editor@hemera.com', NULL, NULL, 'admin-001', 'admin@hemera.com');

-- Seed Tags
INSERT INTO tags (id, name, slug, description) VALUES
('e1111111-1111-1111-1111-111111111111', 'Innovation', 'innovation', 'Forward-thinking ideas and technology'),
('e2222222-2222-2222-2222-222222222222', 'Startup', 'startup', 'New and emerging business ventures'),
('e3333333-3333-3333-3333-333333333333', 'Future', 'future', 'Predictions and trends for what is ahead');

-- Seed Article Tags
INSERT INTO article_tags (article_id, tag_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e1111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'e1111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'e3333333-3333-3333-3333-333333333333');

