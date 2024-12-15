import {Endpoint} from "../../../utils/Endpoint";
import {Context} from "hono";
import {z} from "zod";
import {Groups} from "../../../lib/enums";

export class AddEndpoint extends Endpoint{
    protected readonly group: Groups = Groups.CREATORS;
    protected readonly description: string = "Add a creator";
    protected readonly method: string = 'get';
    protected readonly route: string = '/creators/add';
    protected schema = z.object({
        added: z.boolean()
    });

    protected handle(ctx: Context) {
        return ctx.json({'added': true})
    }


}