// src/lib/cache-headers.js

/**
 * Set cache headers untuk API responses
 * Menggunakan stale-while-revalidate untuk performance optimal
 * 
 * @param {Object} res - Next.js response object
 * @param {number} maxAge - Max age in seconds (berapa lama dianggap fresh)
 * @param {number} swr - Stale-while-revalidate in seconds (berapa lama serve stale data sambil revalidate)
 */
export function setCacheHeaders(res, maxAge = 60, swr = 30) {
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  );
}

/**
 * Set no-cache headers untuk data yang sering berubah
 * Digunakan untuk admin endpoints atau data real-time
 */
export function setNoCacheHeaders(res) {
  res.setHeader(
    'Cache-Control',
    'private, no-cache, no-store, max-age=0, must-revalidate'
  );
}

/**
 * Set long-term cache untuk data yang jarang berubah
 * Cocok untuk images, static assets, atau data yang immutable
 * 
 * @param {Object} res - Next.js response object
 * @param {number} maxAge - Max age in seconds (default: 24 hours)
 */
export function setLongTermCache(res, maxAge = 86400) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=${maxAge}, immutable`
  );
}

/**
 * Cache configuration presets untuk common use cases
 */
export const CACHE_PRESETS = {
  // Data yang jarang berubah (company profile, about us, etc)
  STATIC: { maxAge: 3600, swr: 7200 },        // 1 hour fresh, 2 hours stale
  
  // Data yang medium frequency (services, products, projects)
  MEDIUM: { maxAge: 300, swr: 3600 },         // 5 min fresh, 1 hour stale
  
  // Data yang sering berubah (stats, dashboard)
  DYNAMIC: { maxAge: 60, swr: 300 },          // 1 min fresh, 5 min stale
  
  // Data yang sangat jarang berubah (clients, categories)
  LONG_TERM: { maxAge: 1800, swr: 7200 },     // 30 min fresh, 2 hours stale
};

/**
 * Helper function untuk set cache dengan preset
 * 
 * @param {Object} res - Next.js response object
 * @param {string} preset - Preset name dari CACHE_PRESETS
 */
export function setCachePreset(res, preset = 'MEDIUM') {
  const config = CACHE_PRESETS[preset];
  if (config) {
    setCacheHeaders(res, config.maxAge, config.swr);
  } else {
    console.warn(`Unknown cache preset: ${preset}, using MEDIUM`);
    setCacheHeaders(res, CACHE_PRESETS.MEDIUM.maxAge, CACHE_PRESETS.MEDIUM.swr);
  }
}
