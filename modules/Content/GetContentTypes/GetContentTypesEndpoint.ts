import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";

export class GetContentTypesEndpoint extends Endpoint {
    protected readonly description: string = 'get percentages of the content types for your brand';
    protected readonly group: Groups = Groups.Content;
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/:id/content_types'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): Promise<any> {
        const brand_id = context.req.param('id') as unknown;
        let {ids, days} = context.req.query();

        const brandManager = new BrandManager(<number>brand_id, this.getPrisma());
        const posts: Post[] = await brandManager.getPosts(ids, days);

        const types: Map<string, number> = new Map();

        for(const post of posts) {
            let type = post.type == 'FEED' ? 'IMAGE' : post.type;
            if(!types.has(type)) {
                types.set(type, 0);
            }

            let value = types.get(type) as number;
            types.set(type, ++value)
        }

        const percentages: ContentType[] = [];
        for(const [key, value] of types.entries()) {
            let percentage = Math.round((value / posts.length) * 100);
            percentages.push({type: key, value: percentage});
        }

        return successResponse(context, percentages);
    }
}

type ContentType = {
    type: string,
    value: number
}