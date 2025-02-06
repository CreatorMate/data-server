import {routeLoader} from "./utils/router/RouteLoader";
import {OpenAPIHono} from "@hono/zod-openapi";
import createApp from "./lib/createApp";
import configureOpenAPI from "./lib/configureOpenAPI";
import {Context} from "hono";
import {successResponse} from "./utils/APIResponse/HttpResponse";

const app: OpenAPIHono = createApp();

configureOpenAPI(app);

app.get('/check', (c: Context) => {
    return successResponse(c, 'im here')
});

await routeLoader.findAndRegisterEndpoints('./modules', app);

export default app;