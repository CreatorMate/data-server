import {BaseController} from "../../../utils/BaseController";
import {Context} from "hono";

export class AddEndpoint extends BaseController{
    protected readonly method: string = 'post'
    protected readonly route: string = '/creators/add'

    protected handle(ctx: Context) {
        return ctx.json({'added': true})
    }
}