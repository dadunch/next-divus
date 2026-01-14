// src/lib/rate-limit.js
import { LRUCache } from 'lru-cache';

const rateLimit = (options) => {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // Default 1 menit
  });

  return {
    check: (res, limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        // Set header untuk info ke client
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - currentUsage);

        return isRateLimited ? reject() : resolve();
      }),
  };
};

// Buat instance limiter (10 request per 60 detik)
export const limiter = rateLimit({
  interval: 60000,
  uniqueTokenPerInterval: 500,
});