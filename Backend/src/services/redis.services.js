import redisClient from "../config/redis.config.js";

class RedisService {
    async get(key){
        const data = await redisClient.get(key);
        if(!data) return null;
        return JSON.parse(data);
    }

    async set(key,value,ttl=300){
        return await redisClient.set(
            key,
            JSON.stringify(value),
            {
                EX: ttl
            }
        );
    }

    async del(key){
        return await redisClient.del(key);
    }
    async exists(key){
        return await redisClient.exists(key);
    }
}
export default new RedisService();