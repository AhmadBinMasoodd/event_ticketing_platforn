import redisService from "../services/redis.services.js";

export const getCache=async (key) => {
    const data=await redisService.get(key);
    if(data){
        console.log("Cache Hit");
    }else{
        console.log("Cache Miss");
    }
    return data;
};
export const setCache=async(key,value,ttl=600)=>{
    try {
        await redisService.set(key,value,ttl);
    } catch (error) {
        console.error("Error setting cache:", error.message);
    }
}

export const deleteCache=async(key)=>{
    try {
        await redisService.del(key);
    } catch (error) {
        console.error("Error deleting cache:", error.message);
    }
}

export const deleteCachePattern = async (pattern) => {

    // If the first attempt fails, try again
    try {
        await redisService.deleteByPattern(pattern);
    } catch (error) {
        console.error("Error deleting cache pattern:", error.message);
    }

};