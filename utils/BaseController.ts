import {Context, Hono} from "hono";

export abstract class BaseController {
    protected abstract readonly route: string;
    protected abstract readonly method: string;
    protected abstract handle(ctx: Context);
    private supportedMethods = ['get', 'post', 'put', 'delete', 'patch', 'options'];

    public register(app: Hono): void {
        if (!this.supportedMethods.includes(this.method.toLowerCase())) {
            throw new Error(`Unsupported HTTP method: ${this.method} in ${this.route}`);
        }

        app[this.method](this.route, this.handle.bind(this));
    }


}