import {Context, Hono, Next} from "hono";
import {logger} from "hono/logger";

import {routeLoader} from "./utils/router/RouteLoader";
import Redis from "ioredis";
import {OpenAPIHono} from "@hono/zod-openapi";
import createApp from "./lib/createApp";
import configureOpenAPI from "./lib/configureOpenAPI";

const app: OpenAPIHono = createApp();

configureOpenAPI(app);

await routeLoader.findAndRegisterEndpoints('./src/modules', app);

export default app;