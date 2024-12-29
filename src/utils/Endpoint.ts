import {Context, Hono} from "hono";
import {createRoute, OpenAPIHono} from "@hono/zod-openapi";
import {z, ZodObject} from "zod";
import jsonContent from "./OpenAPI/JsonContent";
import {Groups} from "../lib/enums";
import {PrismaClient} from "@prisma/client"
import {PhylloClient} from "./Phyllo/PhylloClient";
import Redis from "ioredis";
import env from "../env";

export abstract class Endpoint {
    protected abstract readonly group: Groups;
    protected abstract readonly description: string;
    protected abstract readonly route: string;
    protected abstract readonly method: string;
    protected abstract schema: ZodObject<any>;

    protected abstract handle(context: Context): any

    protected async getFromCache(key: string) {
        const redis = this.getRedis();
        const redisItem = await redis.get(key);
        if(!redisItem) return null;
        let cachedItem = JSON.parse(redisItem);
        if (cachedItem && Object.keys(cachedItem).length > 0) {
            return cachedItem;
        }
        return null;
    }

    protected async storeInCache(key: string, data: any) {
        const redis = this.getRedis();
        const stringified = JSON.stringify(data);
        await redis.set(key, stringified, 'EX', 172800);
    }
    protected getRedis(): Redis {
        return new Redis({
            host: env?.REDIS_HOST,
            //@ts-ignore
            port: env?.REDIS_PORT,
            //@ts-ignore
            password: env?.REDIS_PASSWORD,
            //@ts-ignore
            tls: {},
        });
    }

    private supportedMethods = ['get', 'post', 'put', 'delete', 'patch', 'options'];

    public getPrisma(): PrismaClient {
        return new PrismaClient();
    }

    public getPhyllo(): PhylloClient {
        return new PhylloClient()
    }

    public register(app: OpenAPIHono): void {
        if (!this.supportedMethods.includes(this.method.toLowerCase())) {
            throw new Error(`Unsupported HTTP method: ${this.method} in ${this.route}`);
        }

        app.openapi(createRoute({
                    tags: [this.group],
            //@ts-ignore
                    method: this.method,
                    path: this.route,
                    responses: {
                        OK: jsonContent(this.schema, this.description),
                        ...((this.method === 'post' || this.method === 'put') && {
                            UNPROCESSABLE_ENTITY: jsonContent(z.object({
                                success: z.boolean(),
                                message: z.string()
                            }), "The validation error(s)"),
                        }),
                    }
                },
            ),
            (context) => this.handle(context)
        );
    }


}