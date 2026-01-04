import { TranslationI } from "@shared/interfaces/TranslationI";
import { httpClient } from "global/services/http";

const CACHE_KEY = 'translation_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface TranslationCacheEntry {
    data: TranslationI;
    timestamp: number;
}

interface TranslationCache {
    [langCode: string]: TranslationCacheEntry;
}

function loadCache(): TranslationCache {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function saveCache(cache: TranslationCache) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Failed to save translation cache');
        // localStorage may be unavailable
    }
}

function getCachedTranslation(langCode: string): TranslationI | null {
    const cache = loadCache();
    const entry = cache[langCode];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        // expired, remove
        delete cache[langCode];
        saveCache(cache);
        return null;
    }
    return entry.data;
}

function setCachedTranslation(langCode: string, data: TranslationI) {
    const cache = loadCache();
    cache[langCode] = {
        data,
        timestamp: Date.now(),
    };
    saveCache(cache);
}

function clearCache() {
    localStorage.removeItem(CACHE_KEY);
}

export const TranslationService = {
    async getTranslation(langCode: string): Promise<TranslationI> {
        // TODO switch on caching translations
        // const cached = getCachedTranslation(langCode);
        // if (cached) {
        //     return Promise.resolve(cached);
        // }
        const response = await httpClient.get<TranslationI>(`/get-translations/${langCode}`, { skipAuth: true });
        setCachedTranslation(langCode, response);
        return response;
    },
    
    clearCache() {
        clearCache();
    }
};