CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    parent_id UUID,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    position_config_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    content_html TEXT,
    excerpt TEXT,
    cover_media_id UUID,
    source_name VARCHAR(255),
    source_url VARCHAR(1024),
    seo_title VARCHAR(255),
    seo_description TEXT,
    canonical_url VARCHAR(1024),
    robots VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- DRAFT, PENDING_EDITORIAL, etc.
    visibility VARCHAR(50) DEFAULT 'PUBLIC', -- PUBLIC, PRIVATE, PASSWORD
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_by_user_id VARCHAR(255) NOT NULL,
    created_by_email VARCHAR(255),
    author_user_id VARCHAR(255),
    author_role_id VARCHAR(255),
    updated_by_user_id VARCHAR(255),
    updated_by_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_categories (
    article_id UUID NOT NULL,
    category_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (article_id, category_id),
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS article_versions (
    id UUID PRIMARY KEY,
    article_id UUID NOT NULL,
    version_number INT NOT NULL,
    snapshot_json TEXT, -- Full JSON serialization of the article state
    diff_summary TEXT,  -- Optional summary of changes
    status_at_that_time VARCHAR(50),
    edited_by_user_id VARCHAR(255),
    edited_by_email VARCHAR(255),
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    actor_user_id VARCHAR(255),
    actor_email VARCHAR(255),
    action_type VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id VARCHAR(255),
    old_value_json TEXT,
    new_value_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(255),
    correlation_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- IMAGE, VIDEO
    filename VARCHAR(255),
    mime_type VARCHAR(255),
    size_bytes BIGINT,
    storage_key VARCHAR(1024),
    url VARCHAR(1024),
    width INT,
    height INT,
    duration_sec INT,
    thumbnail_key VARCHAR(1024),
    created_by_user_id VARCHAR(255),
    created_by_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crawler_sources (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    base_url VARCHAR(1024),
    enabled BOOLEAN DEFAULT TRUE,
    extraction_template_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crawler_jobs (
    id UUID PRIMARY KEY,
    source_id UUID,
    status VARCHAR(50), -- RUNNING, COMPLETED, FAILED
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_by_user_id VARCHAR(255),
    created_by_email VARCHAR(255),
    FOREIGN KEY (source_id) REFERENCES crawler_sources(id)
);


CREATE TABLE IF NOT EXISTS crawler_results (
    id UUID PRIMARY KEY,
    job_id UUID,
    url VARCHAR(1024),
    extracted_title VARCHAR(512),
    extracted_html TEXT,
    extracted_meta_json TEXT,
    review_status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by_user_id VARCHAR(255),
    reviewed_by_email VARCHAR(255),
    reviewed_at TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES crawler_jobs(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO', -- TODO, IN_PROGRESS, COMPLETED, CANCELLED
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    assigned_to_user_id VARCHAR(255),
    assigned_to_email VARCHAR(255),
    article_id UUID,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_by_user_id VARCHAR(255) NOT NULL,
    created_by_email VARCHAR(255),
    updated_by_user_id VARCHAR(255),
    updated_by_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE TABLE IF NOT EXISTS storylines (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ONGOING', -- ONGOING, ARCHIVED
    contents_json TEXT,
    layout_json TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_by_user_id VARCHAR(255),
    created_by_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_storylines (
    article_id UUID NOT NULL,
    storyline_id UUID NOT NULL,
    position INT DEFAULT 0,
    PRIMARY KEY (article_id, storyline_id),
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (storyline_id) REFERENCES storylines(id)
);

CREATE TABLE IF NOT EXISTS storyline_media (
    storyline_id UUID NOT NULL,
    media_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'GALLERY', -- HERO, GALLERY, ATTACHMENT
    sort_order INT DEFAULT 0,
    PRIMARY KEY (storyline_id, media_id),
    FOREIGN KEY (storyline_id) REFERENCES storylines(id),
    FOREIGN KEY (media_id) REFERENCES media_assets(id)
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_tags (
    article_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS layouts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- STANDALONE, HOMEPAGE, CATEGORY, ARTICLE, EMBED
    target_id VARCHAR(255),
    config_json TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id VARCHAR(255),
    updated_by_user_id VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS slug_redirects (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- ARTICLE, CATEGORY, STORYLINE, TAG
    entity_id UUID NOT NULL,
    old_slug VARCHAR(255) NOT NULL,
    new_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_old_slug ON slug_redirects(old_slug);

-- Enable unaccent extension for diacritic-insensitive search (if PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS unaccent;

-- ==========================================
-- ROYALTY MODULE TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS royalty_rule_sets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'INACTIVE',
    currency VARCHAR(10) DEFAULT 'VND',
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id VARCHAR(255),
    created_by_email VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id VARCHAR(255),
    updated_by_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS royalty_article_type_rates (
    id UUID PRIMARY KEY,
    rule_set_id UUID NOT NULL,
    article_type VARCHAR(50) NOT NULL,
    base_amount DECIMAL(19, 2) NOT NULL,
    FOREIGN KEY (rule_set_id) REFERENCES royalty_rule_sets(id)
);

CREATE TABLE IF NOT EXISTS royalty_multipliers (
    id UUID PRIMARY KEY,
    rule_set_id UUID NOT NULL,
    multiplier_type VARCHAR(50) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    factor DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (rule_set_id) REFERENCES royalty_rule_sets(id)
);

CREATE TABLE IF NOT EXISTS royalty_media_fees (
    id UUID PRIMARY KEY,
    rule_set_id UUID NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    fee_amount DECIMAL(19, 2) NOT NULL,
    fee_mode VARCHAR(50) NOT NULL,
    max_fee_amount DECIMAL(19, 2),
    FOREIGN KEY (rule_set_id) REFERENCES royalty_rule_sets(id)
);

CREATE TABLE IF NOT EXISTS royalty_override_policies (
    id UUID PRIMARY KEY,
    rule_set_id UUID NOT NULL,
    editor_override_max_percent DECIMAL(5, 2),
    manager_override_max_percent DECIMAL(5, 2),
    require_note_for_override BOOLEAN DEFAULT TRUE,
    allow_manual_base_rate_override BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (rule_set_id) REFERENCES royalty_rule_sets(id)
);

CREATE TABLE IF NOT EXISTS royalty_records (
    id UUID PRIMARY KEY,
    article_id UUID NOT NULL,
    article_slug VARCHAR(255),
    article_title VARCHAR(255),
    category_id UUID,
    category_name VARCHAR(255),
    article_type VARCHAR(50),
    word_count INT,
    author_id VARCHAR(255),
    author_display_name VARCHAR(255),
    author_email VARCHAR(255),
    author_type VARCHAR(50),
    author_level VARCHAR(50),
    published_at TIMESTAMP,
    status VARCHAR(50),
    calc_snapshot_json TEXT,
    base_amount DECIMAL(19, 2),
    multiplier_factor DECIMAL(5, 2),
    media_fee_total DECIMAL(19, 2),
    bonus_amount DECIMAL(19, 2),
    gross_amount DECIMAL(19, 2),
    override_amount DECIMAL(19, 2),
    final_amount DECIMAL(19, 2),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id VARCHAR(255),
    created_by_email VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id VARCHAR(255),
    updated_by_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS royalty_approval_histories (
    id UUID PRIMARY KEY,
    royalty_record_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    actor_user_id VARCHAR(255),
    actor_email VARCHAR(255),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    old_amount DECIMAL(19, 2),
    new_amount DECIMAL(19, 2),
    reason_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    correlation_id VARCHAR(255),
    ip_address VARCHAR(255),
    FOREIGN KEY (royalty_record_id) REFERENCES royalty_records(id)
);

CREATE TABLE IF NOT EXISTS royalty_payment_batches (
    id UUID PRIMARY KEY,
    month_key VARCHAR(7) NOT NULL, -- YYYY-MM
    status VARCHAR(50),
    total_items INT,
    total_amount DECIMAL(19, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id VARCHAR(255),
    created_by_email VARCHAR(255),
    approved_at TIMESTAMP,
    approved_by_user_id VARCHAR(255),
    approved_by_email VARCHAR(255),
    paid_at TIMESTAMP,
    paid_by_user_id VARCHAR(255),
    payment_ref VARCHAR(255),
    export_file_key VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS royalty_payment_batch_items (
    batch_id UUID NOT NULL,
    royalty_record_id UUID NOT NULL,
    author_id VARCHAR(255),
    author_email VARCHAR(255),
    amount DECIMAL(19, 2),
    PRIMARY KEY (batch_id, royalty_record_id),
    FOREIGN KEY (batch_id) REFERENCES royalty_payment_batches(id),
    FOREIGN KEY (royalty_record_id) REFERENCES royalty_records(id)
);

CREATE INDEX IF NOT EXISTS idx_royalty_records_published_at ON royalty_records(published_at);
CREATE INDEX IF NOT EXISTS idx_royalty_records_author_id ON royalty_records(author_id);
CREATE INDEX IF NOT EXISTS idx_royalty_records_status ON royalty_records(status);
