import Redis from "ioredis";

export function useRedis() {
    //@ts-ignore
    return new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        tls: {},
    });
}