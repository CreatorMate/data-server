import Redis from "ioredis";
import env from "../env";

export function useRedis() {
    return new RedisClient();
}

export class RedisClient {
    client = new Redis({
        host: env?.REDIS_HOST,
        port: env?.REDIS_PORT,
        password: env?.REDIS_PASSWORD,
        tls: {},
    });

    public async storeInCache(key: string, data: any) {
        const stringified = JSON.stringify(data);
        await this.client.set(key, stringified, 'EX', 172800);
    }

    public async getFromCache(key: string) {
        const redisItem = await this.client.get(key);
        if(!redisItem) return null;
        let cachedItem = JSON.parse(redisItem);
        if (cachedItem && Object.keys(cachedItem).length > 0) {
            return cachedItem;
        }
        return null;
    }

}