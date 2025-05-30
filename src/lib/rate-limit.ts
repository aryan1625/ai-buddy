import {Ratelimit} from "@upstash/ratelimit"
import {Redis} from "@upstash/redis"
export async function rateLimit(identifier: string){
    try{
        const rateLimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(10,"10 s"),
            analytics: true,
            prefix: "@upstash/ratelimit",
        })
        const result = await rateLimit.limit(identifier);
        return result;
    }catch(error){
        console.error("Rate limit error!!", error);
        return {success: true};
    }
}