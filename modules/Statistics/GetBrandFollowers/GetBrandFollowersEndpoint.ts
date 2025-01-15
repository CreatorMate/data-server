import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import BrandManager from "../../../src/managers/BrandManager";
import {successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetBrandFollowersEndpoint extends Endpoint{
    protected readonly description = 'get the total amount of followers of the given creators';
    protected readonly group: Groups = Groups.Statistics
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/:id/statistics/followers'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id');
        const {ids} = context.req.query();

        const brandManager = new BrandManager(<number>id, this.getPrisma());
        const followers = await brandManager.getFollowers(ids);

        return successResponse(context, followers);
    }
}