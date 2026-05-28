export declare class CacheService {
    private readonly CACHE_TTL;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    getCacheKey(type: string, id: string): string;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=CacheService.d.ts.map