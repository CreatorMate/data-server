import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";
import {Post} from "../../../src/utils/Phyllo/Types/Post";

export class GetBrandAverageEndpoint extends Endpoint{
    protected readonly description: string = "Get the average of post fields";
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = 'GET'
    protected readonly route: string = '/brands/:id/statistics/average'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id') as unknown
        const {key, ids, days} = context.req.query();
        if(!key) {
            return errorResponse(context, 'must be given a key');
        }

        const brandManager = new BrandManager(<number>id, this.getPrisma());
        const posts: Post[] = await brandManager.getPosts(ids, days);
        const average = brandManager.getAverageField<Post>(posts, key as keyof Post);

        return successResponse(context, {
            average: average
        })
    }

}