import {createClient} from 'redis';

const getRedisUrl = () => {
    if (process.env.REDIS_HOST) {
        const port = process.env.REDIS_PORT || 6379;
        return `redis://${process.env.REDIS_HOST}:${port}`;
    }

    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    return 'redis://localhost:6379';
};

const redisClient = createClient({
    url: getRedisUrl(),
});
redisClient.on(
    "connect",
    () => {
        console.log("Redis client connected");
    }
);
redisClient.on(
    "error",
    (err) => {
        console.error("Redis client error", err);
    }
);
export default redisClient;