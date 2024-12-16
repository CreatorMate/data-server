import {routeLoader} from "./utils/router/RouteLoader";
import {OpenAPIHono} from "@hono/zod-openapi";
import createApp from "./lib/createApp";
import configureOpenAPI from "./lib/configureOpenAPI";
import {PhylloClient} from "./utils/Phyllo/PhylloClient";

const app: OpenAPIHono = createApp();

configureOpenAPI(app);

const client = new PhylloClient();


await routeLoader.findAndRegisterEndpoints('./modules', app);

export default app;