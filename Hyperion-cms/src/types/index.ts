export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'editor' | 'chief_editor' | 'author';
}

export interface Article {
    id: string;
    title: string;
    status: 'draft' | 'pending_editorial' | 'pending_publishing' | 'scheduled' | 'published' | 'rejected';
    author: User;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    views?: number;
}
