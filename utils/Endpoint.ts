import {Context, Hono} from "hono";
import {PrismaClient} from "@prisma/client";

export abstract class Endpoint {
    protected abstract readonly route: string;
    protected abstract readonly method: string;
    protected abstract handle(context: Context);
    private supportedMethods = ['get', 'post', 'put', 'delete', 'patch', 'options'];
    protected prismaClient = new PrismaClient();

    public register(app: Hono): void {
        if (!this.supportedMethods.includes(this.method.toLowerCase())) {
            throw new Error(`Unsupported HTTP method: ${this.method} in ${this.route}`);
        }

        app[this.method](this.route, this.handle.bind(this));
    }


}