import {Context, Hono, Next} from "hono";
import {logger} from "hono/logger";

import dotenv from 'dotenv';
import {routeLoader} from "./utils/router/RouteLoader";
import Redis from "ioredis";
dotenv.config();  // Load environment variables
const API_KEY = process.env.API_KEY;

export function useRedis() {
    //@ts-ignore
    return new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        tls: {},
    });
}

const redis = useRedis();

const app = new Hono();

app.use('*', logger());

//@ts-ignore
app.use('*', (ctx: Context, next: Next) => {
    const apiKey = ctx.req.header('x-api-key');
    if (apiKey !== API_KEY) {
        return ctx.json({ error: 'Unauthorized' }, 401);
    }
    return next();
});

app.get('/redis/:key/:value', async (ctx) => {
    const { key, value } = ctx.req.param();
    await redis.set(key, value, 'EX', 86400);
    return ctx.text(`Set key "${key}" with value "${value}"`);
})

app.get('/redis/:key', async (ctx) => {
    const { key } = ctx.req.param();
    const value = await redis.get(key);
    return ctx.text(`We found "${key}" with value "${value}"`);
})

await routeLoader.findAndRegisterEndpoints('./modules', app);



export default app;