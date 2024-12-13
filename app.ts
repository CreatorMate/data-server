import {Hono} from "hono";
import {BaseController} from "./utils/BaseController";
import {logger} from "hono/logger";
import { env, getRuntimeKey } from 'hono/adapter'

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import dotenv from 'dotenv';
import {routeLoader} from "./utils/router/RouteLoader";
dotenv.config();  // Load environment variables

const app = new Hono();

app.use('*', logger());

console.log('test')

app.use('*', (ctx, next) => {
    const apiKey = ctx.req.header('x-api-key');
    if (apiKey !== API_KEY) {
        return ctx.json({ error: 'Unauthorized' }, 401);
    }
    return next();
});

await routeLoader.findAndRegisterEndpoints('./modules', app);

const API_KEY = process.env.API_KEY;



export default app;