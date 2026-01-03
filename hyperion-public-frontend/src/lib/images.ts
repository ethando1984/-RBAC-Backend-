const STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:8081';

/**
 * Ensures an image URL is absolute.
 * If the path starts with http/https, it's returned as is.
 * Otherwise, it prepends the NEXT_PUBLIC_STATIC_URL.
 */
export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }

    // Ensure path starts with / if it doesn't
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Remove trailing slash from STATIC_URL if it exists
    const baseUrl = STATIC_URL.endsWith('/') ? STATIC_URL.slice(0, -1) : STATIC_URL;

    return `${baseUrl}${normalizedPath}`;
}
