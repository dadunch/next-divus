// src/lib/rate-limit.js

const rateLimit = (options) => {
  const tokenCache = new Map();
  const interval = options?.interval || 60000;

  return {
    check: (res, limit, token) =>
      new Promise((resolve, reject) => {
        const now = Date.now();
        const record = tokenCache.get(token) || { count: 0, lastRequest: now };

        // Jika interval sudah lewat, reset count
        if (now - record.lastRequest > interval) {
          record.count = 0;
          record.lastRequest = now;
        }

        record.count += 1;
        tokenCache.set(token, record);

        const currentUsage = record.count;
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
  uniqueTokenPerInterval: 500, // Walaupun Map tidak otomatis menghapus memori max seperti LRU, implementasi sederhana ini cukup aman untuk traffic awal
});