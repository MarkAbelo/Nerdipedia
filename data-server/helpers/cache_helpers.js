import redis from 'redis';
const redis_client = redis.createClient();
await redis_client.connect();

// given an object array and cache key, caches that array as a redis list
export const cacheObjectArray = async (cacheKey, objArray, expireTime = 3600) => {
    for (const obj of objArray) {
        await redis_client.rPush(cacheKey, JSON.stringify(obj));
    }
    await redis_client.expire(cacheKey, expireTime);
};

// given a cache key for redis list of objects, returns the parsed object array
export const getCachedObjectArray = async (cacheKey) => {
    const cacheData = await redis_client.lRange(cacheKey, 0, -1);
    const parsedObjs = cacheData.map(JSON.parse);
    return parsedObjs;
};