// utils/projectCache.js

class ProjectCache {
    constructor() {
        this.cache = null;
        this.loading = false;
        this.listeners = new Set();
    }

    async fetch() {
        // Jika sudah ada cache, return langsung
        if (this.cache) {
            return this.cache;
        }

        // Jika sedang loading, tunggu sampai selesai
        if (this.loading) {
            return new Promise((resolve) => {
                const checkCache = setInterval(() => {
                    if (!this.loading && this.cache) {
                        clearInterval(checkCache);
                        resolve(this.cache);
                    }
                }, 50);
            });
        }

        // Fetch data baru
        this.loading = true;
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            
            if (res.ok && Array.isArray(data)) {
                this.cache = data;
                this.notifyListeners();
                return data;
            }
            return [];
        } catch (error) {
            console.error("Gagal mengambil data proyek:", error);
            return [];
        } finally {
            this.loading = false;
        }
    }

    get() {
        return this.cache;
    }

    clear() {
        this.cache = null;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.cache));
    }
}

// Export instance tunggal (singleton)
export const projectCache = new ProjectCache();