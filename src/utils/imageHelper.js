/**
 * Helper untuk handle image URLs (legacy local path vs new Supabase URLs)
 * @param {string} imageUrl - URL atau path gambar dari database
 * @param {string} fallback - Fallback image jika URL tidak valid
 * @returns {string} - Valid image URL
 */
export function getImageUrl(imageUrl, fallback = '/placeholder.png') {
    // 1. Jika tidak ada URL, return fallback
    if (!imageUrl || imageUrl.trim() === '') {
        return fallback;
    }

    // 2. Jika sudah URL lengkap (Supabase atau external), langsung return
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // 3. Jika path lokal (legacy), dan masih ada di public folder local dev
    //    Di production (Vercel), ini akan 404, jadi kita fallback
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
        // Check if we're in development (localhost) or production
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            // Di local dev, coba load dari public folder
            return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        } else {
            // Di production (Vercel), gambar lokal tidak ada, return fallback
            console.warn(`Legacy local image detected: ${imageUrl}. Using fallback.`);
            return fallback;
        }
    }

    // 4. Default: return as-is (mungkin relative path lain)
    return imageUrl;
}

/**
 * Helper khusus untuk client logo
 */
export function getClientLogoUrl(logoUrl) {
    return getImageUrl(logoUrl, 'https://via.placeholder.com/150x150?text=Client+Logo');
}

/**
 * Helper khusus untuk company profile
 */
export function getCompanyImageUrl(imageUrl) {
    return getImageUrl(imageUrl, 'https://via.placeholder.com/400x300?text=Company+Image');
}

/**
 * Helper khusus untuk product image
 */
export function getProductImageUrl(imageUrl) {
    return getImageUrl(imageUrl, 'https://via.placeholder.com/600x400?text=Product+Image');
}

/**
 * Helper khusus untuk service image
 */
export function getServiceImageUrl(imageUrl) {
    return getImageUrl(imageUrl, 'https://via.placeholder.com/400x300?text=Service+Image');
}
