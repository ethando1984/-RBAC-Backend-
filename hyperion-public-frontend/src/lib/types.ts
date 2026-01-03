export interface Author {
    name: string;
    bio?: string;
    avatarUrl?: string;
}

export interface Category {
    id: string;
    parentId?: string;
    name: string;
    slug: string;
    description?: string;
    positionConfigJson?: string;
    redirectTo?: string;
    canonicalSlug?: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    redirectTo?: string;
    canonicalSlug?: string;
}

export interface MediaVariant {
    type: string;
    url: string;
    width?: number;
    height?: number;
}

export interface Article {
    id: string;
    title: string;
    subtitle?: string;
    slug: string;
    contentHtml: string;
    excerpt?: string;
    coverMediaUrl?: string;
    mediaVariants?: MediaVariant[];
    publishedAt: string;
    author?: Author;
    categories?: Category[];
    tags?: Tag[];
    readTime?: number;
    redirectTo?: string;
    canonicalSlug?: string;
}

export interface Storyline {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: string;
    articleCount: number;
    updatedAt: string;
    contentsJson?: string;
    articles?: Article[];
    redirectTo?: string;
    canonicalSlug?: string;
}

export interface HomeResponse {
    layout: any;
    feed: Article[];
    staffPicks: Article[];
    recommendedTopics: Category[];
}
