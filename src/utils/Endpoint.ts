import {Context, Hono} from "hono";
import {PrismaClient} from "@prisma/client";
import {createRoute, OpenAPIHono} from "@hono/zod-openapi";
import {z, ZodObject} from "zod";
import jsonContent from "./OpenAPI/JsonContent";
import {OK, UNPROCESSABLE_ENTITY} from "../http-status-codes";
import {Groups} from "../lib/enums";

export abstract class Endpoint {
    protected abstract readonly group: Groups;
    protected abstract readonly description: string;
    protected abstract readonly route: string;
    protected abstract readonly method: string;
    protected abstract schema: ZodObject<any>

    protected abstract handle(context: Context): any;

    private supportedMethods = ['get', 'post', 'put', 'delete', 'patch', 'options'];
    protected prismaClient = new PrismaClient();

    public register(app: OpenAPIHono): void {
        if (!this.supportedMethods.includes(this.method.toLowerCase())) {
            throw new Error(`Unsupported HTTP method: ${this.method} in ${this.route}`);
        }

        app.openapi(createRoute({
                    tags: [this.group],
                    method: this.method,
                    path: this.route,
                    responses: {
                        OK: jsonContent(this.schema, this.description),
                        ...((this.method === 'post' || this.method === 'put') && {
                            UNPROCESSABLE_ENTITY: jsonContent(z.object({success: z.boolean(), message: z.string()}), "The validation error(s)"),
                        }),
                    }
                },
            ),
            this.handle
        );

        //@ts-ignore
        app[this.method](this.route, this.handle.bind(this));
    }


}