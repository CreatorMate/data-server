import {OpenAPIHono} from "@hono/zod-openapi";
import {apiReference} from "@scalar/hono-api-reference";

export default function configureOpenAPI(app: OpenAPIHono) {
    app.doc("/doc", {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "CreatorAPI"
        }
    })

    //@ts-ignore
    app.get("/reference", apiReference({
        defaultHttpClient: {
          targetKey: 'node',
          clientKey: 'fetch'
        },
        theme: "kepler",
        spec: {
            url: "/doc",
        }
    }));
}