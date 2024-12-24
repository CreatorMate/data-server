import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {Post} from "../../../src/utils/Phyllo/Types/Post";
import {APIResponse, errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";

export class GetSortedContentEndpoint extends Endpoint {
    protected readonly description: string = 'get a list of sorted content items, sorted by property';
    protected readonly group: Groups = Groups.Content;
    protected readonly method: string = 'get'
    protected readonly route: string = '/brands/:id/content'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context): Promise<any> {
        const brand_id = context.req.param('id') as string;
        const {key, order, ids} = context.req.query();

        const creatorIds = ids.split(',');

        if(!brand_id) return errorResponse(context, 'provide a valid key');

        if(order && (order !== 'asc' && order !== 'desc')) {
            return errorResponse(context, 'order must be either asc or desc')
        }

        let creatorContent: Map<string, Post[]> = await this.getFromCache(`brands.${brand_id}.content`);
        if(!creatorContent) {
            //@todo switch this to a map not a list.
            creatorContent = await this.getCreatorContentFromCashe(Number(brand_id));
        }

        const posts: Post[] = this.getPostsFromMap(creatorContent, creatorIds);

        const sorted = this.sortPosts<Post>(posts, key as keyof Post, order as  "asc" | "desc");

        return successResponse(context, sorted);
    }

    private getPostsFromMap(creatorContent: Map<string, Post[]>, ids: string[]): Post[] {
        const contentList: Post[] = [];
        for (const [id, posts] of creatorContent.entries()) {
            if(ids.length !== 0 && !ids.includes(id)) continue;
            contentList.push(...posts);
        }

        return contentList
    }

    private async getCreatorContentFromCashe(brand_id: number): Promise<Map<string, Post[]>> {
        const contentMap = new Map<string, Post[]>();
        const creators = await this.getPrisma().creators.findMany({
            where: {
                brand_id: <number>brand_id,
                status: {
                    not: 'pending'
                },
            }
        });

        for(const creator of creators) {
            const posts = await this.getFromCache(`${creator.id}.content`);
            contentMap.set(creator.id, posts);
        }

        await this.storeInCache(`brands.${brand_id}.content`, contentMap);

        return contentMap;
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