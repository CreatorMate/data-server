import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {InstagramManager} from "../../../src/utils/InstagramConnector/InstagramManager";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";
import {InstagramPost} from "../../../src/utils/InstagramConnector/types/InstagramPostTypes";

export class GetBrandAverageEndpoint extends Endpoint{
    protected readonly description: string = "Get the average of post fields";
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = 'GET'
    protected readonly route: string = '/brands/:id/statistics/average'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id') as string;
        const {key, ids, days} = context.req.query();
        if(!key) {
            return errorResponse(context, 'must be given a key');
        }

        const average = await InstagramConnector.statistics().getAveragePostStatistic(id, key as keyof InstagramPost, ids, days);

        // // const posts: APIResponse<InstagramPost[]> = await InstagramConnector.content().getContentList(id);
        // // if(!posts.success) return errorResponse(context, 'unable to get posts at this time');
        // const posts: InstagramPost[] = await brandManager.getPosts(ids, days);
        // const average = brandManager.getAverageField<InstagramPost>(posts, key as keyof InstagramPost);

        return successResponse(context, {
            average: average
        })
    }

}