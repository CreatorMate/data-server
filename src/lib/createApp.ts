import {OpenAPIHono} from "@hono/zod-openapi";
import {Context, Next} from "hono";
import notFound from "../middlewares/NotFound";
import onError from "../middlewares/OnError";
import env from "../env";
import {logger} from "hono/logger";
import defaultHook from "../utils/OpenAPI/defaultHook";
import {authenticationMiddleware} from "../middlewares/Authentication";

export function createRouter() {
    return new OpenAPIHono({
        strict: false,
        defaultHook
    });
}
export default function createApp() {
    const app = createRouter();

    app.use('*', logger());

    app.use(authenticationMiddleware);

    app.notFound(notFound)
    app.onError(onError);

    return app;
}