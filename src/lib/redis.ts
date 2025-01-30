import Redis from "ioredis";
import env from "../env";

export class RedisClient {
    private static instance: RedisClient;
    public client: Redis;

    private constructor() {
        this.client = new Redis({
            host: env?.REDIS_HOST,
            port: env?.REDIS_PORT,
            password: env?.REDIS_PASSWORD,
            tls: {}, // Remove this if Redis doesn't use TLS
        });

        this.client.on("error", (err) => {
            console.error("Redis Error:", err);
        });
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async storeInCache(key: string, data: any) {
        const stringified = JSON.stringify(data);
        await this.client.set(key, stringified, 'EX', 172800);
    }

    public async getFromCache(key: string): Promise<any> {
        const redisItem = await this.client.get(key);
        if (!redisItem) return null;
        return JSON.parse(redisItem);
    }
}

export function useRedis() {
    return RedisClient.getInstance();
}