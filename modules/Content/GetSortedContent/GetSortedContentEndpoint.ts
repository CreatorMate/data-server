import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";
import {InstagramPost} from "../../../src/utils/InstagramConnector/types/InstagramPostTypes";

export class GetSortedContentEndpoint extends Endpoint {
    protected readonly description: string = 'get a list of sorted content items, sorted by property';
    protected readonly group: Groups = Groups.Content;
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/:id/content'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): Promise<any> {
        const brand_id = context.req.param('id') as unknown;
        let {key, order, ids, page, limit, days} = context.req.query();

        if(!brand_id) return errorResponse(context, 'provide a valid key');
        if(order && (order !== 'asc' && order !== 'desc')) {
            return errorResponse(context, 'order must be either asc or desc')
        }

        const brandManager = new BrandManager(<number>brand_id, this.getPrisma());
        const postsList= await brandManager.getPosts(ids, days);
        console.log(postsList.length)

        const sortedPosts = this.sortPosts<InstagramPost>(postsList, key as keyof InstagramPost, order as  "asc" | "desc");
        console.log(sortedPosts.length)

        const amount = limit ? Number(limit) : 10;
        const currentPage = page ? Number(page) : 1;

        const startAt = (currentPage - 1) * amount;

        const posts = sortedPosts.slice(startAt, startAt+amount);
        return successResponse(context, posts);
    }

    private sortPosts<T extends InstagramPost>(posts: T[], key: keyof T, order: "asc" | "desc" = 'desc'): T[] {
        return posts.sort((postA: T, postB: T) => {
            if(order === 'desc') {
                return postA[key] < postB[key] ? 1 : -1
            }

            return postA[key] < postB[key] ? -1 : 1
        });
    }
}