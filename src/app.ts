import {routeLoader} from "./utils/router/RouteLoader";
import {OpenAPIHono} from "@hono/zod-openapi";
import createApp from "./lib/createApp";
import configureOpenAPI from "./lib/configureOpenAPI";

const app: OpenAPIHono = createApp();

configureOpenAPI(app);

await routeLoader.findAndRegisterEndpoints('./modules', app);

export default app;