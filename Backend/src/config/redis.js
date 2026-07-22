import {createClient} from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
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