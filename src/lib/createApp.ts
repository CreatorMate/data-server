import {OpenAPIHono} from "@hono/zod-openapi";
import {Context, Next} from "hono";
import notFound from "../middlewares/NotFound";
import onError from "../middlewares/OnError";
import env from "../env";
import {logger} from "hono/logger";
import defaultHook from "../utils/OpenAPI/defaultHook";

export function createRouter() {
    return new OpenAPIHono({
        strict: false,
        defaultHook
    });
}
export default function createApp() {
    const app = createRouter();

    app.use('*', logger());

    // app.use('*', (ctx: Context, next: Next): any => {
        // const apiKey = ctx.req.header('x-api-key');
        // if (apiKey !== env?.API_KEY) {
        //     return ctx.json({ error: 'Unauthorized' }, 401);
        // }
        // return next();
    // });

    app.notFound(notFound)
    app.onError(onError);

    return app;
}