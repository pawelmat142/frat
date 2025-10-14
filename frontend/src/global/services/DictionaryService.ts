import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { httpClient } from "global/services/http";

const CACHE_KEY = 'dictionary_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface DictionaryCacheEntry {
    data: DictionaryI;
    timestamp: number;
}

interface DictionaryCache {
    [dictionaryCode: string]: DictionaryCacheEntry;
}

function loadCache(): DictionaryCache {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function saveCache(cache: DictionaryCache) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        // localStorage may be unavailable
        console.warn("Unable to access local storage for caching.");
    }
}

function getCachedDictionary(key: string): DictionaryI | null {
    const cache = loadCache();
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        // expired, remove
        delete cache[key];
        saveCache(cache);
        return null;
    }
    return entry.data;
}

function prepareKey(dictionaryCode: string, groupCode?: string): string {
    return groupCode ? `${dictionaryCode}_${groupCode}` : dictionaryCode;
}

function setCachedDictionary(data: DictionaryI, key: string) {
    const cache = loadCache();
    cache[key] = {
        data,
        timestamp: Date.now(),
    };
    saveCache(cache);
}

function clearCache() {
    localStorage.removeItem(CACHE_KEY);
}

export const DictionaryService = {

    async getDictionary(dictionaryCode: string, groupCode?: string): Promise<DictionaryI> {
        const key = prepareKey(dictionaryCode, groupCode);
        const cached = getCachedDictionary(key);
        if (cached) {
            return Promise.resolve(cached);
        }
        const response = groupCode
            ? await httpClient.get<DictionaryI>(`/get-dictionary/${dictionaryCode}/${groupCode}`, { skipAuth: true })
            : await httpClient.get<DictionaryI>(`/get-dictionary/${dictionaryCode}`, { skipAuth: true });
            
        setCachedDictionary(response, key);
        return response;
    },
    
    clearCache() {
        clearCache();
    }
};