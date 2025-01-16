import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";
import {Post} from "../../../src/utils/Phyllo/Types/Post";

export class GetBrandReachPerContentTypeEndpoint extends Endpoint{
    protected readonly description: string = "Get the average of post fields";
    protected readonly group: Groups = Groups.Statistics;
    protected readonly method: string = 'GET'
    protected readonly route: string = '/brands/:id/statistics/reach-types'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const id = context.req.param('id') as unknown
        const { ids, days} = context.req.query();

        const brandManager = new BrandManager(<number>id, this.getPrisma());
        const posts: Post[] = await brandManager.getPosts(ids, days);

        const reachSums: {[key: string]: number} = {};
        const reachCount: {[key: string]: number} = {};

        posts.forEach(({ reach, type }) => {
            if (!reachSums[type]) {
                reachSums[type] = 0;
                reachCount[type] = 0;
            }
            reachSums[type] += reach;
            reachCount[type]++;
        });

        const averages: ReachPerType[] = [];
        for (const type in reachSums) {
            averages.push({
                key: type == 'FEED' ? 'IMAGES' : type,
                value: parseFloat(((reachSums[type] / reachCount[type]).toFixed(2)))
            });
        }

        return successResponse(context, {
            average: averages
        });
    }
}

type ReachPerType = {
    key: string,
    value: number
}