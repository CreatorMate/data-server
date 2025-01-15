import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";

export class GetBrandCountryDistributionEndpoint extends Endpoint {
    protected readonly description: string = "get the country viewers distribution"
    protected readonly group: Groups = Groups.Statistics;
    protected readonly method: string = "get";
    protected readonly route: string = '/brands/:id/statistics/countries'
    protected schema: ZodObject<any> = z.object({})

    protected async handle(context: Context) {
        const brandId = context.req.param('id') as string;
        let {ids} = context.req.query();

        if(!brandId) return errorResponse(context, 'provide a valid key');

        const brandManager = new BrandManager(<number>brandId, this.getPrisma());
        const countries = await brandManager.getAverageCountryDistribution(ids);

        return successResponse(context, countries);
    }
}