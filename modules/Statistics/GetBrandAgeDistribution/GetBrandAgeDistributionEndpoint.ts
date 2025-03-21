import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";
import {InstagramConnector} from "../../../src/utils/InstagramConnector/InstagramConnector";

export class GetBrandAgeDistributionEndpoint extends Endpoint {
    protected readonly description: string = "get the % of ages watching your content"
    protected readonly group: Groups = Groups.Statistics;
    protected readonly method: string = "get";
    protected readonly route: string = '/brands/:id/statistics/ages'
    protected schema: ZodObject<any> = z.object({});

    protected async handle(context: Context) {
        const brandId = context.req.param('id') as string;
        let {ids, days} = context.req.query();

        if(!brandId) return errorResponse(context, 'provide a valid key');

        const getAgeDistribution = await InstagramConnector.statistics().getAgeDistribution(brandId, ids, days);

        // const brandManager = new BrandManager(<number>brandId, this.getPrisma());
        // const ageDistribution = await brandManager.getAgeDistribution(ids, days);

        return successResponse(context, getAgeDistribution);
    }
}