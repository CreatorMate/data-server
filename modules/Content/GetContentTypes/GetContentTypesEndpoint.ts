import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";
import {InstagramPost} from "../../../src/utils/InstagramConnector/types/InstagramPostTypes";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";

export class GetContentTypesEndpoint extends Endpoint {
    protected readonly description: string = 'get percentages of the content types for your brand';
    protected readonly group: Groups = Groups.Content;
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/:id/content_types'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): Promise<any> {
        const brand_id = context.req.param('id') as unknown;
        let {ids, days} = context.req.query();

        const posts = await InstagramConnector.content().getPosts(brand_id, ids, days);

        const types: Map<string, number> = new Map();

        posts.forEach((post) => {
            const type = post.media_product_type === 'FEED' ? 'IMAGE' : post.media_product_type;
            types.set(type, (types.get(type) || 0) + 1);
        });

        const percentages: ContentType[] = Array.from(types.entries()).map(([key, value]) => ({
            type: key,
            value: Math.round((value / posts.length) * 100),
        }));

        return successResponse(context, percentages);
    }
}

type ContentType = {
    type: string,
    value: number
}