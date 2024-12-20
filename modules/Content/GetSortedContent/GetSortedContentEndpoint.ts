import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetSortedContentEndpoint extends Endpoint {
    protected readonly description: string = 'get a list of sorted content items, sorted by property';
    protected readonly group: Groups = Groups.Content;
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/:id/content'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): any {
        const brand_id = context.req.param('brand_id') as string;
        const {key, order} = context.req.query();

        if(order && (order !== 'asc' && order !== 'desc')) {
            return errorResponse(context, 'order must be either asc or desc')
        }

        const creators = await this.getPrisma().creators.findMany({
            where: {
                brand_id: <number>brand_id,
                status: {
                    not: 'pending'
                }
            }
        });

        const posts: Post[] = [];
        for(const creator of creators) {
            posts.push(...(await this.getFromCache(`${creator.id}.content`)));
        }

        const sorted = this.sortPosts<Post>(posts, key as keyof Post, order as  "asc" | "desc");

        return successResponse(context, sorted);
    }

    private sortPosts<T extends Post>(posts: T[], key: keyof T, order: "asc" | "desc" = 'desc'): T[] {
        return posts.sort((postA: T, postB: T) => {
            if(order === 'desc') {
                return postA[key] < postB[key] ? 1 : -1
            }

            return postA[key] < postB[key] ? -1 : 1
        });
    }
}