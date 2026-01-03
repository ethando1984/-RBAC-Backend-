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

-- Seed Media Assets
INSERT INTO media_assets (id, type, filename, mime_type, url, created_by_user_id) VALUES
('f1111111-1111-1111-1111-111111111111', 'IMAGE', 'tech-city.jpg', 'image/jpeg', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'admin-001'),
('f2222222-2222-2222-2222-222222222222', 'IMAGE', 'ai-brain.jpg', 'image/jpeg', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80', 'admin-001'),
('f3333333-3333-3333-3333-333333333333', 'IMAGE', 'finance-chart.jpg', 'image/jpeg', 'https://images.unsplash.com/photo-1611974715853-26d30574295a?auto=format&fit=crop&w=1200&q=80', 'admin-001'),
('f4444444-4444-4444-4444-444444444444', 'IMAGE', 'marketing-strategy.jpg', 'image/jpeg', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'admin-001');

-- Seed Articles
INSERT INTO articles (id, title, slug, excerpt, content_html, status, cover_media_id, published_at, created_by_user_id, created_by_email) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hyperion Launch Day', 'hyperion-launch-day', 'Welcome to the future of content management with Hyperion.', '<p>Today marks the official launch of Hyperion, a next-generation content intelligence platform. Designed for scale and precision, Hyperion combines robust RBAC with a dynamic layout engine.</p><p>Explore our new features including real-time workflow tracking and AI-driven content suggestions.</p>', 'PUBLISHED', 'f1111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, 'admin-001', 'admin@hyperion.com'),
('00000001-aaaa-bbbb-cccc-000000000001', 'The Rise of Quantum Computing', 'rise-of-quantum-computing', 'Exploring how quantum processors are set to revolutionize every industry from pharma to finance.', '<p>Quantum computing is no longer just a theoretical concept. With recent breakthroughs in qubit stability, we are entering the era of quantum advantage.</p><p>Companies are now competing to build the first commercially viable quantum cloud services, promising to solve optimization problems that would take classical computers millennia.</p>', 'PUBLISHED', 'f1111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP - INTERVAL '1' DAY, 'admin-001', 'admin@hyperion.com'),
('00000002-aaaa-bbbb-cccc-000000000002', 'Generative AI: The New Frontier', 'generative-ai-new-frontier', 'How LLMs and diffusion models are reshaping the creative landscape and software engineering.', '<p>Generative models have taken the world by storm, moving from simple text generation to complex video and code synthesis.</p><p>This article dives deep into the ethics and efficiency gains of integrating AI into the daily workflow of modern enterprises.</p>', 'PUBLISHED', 'f2222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '2' DAY, 'editor-001', 'editor@hyperion.com'),
('00000003-aaaa-bbbb-cccc-000000000003', 'Global Markets in 2026', 'global-markets-2026', 'An analysis of shift in global trade patterns and the impact of decentralized finance.', '<p>The financial landscape of 2026 is defined by the convergence of traditional banking and blockchain technology.</p><p>We examine how emerging economies are leveraging DeFi to bypass traditional hurdles, creating a more inclusive global market.</p>', 'PUBLISHED', 'f3333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP - INTERVAL '3' DAY, 'admin-001', 'admin@hyperion.com'),
('00000004-aaaa-bbbb-cccc-000000000004', 'The Evolution of Digital Marketing', 'evolution-digital-marketing', 'Moving beyond cookies: how privacy-first tracking is changing how brands connect with users.', '<p>Digital marketing is undergoing its biggest shift in a decade. With the final phase-out of third-party cookies, brands are turning to first-party data and context-aware advertising.</p>', 'PUBLISHED', 'f4444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP - INTERVAL '5' DAY, 'editor-001', 'editor@hyperion.com'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft Article about AI', 'draft-article-ai', 'A working draft on the future of artificial intelligence in editorial workflows.', '<p>Content for drafting...</p>', 'DRAFT', 'f2222222-2222-2222-2222-222222222222', NULL, 'editor-001', 'editor@hyperion.com');

-- Seed Article Categories
INSERT INTO article_categories (article_id, category_id, is_primary) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', true),
('00000001-aaaa-bbbb-cccc-000000000001', '44444444-4444-4444-4444-444444444444', true),
('00000001-aaaa-bbbb-cccc-000000000001', '77777777-7777-7777-7777-777777777777', false),
('00000002-aaaa-bbbb-cccc-000000000002', '55555555-5555-5555-5555-555555555555', true),
('00000003-aaaa-bbbb-cccc-000000000003', '88888888-8888-8888-8888-888888888888', true),
('00000004-aaaa-bbbb-cccc-000000000004', '99999999-9999-9999-9999-999999999999', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', true);

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
('00000001-aaaa-bbbb-cccc-000000000001', 'e1111111-1111-1111-1111-111111111111'),
('00000001-aaaa-bbbb-cccc-000000000001', 'e3333333-3333-3333-3333-333333333333'),
('00000002-aaaa-bbbb-cccc-000000000002', 'e1111111-1111-1111-1111-111111111111'),
('00000003-aaaa-bbbb-cccc-000000000003', 'e2222222-2222-2222-2222-222222222222'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'e1111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'e3333333-3333-3333-3333-333333333333');


-- Seed Layouts
INSERT INTO layouts (id, name, type, config_json, is_default, is_active, created_by_user_id) VALUES
('91111111-1111-1111-1111-111111111111', 'Default Homepage', 'HOMEPAGE', '{"widgets": [{"type": "hero", "props": {"badge": "Intelligence Platform", "title": "Future of <br /> <span class=\"text-indigo-gradient italic\">Publishing</span>", "description": "Hyperion is a next-generation content engine delivering deep insights at the speed of thought."}}, {"type": "staff-picks", "props": {"title": "Staff Picks"}}, {"type": "topics", "props": {"title": "Recommended Topics"}}, {"type": "feed", "props": {"title": "Latest Stories"}}]}', true, true, 'admin-001');
