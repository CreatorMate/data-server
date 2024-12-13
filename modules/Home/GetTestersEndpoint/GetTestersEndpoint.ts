import {Endpoint} from "../../../utils/Endpoint";
import {Context, Hono} from "hono";

export class GetTestersEndpoint extends Endpoint {
    protected readonly route: string = '/home';
    protected readonly method: string = 'get';

    protected handle(ctx) {
        return ctx.json({message: 'Welcome to home!'})
    }
}