import {Endpoint} from "../../../src/utils/Endpoint";
import {Groups} from "../../../src/lib/enums";
import {z, ZodObject} from "zod";
import {Context} from "hono";
import {errorResponse, successResponse} from "../../../src/utils/APIResponse/HttpResponse";
import BrandManager from "../../../src/managers/BrandManager";

export class GetBrandAgeDistributionEndpoint extends Endpoint {
    protected readonly description: string = "get the % of genders watching your content"
    protected readonly group: Groups = Groups.Brands;
    protected readonly method: string = "get";
    protected readonly route: string = '/brands/:id/statistics/genders'
    protected schema: ZodObject<any> = z.object({})

    protected async handle(context: Context) {
        const brandId = context.req.param('id') as unknown;
        let {ids} = context.req.query();

        if(!brandId) return errorResponse(context, 'provide a valid key');

        const brandManager = new BrandManager(<number>brandId, this.getPrisma());
        const genderDistribution = await brandManager.getGenderDistribution(ids);

        return successResponse(context, genderDistribution);
    }
}