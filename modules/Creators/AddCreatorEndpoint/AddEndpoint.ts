import {Endpoint} from "../../../utils/Endpoint";
import {Context} from "hono";

export class AddEndpoint extends Endpoint{
    protected readonly method: string = 'post'
    protected readonly route: string = '/creators/add'

    protected handle(ctx: Context) {
        return ctx.json({'added': true})
    }
}